import { cookies } from 'next/headers';
import DoctorsListClient from '@/components/DoctorsListClient';

export default async function Page() {
  const cookieStore = await cookies();
  const lang = cookieStore.get('lang')?.value || 'ar';

  // نجلب البيانات هنا في السيرفر ونمررها للـ Client
  const doctors = await prisma.doctor.findMany();

  return <DoctorsListClient initialDoctors={doctors} lang={lang} />;
}