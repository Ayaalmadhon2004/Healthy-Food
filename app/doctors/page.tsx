import { cookies } from 'next/headers';
import DoctorsListClient from '@/components/DoctorsListClient';
import { prisma } from '@/lib/prisma';
import { asLocalized, pickList } from '@/lib/types';

export const metadata = {
  title: "Doctors",
  description: "Find medical experts and health consultations for your field meals and nutrition plans.",
};

export default async function Page() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'ar';

  const doctors = await prisma.doctor.findMany();

  const doctorViews = doctors.map((d) => ({
    id: d.id,
    name: asLocalized(d.name),
    specialty: asLocalized(d.specialty),
    about: asLocalized(d.about),
    location: asLocalized(d.location),
    availability: asLocalized(d.availability),
    qualifications: { ar: pickList(d.qualifications, 'ar'), en: pickList(d.qualifications, 'en') },
    rating: d.rating,
    image: d.image,
  }));

  return <DoctorsListClient initialDoctors={doctorViews} lang={lang} />;
}