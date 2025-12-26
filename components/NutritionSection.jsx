import { nutritionGuide } from "@/data/nutritionData";

export default function NutritionSection() {
  const { header, sections, stretching } = nutritionGuide;

  return (
    <section className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block bg-green-100 text-green-700 font-medium px-4 py-1 rounded-full">
          {header.badge}
        </span>
        <h1 className="text-3xl font-bold mt-4">{header.title}</h1>
        <p className="text-gray-600 mt-2">{header.subtitle}</p>
      </div>

      {/* Sections */}
      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((sec, index) => (
          <article
            key={index}
            className={`p-6 rounded-xl border ${sec.color}`}
          >
            <h2 className="text-xl font-semibold">{sec.title}</h2>
            <p className="mt-2 text-gray-700">{sec.description}</p>

            <h4 className="mt-4 font-semibold">{sec.listTitle}</h4>
            <ul className="mt-2 list-disc ml-6 text-gray-700 space-y-1">
              {sec.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Stretching Meals */}
      <div className="mt-12 bg-gray-50 p-6 rounded-xl">
        <h2 className="text-2xl font-bold">{stretching.title}</h2>
        <p className="text-gray-600 mt-1">{stretching.subtitle}</p>

        <div className="mt-6 space-y-6">
          {stretching.steps.map((step) => (
            <div key={step.number} className="flex gap-4">
              <span className="bg-blue-100 text-blue-700 w-10 h-10 flex items-center justify-center rounded-full font-bold">
                {step.number}
              </span>
              <div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-gray-700">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
