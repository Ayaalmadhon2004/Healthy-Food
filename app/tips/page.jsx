// app/tips/page.js
import Link from "next/link";

export const revalidate = 60; // ISR: تحديث البيانات كل 60 ثانية

async function getTips() {
  const res = await fetch("http://localhost:3000/api/health-tips", { cache: "force-cache" });
  if (!res.ok) throw new Error("Failed to fetch tips");
  return res.json();
}

export default async function TipsPage() {
  const tips = await getTips();

  return (
    <div className="bg-[var(--color-primary-light)] min-h-screen p-4 md:p-10">
      <div className="container mx-auto">
        <h1 className="text-xl md:text-3xl font-bold">Health & Nutrition Tips</h1>
        <p className="pb-3 text-gray-700">Some helpful tips for a healthier life.</p>

        {tips.map((item) => (
          <div key={item.id} className="mb-6">
            <h3 className="pt-4 pb-2 md:pt-6 md:pb-3 font-bold">{item.header}</h3>

            <div className="bg-[var(--color-white)] shadow-lg rounded-xl p-4 md:p-6 w-full">
              <div className="flex items-center justify-between bg-[rgba(250, 243, 230, 1)] p-3 md:p-4 rounded-lg">
                <p className="text-2xl">{item.icon}</p>
                <span className="font-semibold">{item.header}</span>
              </div>

              <p className="font-medium mt-2">{item.advice}</p>
              <p className="text-gray-500 mb-3">{item.details}</p>

              <Link
                className="text-[var(--color-black)] no-underline bg-[var(--color-primary-light)] rounded-xl p-2 inline-block"
                href={`/tips/${item.id}`}
              >
                Read more!
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
