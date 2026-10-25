// No hooks or handlers here, so this renders on the server and ships no JavaScript of its own.
import Link from "@/components/LocaleLink";
import { MapPin, Calendar, Award, Star } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import { whatsappLink } from "@/lib/contact";
import { doctorPhoto } from "@/lib/placeholders";
import { toLang, type Lang, type Localized } from "@/lib/types";

export interface DoctorView {
  id: number;
  name: Localized;
  specialty: Localized;
  about: Localized;
  location: Localized;
  availability: Localized;
  qualifications: Record<Lang, string[]>;
  rating: number;
  image: string;
}

export default function DoctorsListClient({ initialDoctors, lang: langProp }: { initialDoctors: DoctorView[]; lang: string }) {
  const lang = toLang(langProp);
  const isAr = lang === "ar";

  return (
    <div
      className="max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-16 pb-20"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="mb-10 md:mb-14 max-w-2xl">
        <h1 className="text-3xl md:text-5xl font-medium text-ink">
          {isAr ? "الأطباء" : "Our doctors"}
        </h1>
        <p className="mt-4 text-lg text-ink-soft leading-relaxed">
          {isAr
            ? "أطباء وأخصائيو تغذية يجيبون عن أسئلتك الصحية. تجد هنا تخصص كل منهم ومكانه ومواعيده."
            : "Physicians and dietitians who can answer your health questions. Each one lists their field, where they work and when they are available."}
        </p>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {initialDoctors.map((doctor) => {
          const name = doctor.name[lang];
          return (
          <article
            key={doctor.id}
            className="surface card-lift p-5 md:p-6 flex flex-col"
          >
            <div className="flex gap-5">
              <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 overflow-hidden rounded-lg border border-line bg-paper-deep">
                <SafeImage
                  src={doctorPhoto(doctor.image)}
                  kind="doctor"
                  seed={doctor.id}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-ink leading-snug">
                  {name}
                </h2>
                <p className="text-clay-700 font-medium text-[0.9375rem] mt-0.5">
                  {doctor.specialty[lang]}
                </p>

                <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                  <li className="flex items-center gap-2">
                    <MapPin size={15} strokeWidth={1.75} className="text-ink-mute shrink-0" aria-hidden="true" />
                    <span>{doctor.location[lang]}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar size={15} strokeWidth={1.75} className="text-ink-mute shrink-0" aria-hidden="true" />
                    <span>{doctor.availability[lang]}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star size={15} strokeWidth={1.75} className="text-ochre-600 shrink-0" aria-hidden="true" />
                    <span>
                      <span className="sr-only">{isAr ? "التقييم: " : "Rating: "}</span>
                      {doctor.rating}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* About */}
            <p className="mt-5 text-ink leading-relaxed line-clamp-3">
              {doctor.about[lang]}
            </p>

            {/* Qualifications */}
            {doctor.qualifications[lang].length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
                {doctor.qualifications[lang].map((q, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <Award size={14} strokeWidth={1.75} className="text-olive-700 shrink-0" aria-hidden="true" />
                    {q}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link href={`/doctors/book?doctor=${doctor.id}`} className="btn min-h-11">
                {isAr ? "اطلب موعداً" : "Request an appointment"}
              </Link>
              <a
                href={whatsappLink(
                  isAr
                    ? `مرحباً، أرغب بحجز موعد مع ${name} (${doctor.specialty.ar}).`
                    : `Hello, I would like to book an appointment with ${name} (${doctor.specialty.en}).`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link text-sm"
              >
                {isAr ? "أو تواصل عبر واتساب" : "Or message us on WhatsApp"}
                <span className="sr-only">{isAr ? " (يفتح في نافذة جديدة)" : " (opens in a new tab)"}</span>
              </a>
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}
