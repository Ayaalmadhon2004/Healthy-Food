"use client";

import { MapPin, Calendar, Award } from "lucide-react";

export default function DoctorsListClient({ initialDoctors, lang }) {
  const isAr = lang === "ar";

  return (
    <main 
      className="max-w-7xl mx-auto p-4 md:p-8" 
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* عنوان الصفحة المترجم */}
      <div className="mb-10 text-center md:text-start">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          {isAr ? "أطباؤنا المتخصصون" : "Our Specialized Doctors"}
        </h1>
        <p className="mt-2 text-gray-500">
          {isAr 
            ? "نخبة من خبراء التغذية والصحة لخدمتكم" 
            : "Top nutrition and health experts at your service"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {initialDoctors.map((doctor) => (
          <div 
            key={doctor.id} 
            className="group border p-6 rounded-2xl shadow-sm bg-white hover:shadow-xl transition-all duration-300 border-gray-100"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* صورة الطبيب */}
              <div className="relative">
                <img 
                  src={doctor.image} 
                  className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ring-4 ring-emerald-50" 
                  alt={doctor.name[lang]} 
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg">
                   <Award size={16} />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">
                      {doctor.name[lang]}
                    </h3>
                    <p className="text-emerald-600 font-semibold mt-1">
                      {doctor.specialty[lang]}
                    </p>
                  </div>
                  <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-sm font-bold">
                    ★ {doctor.rating}
                  </div>
                </div>
                
                {/* تفاصيل الموقع والمواعيد */}
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-500" /> 
                      <span>{doctor.location[lang]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-emerald-500" /> 
                      <span>{doctor.availability[lang]}</span>
                    </div>
                </div>
              </div>
            </div>

            {/* نبذة عن الطبيب */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {doctor.about[lang]}
              </p>
            </div>

            {/* المؤهلات */}
            <div className="mt-6 flex flex-wrap gap-2">
              {doctor.qualifications[lang]?.map((q, i) => (
                <span 
                  key={i} 
                  className="bg-white border border-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-full shadow-sm"
                >
                  {q}
                </span>
              ))}
            </div>

            <button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors">
              {isAr ? "حجز موعد الآن" : "Book Appointment Now"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}