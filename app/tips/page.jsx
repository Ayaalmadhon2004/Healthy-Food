"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Page() {
  const [tips, setTips] = useState([]);

  useEffect(() => {
    fetch("/api/health-tips")
      .then((res) => res.json())
      .then((data) => setTips(data));
  }, []);

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
                Read more !
              </Link>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
