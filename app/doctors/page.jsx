import { cookies } from 'next/headers';
import DoctorsListClient from '@/components/DoctorsListClient';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: "Doctors | NutriFlow",
  description: "Find medical experts and health consultations for your field meals and nutrition plans.",
};

export default async function Page() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'ar';

  const doctors = await prisma.doctor.findMany();

  return <DoctorsListClient initialDoctors={doctors} lang={lang} />;
}