import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getServerLang } from "@/lib/i18n";
import { canPatientCancel, isAppointmentStatus, type AppointmentStatus } from "@/lib/appointments";
import { asLocalized } from "@/lib/types";
import CancelButton from "./CancelButton";

const COPY = {
  ar: {
    title: "مواعيدي",
    intro: "الطلبات التي أرسلتها للأطباء وحالة كل واحد منها.",
    empty: "لم تطلب أي موعد بعد.",
    find: "تصفّح الأطباء",
    doctor: "الطبيب",
    date: "اليوم المطلوب",
    note: "ملاحظتك",
    status: "الحالة",
    cancel: "إلغاء الطلب",
    error: "تعذّر الإلغاء. حاول مرة أخرى.",
    statuses: { PENDING: "بانتظار رد الطبيب", CONFIRMED: "مؤكد", COMPLETED: "تمت الزيارة", CANCELLED: "ملغى" } as Record<AppointmentStatus, string>,
  },
  en: {
    title: "My appointments",
    intro: "The requests you sent to doctors and where each one stands.",
    empty: "You have not asked for an appointment yet.",
    find: "Browse doctors",
    doctor: "Doctor",
    date: "Requested day",
    note: "Your note",
    status: "Status",
    cancel: "Cancel request",
    error: "Could not cancel. Try again.",
    statuses: { PENDING: "Waiting for the doctor", CONFIRMED: "Confirmed", COMPLETED: "Done", CANCELLED: "Cancelled" } as Record<AppointmentStatus, string>,
  },
};

export default async function MyAppointmentsPage() {
  const [lang, sessionUser] = await Promise.all([getServerLang(), getSessionUser()]);
  if (!sessionUser) redirect("/login");

  const t = COPY[lang];
  const isAr = lang === "ar";
  const appointments = await prisma.appointment.findMany({
    where: { patientId: sessionUser.id },
    orderBy: { preferredDate: "desc" },
    take: 100,
    select: { id: true, preferredDate: true, note: true, status: true, doctor: { select: { name: true, specialty: true } } },
  });
  const dateFormat = new Intl.DateTimeFormat(isAr ? "ar" : "en", { dateStyle: "medium", timeZone: "UTC" });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <header className="mb-8 text-start">
        <h1 className="text-3xl md:text-4xl font-medium text-ink">{t.title}</h1>
        <p className="text-ink-soft text-lg mt-2">{t.intro}</p>
      </header>

      {appointments.length === 0 ? (
        <div className="surface p-10 text-center">
          <p className="text-ink-mute">{t.empty}</p>
          <Link href="/doctors" className="text-link mt-3 inline-block">{t.find}</Link>
        </div>
      ) : (
        <div className="surface overflow-x-auto">
          <table className="w-full border-collapse text-start">
            <thead className="bg-paper-deep border-b border-line">
              <tr>
                {[t.doctor, t.date, t.note, t.status].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3 text-start text-sm font-medium text-ink-mute">{h}</th>
                ))}
                <th scope="col" className="px-5 py-3"><span className="sr-only">{t.cancel}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line align-top">
              {appointments.map((a) => (
                <tr key={a.id}>
                  <th scope="row" className="px-5 py-4 text-start font-medium text-ink">
                    {asLocalized(a.doctor.name)[lang]}
                    <span className="block text-sm font-normal text-ink-soft">{asLocalized(a.doctor.specialty)[lang]}</span>
                  </th>
                  <td className="px-5 py-4 text-ink-soft whitespace-nowrap">{dateFormat.format(a.preferredDate)}</td>
                  <td className="px-5 py-4 text-ink-soft min-w-48 max-w-sm whitespace-pre-line">{a.note ?? "—"}</td>
                  <td className="px-5 py-4 text-ink">{t.statuses[isAppointmentStatus(a.status) ? a.status : "PENDING"]}</td>
                  <td className="px-5 py-4 text-end">
                    {canPatientCancel(a.status) && <CancelButton appointmentId={a.id} label={t.cancel} errorText={t.error} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
