import Link from "@/components/LocaleLink";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { localePath, routeLang, type LangParams } from "@/lib/i18n-routing";
import { canPatientCancel, isAppointmentStatus, type AppointmentStatus } from "@/lib/appointments";
import { asLocalized } from "@/lib/types";
import CancelButton from "./CancelButton";
import MarkNotificationsRead from "./MarkNotificationsRead";

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
    updates: "آخر التحديثات",
    newBadge: "جديد",
    message: {
      CONFIRMED: (doctor: string, day: string) => `${doctor} أكّد موعدك يوم ${day}.`,
      COMPLETED: (doctor: string, day: string) => `تم تسجيل زيارتك عند ${doctor} يوم ${day} كمنتهية.`,
      CANCELLED: (doctor: string, day: string) => `${doctor} ألغى موعدك يوم ${day}.`,
    } as Record<string, (doctor: string, day: string) => string>,
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
    updates: "Latest updates",
    newBadge: "New",
    message: {
      CONFIRMED: (doctor: string, day: string) => `${doctor} confirmed your appointment on ${day}.`,
      COMPLETED: (doctor: string, day: string) => `Your visit with ${doctor} on ${day} was marked as done.`,
      CANCELLED: (doctor: string, day: string) => `${doctor} cancelled your appointment on ${day}.`,
    } as Record<string, (doctor: string, day: string) => string>,
    statuses: { PENDING: "Waiting for the doctor", CONFIRMED: "Confirmed", COMPLETED: "Done", CANCELLED: "Cancelled" } as Record<AppointmentStatus, string>,
  },
};

// Reads the session cookie, so it is always rendered per request.
export const dynamic = "force-dynamic";

export default async function MyAppointmentsPage({ params }: LangParams) {
  const [lang, sessionUser] = await Promise.all([routeLang(params), getSessionUser()]);
  if (!sessionUser) redirect(localePath(lang, "/login"));

  const t = COPY[lang];
  const isAr = lang === "ar";
  const [appointments, updates] = await Promise.all([
    prisma.appointment.findMany({
      where: { patientId: sessionUser.id },
      orderBy: { preferredDate: "desc" },
      take: 100,
      select: { id: true, preferredDate: true, note: true, status: true, doctor: { select: { name: true, specialty: true } } },
    }),
    prisma.notification.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, status: true, doctorName: true, visitDate: true, read: true, createdAt: true },
    }),
  ]);
  const hasUnread = updates.some((u) => !u.read);
  const dateFormat = new Intl.DateTimeFormat(isAr ? "ar" : "en", { dateStyle: "medium", timeZone: "UTC" });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <header className="mb-8 text-start">
        <h1 className="text-3xl md:text-4xl font-medium text-ink">{t.title}</h1>
        <p className="text-ink-soft text-lg mt-2">{t.intro}</p>
      </header>

      {updates.length > 0 && (
        <section aria-labelledby="updates-heading" className="mb-10">
          <h2 id="updates-heading" className="text-xl font-medium text-ink mb-3">{t.updates}</h2>
          <ul className="surface divide-y divide-line">
            {updates.map((u) => {
              const text = t.message[u.status]?.(asLocalized(u.doctorName)[lang], dateFormat.format(u.visitDate));
              if (!text) return null;
              return (
                <li key={u.id} className="px-5 py-3 flex items-start justify-between gap-4">
                  <p className={u.read ? "text-ink-soft" : "text-ink font-medium"}>
                    {!u.read && <span className="me-2 inline-block rounded bg-olive-100 px-1.5 py-0.5 text-xs text-olive-900">{t.newBadge}</span>}
                    {text}
                  </p>
                  <time dateTime={u.createdAt.toISOString()} className="shrink-0 text-sm text-ink-mute">
                    {dateFormat.format(u.createdAt)}
                  </time>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {hasUnread && <MarkNotificationsRead />}

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
