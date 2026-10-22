import type { Metadata } from "next";
import DoctorsListClient from "@/components/DoctorsListClient";
import { getDoctors } from "@/lib/data";
import { routeLang, type LangParams } from "@/lib/i18n-routing";
import { localizedMetadata } from "@/lib/seo";
import { asLocalized, pickList } from "@/lib/types";

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  return localizedMetadata(await routeLang(params), "/doctors", {
    ar: {
      title: "الأطباء",
      description: "أطباء وأخصائيو تغذية يجيبون عن أسئلتك الصحية، مع تخصص كل منهم ومكانه ومواعيده.",
    },
    en: {
      title: "Our doctors",
      description: "Physicians and dietitians who can answer your health questions, with their field, location and availability.",
    },
  });
}

export default async function Page({ params }: LangParams) {
  const [lang, doctors] = await Promise.all([routeLang(params), getDoctors()]);

  const doctorViews = doctors.map((d) => ({
    id: d.id,
    name: asLocalized(d.name),
    specialty: asLocalized(d.specialty),
    about: asLocalized(d.about),
    location: asLocalized(d.location),
    availability: asLocalized(d.availability),
    qualifications: { ar: pickList(d.qualifications, "ar"), en: pickList(d.qualifications, "en") },
    rating: d.rating,
    image: d.image,
  }));

  return <DoctorsListClient initialDoctors={doctorViews} lang={lang} />;
}
