import Link from "@/components/LocaleLink";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { localePath, routeLang, type LangParams } from "@/lib/i18n-routing";
import { getGazaDateParts } from "@/lib/dates";
import { APPOINTMENT_STATUSES, isAppointmentStatus, nextStatuses, type AppointmentStatus } from "@/lib/appointments";
import AppointmentStatusSelect from "./AppointmentStatusSelect";

const PAGE_SIZE = 20;

const COPY = {
  ar: {
    title: "المرضى والمواعيد",
    intro: "الطلبات التي وصلتك من المرضى. أكّد الموعد أو ألغِه، وأنهِه بعد الزيارة.",
    notLinked: "حسابك غير مرتبط بملف طبيب بعد. اطلب من مدير المنصة ربطه.",
    stats: { patients: "عدد المرضى", upcoming: "مواعيد مؤكدة قادمة", pending: "طلبات تنتظر ردك" },
    all: "الكل",
    patient: "المريض",
    date: "اليوم المطلوب",
    note: "ملاحظة",
    phone: "الهاتف",
    status: "الحالة",
    empty: "لا توجد مواعيد في هذه الحالة.",
    statusLabel: "حالة الموعد",
    error: "تعذّر حفظ الحالة. حاول مرة أخرى.",
    prev: "السابق",
    next: "التالي",
    page: (n: number, total: number) => `صفحة ${n} من ${total}`,
    statuses: { PENDING: "بانتظار الرد", CONFIRMED: "مؤكد", COMPLETED: "تمت الزيارة", CANCELLED: "ملغى" } as Record<AppointmentStatus, string>,
  },
  en: {
    title: "Patients and appointments",
    intro: "Requests patients have sent you. Confirm or cancel a visit, and mark it done afterwards.",
    notLinked: "Your account is not linked to a doctor profile yet. Ask the platform admin to link it.",
    stats: { patients: "Patients", upcoming: "Confirmed upcoming", pending: "Waiting for your answer" },
    all: "All",
    patient: "Patient",
    date: "Requested day",
    note: "Note",
    phone: "Phone",
    status: "Status",
    empty: "No appointments with this status.",
    statusLabel: "Appointment status",
    error: "Could not save the status. Try again.",
    prev: "Previous",
    next: "Next",
    page: (n: number, total: number) => `Page ${n} of ${total}`,
    statuses: { PENDING: "Waiting", CONFIRMED: "Confirmed", COMPLETED: "Done", CANCELLED: "Cancelled" } as Record<AppointmentStatus, string>,
  },
};

// Reads the session cookie, so it is always rendered per request.
export const dynamic = "force-dynamic";

