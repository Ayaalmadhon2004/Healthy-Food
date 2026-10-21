"use server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getServerMessages } from "@/lib/i18n";
import {
  MAX_NOTE_LENGTH,
  canDoctorMove,
  canPatientCancel,
  isAppointmentStatus,
  parseAppointmentDate,
} from "@/lib/appointments";

type Result = { success: true } | { success: false; error: string };

function refresh() {
  revalidatePath("/dashboard/patients");
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
}

// A signed-in user asks a doctor for a visit on a given day.
export async function requestAppointmentAction(doctorId: number, date: string, note: string): Promise<Result> {
  const m = await getServerMessages();
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: m.unauthorized };

  const preferredDate = parseAppointmentDate(date);
  if (!preferredDate) return { success: false, error: m.appointmentInvalidDate };
  const cleanNote = typeof note === "string" ? note.trim() : "";
  if (!Number.isInteger(doctorId) || cleanNote.length > MAX_NOTE_LENGTH) return { success: false, error: m.invalidData };

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true, userId: true } });
  if (!doctor) return { success: false, error: m.doctorNotFound };
  if (doctor.userId === sessionUser.id) return { success: false, error: m.forbidden };

  try {
    await prisma.appointment.create({
      data: { doctorId, patientId: sessionUser.id, preferredDate, note: cleanNote || null },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: m.appointmentDuplicate };
    }
    console.error("Appointment create failed:", error);
    return { success: false, error: m.appointmentSaveFailed };
  }

  refresh();
  return { success: true };
}

// The doctor who owns the appointment confirms, completes or cancels it.
export async function updateAppointmentStatusAction(appointmentId: number, status: string): Promise<Result> {
  const m = await getServerMessages();
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "DOCTOR") return { success: false, error: m.unauthorized };
  if (!Number.isInteger(appointmentId) || !isAppointmentStatus(status)) return { success: false, error: m.invalidData };

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { status: true, doctor: { select: { userId: true } } },
  });
  if (!appointment || appointment.doctor.userId !== sessionUser.id) return { success: false, error: m.appointmentNotFound };
  if (!canDoctorMove(appointment.status, status)) return { success: false, error: m.appointmentTransition };

  try {
    // The status in the where clause keeps two quick clicks from skipping a step.
    const { count } = await prisma.appointment.updateMany({
      where: { id: appointmentId, status: appointment.status },
      data: { status },
    });
    if (count === 0) return { success: false, error: m.appointmentTransition };
  } catch (error) {
    console.error("Appointment update failed:", error);
    return { success: false, error: m.appointmentSaveFailed };
  }

  refresh();
  return { success: true };
}

// A patient withdraws their own request.
export async function cancelMyAppointmentAction(appointmentId: number): Promise<Result> {
  const m = await getServerMessages();
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { success: false, error: m.unauthorized };
  if (!Number.isInteger(appointmentId)) return { success: false, error: m.invalidData };

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { patientId: true, status: true },
  });
  if (!appointment || appointment.patientId !== sessionUser.id) return { success: false, error: m.appointmentNotFound };
  if (!canPatientCancel(appointment.status)) return { success: false, error: m.appointmentTransition };

  try {
    await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELLED" } });
  } catch (error) {
    console.error("Appointment cancel failed:", error);
    return { success: false, error: m.appointmentSaveFailed };
  }

  refresh();
  return { success: true };
}

// Admin: give an account the doctor role and attach it to a doctor profile (or detach it with an empty email).
export async function linkDoctorAccountAction(doctorId: number, email: string): Promise<Result> {
  const m = await getServerMessages();
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") return { success: false, error: m.unauthorized };
  if (!Number.isInteger(doctorId) || typeof email !== "string") return { success: false, error: m.invalidData };

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true, userId: true } });
  if (!doctor) return { success: false, error: m.doctorNotFound };

  const cleanEmail = email.trim().toLowerCase();

  try {
    if (!cleanEmail) {
      await prisma.$transaction(async (tx) => {
        if (!doctor.userId) return;
        await tx.doctor.update({ where: { id: doctorId }, data: { userId: null } });
        await tx.user.updateMany({ where: { id: doctor.userId, role: "DOCTOR" }, data: { role: "USER" } });
      });
    } else {
      const account = await prisma.user.findUnique({
        where: { email: cleanEmail },
        select: { id: true, role: true, doctorProfile: { select: { id: true } } },
      });
      if (!account) return { success: false, error: m.userNotFound };
      if (account.doctorProfile && account.doctorProfile.id !== doctorId) return { success: false, error: m.doctorAlreadyLinked };
      // Organisation and admin accounts keep their role; switching them to doctor would lock them out.
      if (account.role === "ORG" || account.role === "ADMIN") return { success: false, error: m.forbidden };

      await prisma.$transaction(async (tx) => {
        if (doctor.userId && doctor.userId !== account.id) {
          await tx.user.updateMany({ where: { id: doctor.userId, role: "DOCTOR" }, data: { role: "USER" } });
        }
        await tx.doctor.update({ where: { id: doctorId }, data: { userId: account.id } });
        await tx.user.update({ where: { id: account.id }, data: { role: "DOCTOR" } });
      });
    }
  } catch (error) {
    console.error("Doctor link failed:", error);
    return { success: false, error: m.appointmentSaveFailed };
  }

  revalidatePath("/dashboard/doctors");
  return { success: true };
}
