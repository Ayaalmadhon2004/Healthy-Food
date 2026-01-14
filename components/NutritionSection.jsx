import {prisma} from "@/lib/prisma";
import { cookies } from "next/headers";

export default async function NutritionSection() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("lang")?.value || "ar";
  const isRtl = lang === "ar";

  const guideData = await prisma.nutritionGuide.findFirst();
  
  if (!guideData || !guideData.content) return null;
  
  const { header, sections, stretching } = guideData.content;

  return (
    <section 
      className="max-w-5xl mx-auto px-6 py-12" 
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block bg-green-100 text-green-700 font-medium px-4 py-1 rounded-full text-sm">
          {header.badge[lang]}
        </span>
        <h1 className="text-3xl font-bold mt-4 text-gray-900">
          {header.title[lang]}
        </h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          {header.subtitle[lang]}
        </p>
      </div>

      {/* Sections */}
      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((sec, index) => (
          <article
            key={index}
            className={`p-6 rounded-xl border ${
              sec.color === "green" ? "bg-green-50 border-green-100" :
              sec.color === "orange" ? "bg-orange-50 border-orange-100" :
              "bg-blue-50 border-blue-100"
            }`}
          >
            <h2 className="text-xl font-bold text-gray-800">{sec.title[lang]}</h2>
            <p className="mt-2 text-gray-700 text-sm leading-relaxed">
              {sec.description[lang]}
            </p>

            <h4 className="mt-6 font-bold text-gray-800 text-xs uppercase tracking-wider">
              {sec.listTitle[lang]}
            </h4>
            <ul className={`mt-2 space-y-2 text-gray-700 text-sm list-disc ${isRtl ? "pr-5" : "pl-5"}`}>
              {sec.items.map((item, i) => (
                <li key={i}>{item[lang]}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Stretching Meals */}
      <div className="mt-12 bg-gray-50 p-8 rounded-2xl border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">{stretching.title[lang]}</h2>
        <p className="text-gray-600 mt-1">{stretching.subtitle[lang]}</p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {stretching.steps.map((step) => (
            <div key={step.number} className="flex gap-4 items-start">
              <span className="shrink-0 bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold">
                {step.number}
              </span>
              <div>
                <h3 className="font-bold text-gray-800">{step.title[lang]}</h3>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  {step.text[lang]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}