import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { localePath, routeLang, type LangParams } from "@/lib/i18n-routing";
import { asLocalized } from "@/lib/types";
import LinkDoctorForm from "./LinkDoctorForm";

const COPY = {
  ar: {
    title: "حسابات الأطباء",
    intro: "اربط كل ملف طبيب بحساب مسجّل في المنصة. يصبح صاحب الحساب طبيباً ويرى مرضاه ومواعيده. الحساب يجب أن يكون مسجلاً مسبقاً.",
    email: "بريد حساب الطبيب",
    link: "ربط",
    unlink: "فك الربط",
    saved: "تم الحفظ.",
    linked: "مرتبط بـ",
    notLinked: "غير مرتبط",
  },
  en: {
    title: "Doctor accounts",
    intro: "Link each doctor profile to a registered account. The account owner becomes a doctor and sees their patients and appointments. The account must already be signed up.",
    email: "Doctor's account email",
    link: "Link",
    unlink: "Unlink",
    saved: "Saved.",
    linked: "Linked to",
    notLinked: "Not linked",
  },
};

// Reads the session cookie, so it is always rendered per request.
export const dynamic = "force-dynamic";

export default async function DoctorAccountsPage({ params }: LangParams) {
  const [lang, sessionUser] = await Promise.all([routeLang(params), getSessionUser()]);
  if (!sessionUser || sessionUser.role !== "ADMIN") redirect(localePath(lang, "/dashboard"));

  const t = COPY[lang];
  const isAr = lang === "ar";
  const doctors = await prisma.doctor.findMany({
    orderBy: { id: "asc" },
    select: { id: true, name: true, specialty: true, user: { select: { email: true } } },
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto" dir={isAr ? "rtl" : "ltr"}>
      <header className="mb-8 text-start">
        <h1 className="text-3xl md:text-4xl font-medium text-ink">{t.title}</h1>
        <p className="text-ink-soft text-lg mt-2 max-w-2xl">{t.intro}</p>
      </header>

      <ul className="surface divide-y divide-line">
        {doctors.map((d) => (
          <li key={d.id} className="p-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-medium text-ink">{asLocalized(d.name)[lang]}</h2>
              <p className="text-sm text-ink-soft">{asLocalized(d.specialty)[lang]}</p>
              <p className="mt-1 text-sm text-ink-mute">
                {d.user ? <>{t.linked} <span dir="ltr">{d.user.email}</span></> : t.notLinked}
              </p>
            </div>
            <LinkDoctorForm
              doctorId={d.id}
              linkedEmail={d.user?.email ?? null}
              labels={{ email: t.email, link: t.link, unlink: t.unlink, saved: t.saved }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
