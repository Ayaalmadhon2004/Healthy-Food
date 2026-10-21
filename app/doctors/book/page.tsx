import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getServerLang } from "@/lib/i18n";
import { getReservationTargetDate } from "@/lib/dates";
import { MAX_DAYS_AHEAD, MAX_NOTE_LENGTH } from "@/lib/appointments";
import { localizedMetadata, NO_INDEX } from "@/lib/seo";
import { asLocalized } from "@/lib/types";
import BookingForm from "./BookingForm";

export function generateMetadata(): Promise<Metadata> {
  return localizedMetadata(
    "/doctors/book",
    {
      ar: { title: "طلب موعد", description: "اطلب موعداً عند طبيب." },
      en: { title: "Request an appointment", description: "Ask a doctor for a visit." },
    },
    NO_INDEX,
  );
}

const COPY = {
  ar: {
    title: "طلب موعد",
    with: "مع",
    back: "العودة إلى الأطباء",
    privacy: "سيرى الطبيب اسمك ورقم هاتفك (إن أضفته) وملاحظتك، ولا شيء غير ذلك.",
    labels: {
      date: "اليوم المناسب لك",
      note: "ملاحظة للطبيب (اختياري)",
      noteHint: "اكتب باختصار سبب الزيارة. لا تضع هنا معلومات لا تريد أن يراها إلا الطبيب.",
      submit: "أرسل الطلب",
      sending: "جارٍ الإرسال...",
      sentTitle: "وصل طلبك",
      sentBody: "سيراجع الطبيب طلبك ويؤكد الموعد. تجد حالة الطلب في صفحة مواعيدك.",
      viewMine: "مواعيدي",
    },
  },
  en: {
    title: "Request an appointment",
    with: "with",
    back: "Back to doctors",
    privacy: "The doctor will see your name, your phone number (if you added one) and your note, nothing else.",
    labels: {
      date: "Day that suits you",
      note: "Note for the doctor (optional)",
      noteHint: "Say briefly why you want to visit. Do not write anything here you only want a doctor to see elsewhere.",
      submit: "Send request",
      sending: "Sending...",
      sentTitle: "Your request was sent",
      sentBody: "The doctor will look at it and confirm the day. You can follow its status on your appointments page.",
      viewMine: "My appointments",
    },
  },
};

export default async function BookPage({ searchParams }: { searchParams: Promise<{ doctor?: string }> }) {
  const [lang, sessionUser, params] = await Promise.all([getServerLang(), getSessionUser(), searchParams]);
  if (!sessionUser) redirect("/login");

  const doctorId = Number(params.doctor);
  if (!Number.isInteger(doctorId)) notFound();
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { id: true, name: true, specialty: true } });
  if (!doctor) notFound();

  const t = COPY[lang];
  const earliest = getReservationTargetDate();
  const latest = new Date(earliest.getTime() + (MAX_DAYS_AHEAD - 1) * 86_400_000);
  const day = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="max-w-xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Link href="/doctors" className="text-link text-sm">{t.back}</Link>
      <h1 className="mt-4 text-3xl md:text-4xl font-medium text-ink">{t.title}</h1>
      <p className="mt-2 text-lg text-ink-soft">
        {t.with} {asLocalized(doctor.name)[lang]} · {asLocalized(doctor.specialty)[lang]}
      </p>
      <p className="mt-4 mb-8 text-sm text-ink-mute">{t.privacy}</p>
      <BookingForm
        doctorId={doctor.id}
        minDate={day(earliest)}
        maxDate={day(latest)}
        maxNote={MAX_NOTE_LENGTH}
        labels={t.labels}
      />
    </div>
  );
}
