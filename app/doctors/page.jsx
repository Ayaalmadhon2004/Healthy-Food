"use client"

import { useState, useEffect } from "react";
import { Star, MapPin, Calendar } from "lucide-react";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("ar"); // اللغة الافتراضية

  useEffect(() => {
    // جلب اللغة من الكوكيز
    const currentLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("lang="))
      ?.split("=")[1] || "ar";
    
    setLang(currentLang);

    // جلب البيانات من الـ API (التي تستخدم ملف الـ Seed المحدث)
    fetch("/api/doctors")
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <main className="max-w-7xl mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="border p-6 rounded-xl shadow-sm bg-white">
            <div className="flex gap-4">
              <img src={doctor.image} className="w-20 h-20 rounded-full" alt="" />
              <div>
                {/* استخدام [lang] للوصول لبيانات الـ Seed المترجمة */}
                <h3 className="text-xl font-bold">{doctor.name[lang]}</h3>
                <p className="text-emerald-600 font-medium">{doctor.specialty[lang]}</p>
                
                <div className="mt-2 text-sm text-gray-500">
                   <div className="flex items-center gap-1">
                     <MapPin size={14} /> {doctor.location[lang]}
                   </div>
                   <div className="flex items-center gap-1 mt-1">
                     <Calendar size={14} /> {doctor.availability[lang]}
                   </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-600 text-sm line-clamp-2">{doctor.about[lang]}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {/* ترجمة المصفوفات داخل الـ Seed */}
              {doctor.qualifications[lang]?.map((q, i) => (
                <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded">
                  {q}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}