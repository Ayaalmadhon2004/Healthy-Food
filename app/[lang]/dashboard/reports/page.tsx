import Link from "@/components/LocaleLink";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, isOrgRole } from "@/lib/auth";
import { localePath, routeLang, type LangParams } from "@/lib/i18n-routing";
import { isReportStatus, REPORT_STATUSES, type ReportStatus } from "@/lib/reportStatus";
import ReportStatusSelect from "./ReportStatusSelect";

const PAGE_SIZE = 15;

const COPY = {
  ar: {
    title: "بلاغات المناطق",
    intro: "بلاغات وصلتنا من سكان مناطق لا يصلها التوزيع. غيّر الحالة بعد مراجعة كل بلاغ.",
    all: "الكل",
    area: "المنطقة",
    description: "الوصف",
    reporter: "المُبلّغ",
    date: "التاريخ",
    status: "الحالة",
    empty: "لا توجد بلاغات في هذه الحالة.",
    statusLabel: "حالة البلاغ",
    error: "تعذّر حفظ الحالة. حاول مرة أخرى.",
    prev: "السابق",
    next: "التالي",
    page: (n: number, total: number) => `صفحة ${n} من ${total}`,
    statuses: { pending: "قيد المراجعة", seen: "تمت المشاهدة", investigated: "تم التحقق" } as Record<ReportStatus, string>,
  },
  en: {
    title: "Area reports",
    intro: "Reports from residents of areas the distribution does not reach. Update the status once you have looked into each one.",
    all: "All",
    area: "Area",
    description: "Description",
    reporter: "Reported by",
    date: "Date",
    status: "Status",
    empty: "No reports with this status.",
    statusLabel: "Report status",
    error: "Could not save the status. Try again.",
    prev: "Previous",
    next: "Next",
    page: (n: number, total: number) => `Page ${n} of ${total}`,
    statuses: { pending: "Pending", seen: "Seen", investigated: "Investigated" } as Record<ReportStatus, string>,
  },
};

// Reads the session cookie, so it is always rendered per request.
export const dynamic = "force-dynamic";

export default async function ReportsPage({
  params: routeParams,
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
} & LangParams) {
  const [lang, sessionUser, params] = await Promise.all([routeLang(routeParams), getSessionUser(), searchParams]);
  if (!sessionUser || !isOrgRole(sessionUser.role)) redirect(localePath(lang, "/dashboard"));

  const t = COPY[lang];
  const isAr = lang === "ar";
  const statusFilter = isReportStatus(params.status) ? params.status : undefined;
  const requestedPage = Math.max(1, Math.floor(Number(params.page)) || 1);
  const where = statusFilter ? { status: statusFilter } : {};

  const total = await prisma.areaReport.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const [reports, grouped] = await Promise.all([
    prisma.areaReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, areaName: true, description: true, status: true, createdAt: true, user: { select: { name: true } } },
    }),
    prisma.areaReport.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const counts = new Map(grouped.map((g) => [g.status, g._count._all]));
  const allCount = grouped.reduce((sum, g) => sum + g._count._all, 0);

  const dateFormat = new Intl.DateTimeFormat(isAr ? "ar" : "en", { dateStyle: "medium" });
  const href = (status: string | undefined, p = 1) => {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `/dashboard/reports?${s}` : "/dashboard/reports";
  };

  const tabs: { key: string | undefined; label: string; count: number }[] = [
    { key: undefined, label: t.all, count: allCount },
    ...REPORT_STATUSES.map((s) => ({ key: s as string | undefined, label: t.statuses[s], count: counts.get(s) ?? 0 })),
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <header className="mb-8 text-start">
        <h1 className="text-3xl md:text-4xl font-medium text-ink">{t.title}</h1>
        <p className="text-ink-soft text-lg mt-2 max-w-2xl">{t.intro}</p>
      </header>

      <nav aria-label={t.status} className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const active = tab.key === statusFilter;
          return (
            <Link
              key={tab.key ?? "all"}
              href={href(tab.key)}
              aria-current={active ? "page" : undefined}
              className="chip"
            >
              {tab.label} <span className="tabular-nums opacity-80">({tab.count.toLocaleString(isAr ? "ar" : "en")})</span>
            </Link>
          );
        })}
      </nav>

      <div className="surface overflow-hidden">
        {reports.length === 0 ? (
          <p className="p-10 text-center text-ink-mute">{t.empty}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start">
              <thead className="bg-paper-deep border-b border-line">
                <tr>
                  {[t.area, t.description, t.reporter, t.date, t.status].map((h) => (
                    <th key={h} scope="col" className="px-5 py-3 text-start text-sm font-medium text-ink-mute">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line align-top">
                {reports.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="px-5 py-4 text-start font-medium text-ink">{r.areaName}</th>
                    <td className="px-5 py-4 text-ink-soft min-w-64 max-w-md whitespace-pre-line">{r.description}</td>
                    <td className="px-5 py-4 text-ink-soft">{r.user.name}</td>
                    <td className="px-5 py-4 text-ink-soft whitespace-nowrap">{dateFormat.format(r.createdAt)}</td>
                    <td className="px-5 py-4">
                      <ReportStatusSelect
                        reportId={r.id}
                        status={isReportStatus(r.status) ? r.status : "pending"}
                        labels={t.statuses}
                        ariaLabel={`${t.statusLabel}: ${r.areaName}`}
                        errorText={t.error}
                      />
                    </td>
                  </tr>
                ))}
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