export default async function PatientsPage({
  params: routeParams,
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
} & LangParams) {
  const [lang, sessionUser, params] = await Promise.all([routeLang(routeParams), getSessionUser(), searchParams]);
  if (!sessionUser || sessionUser.role !== "DOCTOR") redirect(localePath(lang, "/dashboard"));

  const t = COPY[lang];
  const isAr = lang === "ar";
  const num = (n: number) => n.toLocaleString(isAr ? "ar" : "en");

  const doctor = await prisma.doctor.findUnique({ where: { userId: sessionUser.id }, select: { id: true } });
  if (!doctor) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
        <h1 className="text-3xl md:text-4xl font-medium text-ink">{t.title}</h1>
        <p className="mt-4 text-ink-soft text-lg">{t.notLinked}</p>
      </div>
    );
  }

  const statusFilter = isAppointmentStatus(params.status) ? params.status : undefined;
  const requestedPage = Math.max(1, Math.floor(Number(params.page)) || 1);
  const where = { doctorId: doctor.id, ...(statusFilter ? { status: statusFilter } : {}) };
  // Appointment days are stored as that calendar day at 00:00 UTC.
  const { year, month, day } = getGazaDateParts();
  const todayUtc = new Date(Date.UTC(year, month - 1, day));

  const total = await prisma.appointment.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const [appointments, grouped, patients, upcoming] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: [{ preferredDate: "asc" }, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, preferredDate: true, note: true, status: true, patient: { select: { name: true, phone: true } } },
    }),
    prisma.appointment.groupBy({ by: ["status"], where: { doctorId: doctor.id }, _count: { _all: true } }),
    prisma.appointment.groupBy({ by: ["patientId"], where: { doctorId: doctor.id, status: { not: "CANCELLED" } } }),
    prisma.appointment.count({ where: { doctorId: doctor.id, status: "CONFIRMED", preferredDate: { gte: todayUtc } } }),
  ]);
  const counts = new Map(grouped.map((g) => [g.status, g._count._all]));
  const allCount = grouped.reduce((sum, g) => sum + g._count._all, 0);

  const dateFormat = new Intl.DateTimeFormat(isAr ? "ar" : "en", { dateStyle: "medium", timeZone: "UTC" });
  const href = (status: string | undefined, p = 1) => {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `/dashboard/patients?${s}` : "/dashboard/patients";
  };

  const tabs: { key: string | undefined; label: string; count: number }[] = [
    { key: undefined, label: t.all, count: allCount },
    ...APPOINTMENT_STATUSES.map((s) => ({ key: s as string | undefined, label: t.statuses[s], count: counts.get(s) ?? 0 })),
  ];
  const stats = [
    { title: t.stats.patients, value: num(patients.length) },
    { title: t.stats.upcoming, value: num(upcoming) },
    { title: t.stats.pending, value: num(counts.get("PENDING") ?? 0) },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <header className="mb-8 text-start">
        <h1 className="text-3xl md:text-4xl font-medium text-ink">{t.title}</h1>
        <p className="text-ink-soft text-lg mt-2 max-w-2xl">{t.intro}</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 mb-10">
        {stats.map((s) => (
          <div key={s.title} className="border-t-2 border-ink pt-3">
            <p className="text-sm text-ink-soft font-medium">{s.title}</p>
            <p className="text-4xl font-medium text-ink mt-1 tabular-nums font-display">{s.value}</p>
          </div>
        ))}
      </div>

      <nav aria-label={t.status} className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.key ?? "all"}
            href={href(tab.key)}
            aria-current={tab.key === statusFilter ? "page" : undefined}
            className="chip"
          >
            {tab.label} <span className="tabular-nums opacity-80">({num(tab.count)})</span>
          </Link>
        ))}
      </nav>

      <div className="surface overflow-hidden">
        {appointments.length === 0 ? (
          <p className="p-10 text-center text-ink-mute">{t.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start">
              <thead className="bg-paper-deep border-b border-line">
                <tr>
                  {[t.patient, t.date, t.note, t.phone, t.status].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3 text-start text-sm font-medium text-ink-mute">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line align-top">
                {appointments.map((a) => {
                  const status = isAppointmentStatus(a.status) ? a.status : "PENDING";
                  return (
                    <tr key={a.id}>
                      <th scope="row" className="px-5 py-4 text-start font-medium text-ink">{a.patient.name}</th>
                      <td className="px-5 py-4 text-ink-soft whitespace-nowrap">{dateFormat.format(a.preferredDate)}</td>
                      <td className="px-5 py-4 text-ink-soft min-w-56 max-w-md whitespace-pre-line">{a.note ?? "—"}</td>
                      <td className="px-5 py-4 text-ink-soft whitespace-nowrap" dir="ltr">{a.patient.phone ?? "—"}</td>
                      <td className="px-5 py-4">
                        <AppointmentStatusSelect
                          appointmentId={a.id}
                          status={status}
                          options={nextStatuses(status)}
                          labels={t.statuses}
                          ariaLabel={`${t.statusLabel}: ${a.patient.name}`}
                          errorText={t.error}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav aria-label={t.page(page, totalPages)} className="mt-6 flex items-center justify-between gap-4">
          {page > 1 ? <Link className="text-link" href={href(statusFilter, page - 1)}>{t.prev}</Link> : <span />}
          <span className="text-sm text-ink-mute">{t.page(page, totalPages)}</span>
          {page < totalPages ? <Link className="text-link" href={href(statusFilter, page + 1)}>{t.next}</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
