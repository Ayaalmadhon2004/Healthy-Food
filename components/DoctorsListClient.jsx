"use client";

import { MapPin, Calendar, Award, Star } from "lucide-react";
import Image from "next/image";

export default function DoctorsListClient({ initialDoctors, lang }) {
  const isAr = lang === "ar";

  return (
    <main 
      className="max-w-7xl mx-auto p-4 md:p-8" 
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header Section */}
      <div className="mb-12 text-center md:text-start border-b pb-8 border-gray-100">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
          {isAr ? "أطباؤنا المتخصصون" : "Our Specialized Doctors"}
        </h1>
        <p className="mt-3 text-gray-600 text-lg">
          {isAr 
            ? "نخبة من خبراء التغذية والصحة لخدمتكم بأعلى المعايير" 
            : "Top nutrition and health experts dedicated to your well-being"}
        </p>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {initialDoctors.map((doctor) => (
          <article 
            key={doctor.id} 
            className="group border p-6 rounded-3xl shadow-sm bg-white hover:shadow-2xl transition-all duration-500 border-gray-100 flex flex-col justify-between"
          >
            <div className="flex flex-col md:flex-row gap-8">
              {/* Doctor Image with fixed dimensions for CLS fix */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0 mx-auto md:mx-0">
                <Image 
                  src={doctor.image} 
                  alt={doctor.name[lang]} 
                  fill
                  className="rounded-2xl object-cover ring-4 ring-emerald-50 shadow-inner"
                  sizes="128px"
                />
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                    <Award size={18} />
                </div>
              </div>

              <div className="flex-1 text-center md:text-start">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-2">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                      {doctor.name[lang]}
                    </h2>
                    <p className="text-emerald-700 font-bold text-sm mt-1 bg-emerald-50 inline-block px-3 py-1 rounded-lg">
                      {doctor.specialty[lang]}
                    </p>
                  </div>
                  <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-sm font-black shadow-sm">
                    <Star size={16} className="fill-current mr-1 ml-1" />
                    {doctor.rating}
                  </div>
                </div>
                
                {/* Details Section */}
                <div className="mt-5 space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <MapPin size={18} className="text-emerald-500" /> 
                      <span className="font-medium">{doctor.location[lang]}</span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <Calendar size={18} className="text-emerald-500" /> 
                      <span className="font-medium">{doctor.availability[lang]}</span>
                    </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mt-6 p-5 bg-gray-50/80 rounded-2xl border border-gray-50 flex-grow">
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 italic">
                "{doctor.about[lang]}"
              </p>
            </div>

            {/* Qualifications */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
              {doctor.qualifications[lang]?.map((q, i) => (
                <span 
                  key={i} 
                  className="bg-white border border-emerald-100 text-emerald-800 text-xs px-3 py-2 rounded-xl font-bold"
                >
                  {q}
                </span>
              ))}
            </div>

            <button className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-emerald-100 transition-all active:scale-95">
              {isAr ? "احجز موعدك الآن" : "Book Your Appointment"}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}