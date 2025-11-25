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
    <div className="bg-[var(--color-primary-light)] w-full h-full px-36 py-4">
      <h1 className="text-2xl font-bold">Health & Nutrition Tips</h1>
      <p className="pb-3">Some helpful tips for a healthier life.</p>

      {tips.map((item) => (
        <div key={item.id}>
          <h3 className="pb-3 pt-3">{item.header}</h3>

          <div className="bg-[var(--color-white)] shadow-lg rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-2xl">{item.icon}</p>
              <span className="font-semibold">{item.header}</span>
            </div>

            <p className="font-medium mt-2">{item.advice}</p>
            <p className="text-gray-500">{item.details}</p>
            <Link href={`/tips/${item.id}`} className="text-blue-600 underline mt-3 inline-block">
              Read more !
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
