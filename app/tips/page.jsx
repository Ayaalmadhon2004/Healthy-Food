import Link from "next/link";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import { healthTips } from "@/lib/data";
import { Droplet, Bed, Leaf, Activity, HelpCircle } from "lucide-react";

const IconMap = {
  Droplet: Droplet,
  Bed: Bed,
  Leaf: Leaf,
  Activity: Activity,
};

export const revalidate = 60;

export default async function TipsPage() {
  const tips = healthTips;

  return (
    <div className="bg-[#fdfcf9] min-h-screen p-4 md:p-10">
      <div className="container mx-auto">
        <h1 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">Health & Nutrition Tips</h1>
        <p className="pb-8 text-gray-600">Simple steps for a better, healthier lifestyle.</p>

        <div className="grid grid-cols-1 gap-8">
          {tips.map((item) => {
            const IconComponent = IconMap[item.iconName] || HelpCircle;

            return (
              <div key={item.id} className="group">
                <h3 className="mb-3 font-bold text-gray-800 text-lg">{item.header}</h3>

                <div className="bg-white shadow-md hover:shadow-xl transition-shadow rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between bg-orange-50/60 p-4 rounded-xl mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {/* رندرة الأيقونة كمكون React */}
                      <IconComponent className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="font-bold text-gray-900">{item.header}</span>
                  </div>

                  <p className="font-semibold text-gray-800 mb-1">{item.advice}</p>
                  <p className="text-gray-500 mb-6 text-sm leading-relaxed">{item.details}</p>

                  <ErrorBoundaryWrapper message="Link error">
                    <Link
                      className="inline-block px-6 py-2 bg-green-500 text-white text-sm font-bold rounded-full hover:bg-green-600 transition-colors no-underline shadow-sm"
                      href={`/tips/${item.id}`}
                    >
                      Read more!
                    </Link>
                  </ErrorBoundaryWrapper>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}