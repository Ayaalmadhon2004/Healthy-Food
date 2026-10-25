import { after, afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { MAX_APPOINTMENTS_PER_DAY, canDoctorMove, canPatientCancel, nextStatuses, parseAppointmentDate } from "../lib/appointments.ts";
import { cleanup, createDoctor, createUser, hasDatabase, prisma, signInAs } from "./helpers/db.js";
import {
  cancelMyAppointmentAction,
  linkDoctorAccountAction,
  markNotificationsReadAction,
  requestAppointmentAction,
  updateAppointmentStatusAction,
} from "../app/actions/appointmentActions.ts";

after(cleanup);
afterEach(() => signInAs(null));

// 12:00 UTC on 10 June is 15:00 in Gaza, still 10 June, so the earliest bookable day is the 11th.
const NOW = new Date("2026-06-10T12:00:00Z");

describe("appointment rules", () => {
  it("accepts days from tomorrow up to 60 days ahead", () => {
    assert.equal(parseAppointmentDate("2026-06-11", NOW)?.toISOString(), "2026-06-11T00:00:00.000Z");
    assert.ok(parseAppointmentDate("2026-08-09", NOW));
    assert.equal(parseAppointmentDate("2026-06-10", NOW), null);
    assert.equal(parseAppointmentDate("2026-08-10", NOW), null);
  });

  it("rejects malformed and impossible dates", () => {
    for (const v of ["", "11/06/2026", "2026-02-30", "2026-6-11", null, undefined, 20260611]) {
      assert.equal(parseAppointmentDate(v, NOW), null, String(v));
    }
  });

  it("only moves forward through the statuses", () => {
    assert.deepEqual(nextStatuses("PENDING"), ["CONFIRMED", "CANCELLED"]);
    assert.ok(canDoctorMove("CONFIRMED", "COMPLETED"));
    assert.ok(!canDoctorMove("PENDING", "COMPLETED"));
    assert.ok(!canDoctorMove("COMPLETED", "CANCELLED"));
    assert.ok(!canDoctorMove("CANCELLED", "CONFIRMED"));
    assert.ok(!canDoctorMove("PENDING", "nonsense"));
    assert.ok(canPatientCancel("PENDING") && canPatientCancel("CONFIRMED"));
    assert.ok(!canPatientCancel("COMPLETED") && !canPatientCancel("CANCELLED"));
  });
});

function tomorrowPlus(days) {
  const d = new Date(Date.now() + (days + 1) * 86_400_000);
  return d.toISOString().slice(0, 10);
}

describe("appointmentActions (real Postgres)", { skip: !hasDatabase && "DATABASE_URL is not set" }, () => {
  it("lets a signed-in user request a visit once per doctor and day", async () => {
    const doctor = await createDoctor();
    const patient = await createUser();

    signInAs(null);
    assert.deepEqual(await requestAppointmentAction(doctor.id, tomorrowPlus(1), ""), { success: false, error: "Unauthorized" });

    signInAs(patient);
    assert.equal((await requestAppointmentAction(doctor.id, "2020-01-01", "")).success, false);
    assert.equal((await requestAppointmentAction(doctor.id, tomorrowPlus(1), "x".repeat(501))).success, false);
    assert.deepEqual(await requestAppointmentAction(doctor.id + 100000, tomorrowPlus(1), ""), { success: false, error: "Doctor not found" });

    assert.deepEqual(await requestAppointmentAction(doctor.id, tomorrowPlus(1), "  headaches  "), { success: true });
    const stored = await prisma.appointment.findFirst({ where: { doctorId: doctor.id, patientId: patient.id } });
    assert.equal(stored.status, "PENDING");
    assert.equal(stored.note, "headaches");

    assert.deepEqual(await requestAppointmentAction(doctor.id, tomorrowPlus(1), ""), {
      success: false,
      error: "You already asked this doctor for that day",
    });
    assert.deepEqual(await requestAppointmentAction(doctor.id, tomorrowPlus(2), ""), { success: true });
  });

  it("refuses a booking once the doctor's day is full, and frees the slot on cancel", async () => {
    const doctor = await createDoctor();
    const day = tomorrowPlus(3);
    for (let i = 0; i < MAX_APPOINTMENTS_PER_DAY; i++) {
      signInAs(await createUser());
      assert.deepEqual(await requestAppointmentAction(doctor.id, day, ""), { success: true });
    }
    const late = await createUser();
    signInAs(late);
    assert.deepEqual(await requestAppointmentAction(doctor.id, day, ""), {
      success: false,
      error: "This doctor is fully booked that day, please choose another",
    });
    assert.deepEqual(await requestAppointmentAction(doctor.id, tomorrowPlus(4), ""), { success: true });

    const one = await prisma.appointment.findFirst({ where: { doctorId: doctor.id, preferredDate: new Date(`${day}T00:00:00Z`) } });
    await prisma.appointment.update({ where: { id: one.id }, data: { status: "CANCELLED" } });
    assert.deepEqual(await requestAppointmentAction(doctor.id, day, ""), { success: true });
  });

  it("lets only the linked doctor move an appointment, one step at a time", async () => {
    const doctorUser = await createUser("DOCTOR");
    const otherDoctorUser = await createUser("DOCTOR");
    const doctor = await createDoctor({ userId: doctorUser.id });
    const patient = await createUser();
    signInAs(patient);
    await requestAppointmentAction(doctor.id, tomorrowPlus(1), "");
    const { id } = await prisma.appointment.findFirst({ where: { doctorId: doctor.id } });

    signInAs(patient);
    assert.equal((await updateAppointmentStatusAction(id, "CONFIRMED")).success, false);
    signInAs(otherDoctorUser);
    assert.deepEqual(await updateAppointmentStatusAction(id, "CONFIRMED"), { success: false, error: "Appointment not found" });

    signInAs(doctorUser);
    assert.deepEqual(await updateAppointmentStatusAction(id, "COMPLETED"), {
      success: false,
      error: "That change is not allowed for this appointment",
    });
    assert.equal((await updateAppointmentStatusAction(id, "bogus")).success, false);
    assert.deepEqual(await updateAppointmentStatusAction(id, "CONFIRMED"), { success: true });
    assert.deepEqual(await updateAppointmentStatusAction(id, "COMPLETED"), { success: true });
    assert.equal((await updateAppointmentStatusAction(id, "CANCELLED")).success, false);
  });

  it("tells the patient about every status change the doctor makes, and only those", async () => {
    const doctorUser = await createUser("DOCTOR");
    const doctor = await createDoctor({ userId: doctorUser.id, name: { ar: "د. ليلى", en: "Dr. Layla" } });
    const patient = await createUser();
    signInAs(patient);
    await requestAppointmentAction(doctor.id, tomorrowPlus(1), "");
    const appointment = await prisma.appointment.findFirst({ where: { patientId: patient.id } });
    const mine = () => prisma.notification.findMany({ where: { userId: patient.id }, orderBy: { id: "asc" } });

    assert.equal((await mine()).length, 0, "requesting a visit notifies nobody");

    signInAs(doctorUser);
    await updateAppointmentStatusAction(appointment.id, "COMPLETED");
    assert.equal((await mine()).length, 0, "a refused change notifies nobody");

    await updateAppointmentStatusAction(appointment.id, "CONFIRMED");
    await updateAppointmentStatusAction(appointment.id, "COMPLETED");
    const notes = await mine();
    assert.deepEqual(notes.map((n) => [n.status, n.read, n.appointmentId]), [
      ["CONFIRMED", false, appointment.id],
      ["COMPLETED", false, appointment.id],
    ]);
    assert.deepEqual(notes[0].doctorName, { ar: "د. ليلى", en: "Dr. Layla" });
    assert.equal(notes[0].visitDate.toISOString(), appointment.preferredDate.toISOString());

    signInAs(null);
    assert.equal((await markNotificationsReadAction()).success, false);
    signInAs(await createUser());
    assert.deepEqual(await markNotificationsReadAction(), { success: true });
    assert.ok((await mine()).every((n) => !n.read), "someone else's updates stay unread");

    signInAs(patient);
    assert.deepEqual(await markNotificationsReadAction(), { success: true });
    assert.ok((await mine()).every((n) => n.read));
  });

  it("lets a patient cancel only their own open appointment", async () => {
    const doctor = await createDoctor();
    const patient = await createUser();
    const stranger = await createUser();
    signInAs(patient);
    await requestAppointmentAction(doctor.id, tomorrowPlus(1), "");
    const { id } = await prisma.appointment.findFirst({ where: { patientId: patient.id } });

    signInAs(stranger);
    assert.deepEqual(await cancelMyAppointmentAction(id), { success: false, error: "Appointment not found" });
    signInAs(patient);
    assert.deepEqual(await cancelMyAppointmentAction(id), { success: true });
    assert.equal((await cancelMyAppointmentAction(id)).success, false);
  });

  it("lets only an admin link and unlink a doctor account", async () => {
    const doctor = await createDoctor();
    const account = await createUser();
    const other = await createDoctor();
    const org = await createUser("ORG");

    for (const user of [null, account]) {
      signInAs(user);
      assert.deepEqual(await linkDoctorAccountAction(doctor.id, account.email), { success: false, error: "Unauthorized" });
    }

    signInAs(await createUser("ADMIN"));
    assert.deepEqual(await linkDoctorAccountAction(doctor.id, "nobody@tests.invalid"), { success: false, error: "No account with that email" });
    assert.equal((await linkDoctorAccountAction(doctor.id, org.email)).success, false);

    assert.deepEqual(await linkDoctorAccountAction(doctor.id, account.email.toUpperCase()), { success: true });
    assert.equal((await prisma.user.findUnique({ where: { id: account.id } })).role, "DOCTOR");
    assert.equal((await prisma.doctor.findUnique({ where: { id: doctor.id } })).userId, account.id);
    assert.deepEqual(await linkDoctorAccountAction(other.id, account.email), { success: false, error: "That account is already linked to another doctor" });

    assert.deepEqual(await linkDoctorAccountAction(doctor.id, ""), { success: true });
    assert.equal((await prisma.user.findUnique({ where: { id: account.id } })).role, "USER");
    assert.equal((await prisma.doctor.findUnique({ where: { id: doctor.id } })).userId, null);
  });
});
