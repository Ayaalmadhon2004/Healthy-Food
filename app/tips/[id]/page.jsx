import Link from "next/link";
import { healthTips } from "@/lib/data"; 
import { Droplet, Bed, Leaf, Activity, HelpCircle } from "lucide-react";

const IconMap = {
  Droplet: Droplet,
  Bed: Bed,
  Leaf: Leaf,
  Activity: Activity,
};

export async function generateStaticParams() {
  return healthTips.map((tip) => ({
    id: tip.id.toString(),
  }));
}

export default async function TipDetails({ params }) {
  const { id } = await params;

  const tip = healthTips.find((t) => t.id.toString() === id);

  if (!tip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg md:text-xl font-bold">
          Tip not found
        </p>
      </div>
    );
  }

  const IconComponent = IconMap[tip.iconName] || HelpCircle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef7f0] to-[#f6f6f6] p-4 md:p-6 lg:p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 md:p-10 border border-gray-100">

        {/* Icon Display */}
        <div className="text-green-600 mb-6 flex justify-center">
          <IconComponent size={80} strokeWidth={1.5} />
        </div>

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center">
          {tip.header}
        </h1>

        {/* Advice */}
        <p className="text-base sm:text-lg md:text-xl mt-4 md:mt-6 text-gray-700 leading-relaxed text-center">
          {tip.advice}
        </p>

        {/* Details */}
        <p className="text-gray-500 mt-4 md:mt-6 leading-relaxed text-center text-sm sm:text-base md:text-lg">
          {tip.details}
        </p>

        {/* More Details Section */}
        <div className="mt-6 md:mt-8 bg-[#f9fcf9] rounded-xl p-6 md:p-8 border border-green-50 border-gray-200 shadow-sm">
          <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-4">
            More Details
          </h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base md:text-lg">
            {tip.moreDetails}
          </p>
        </div>

        {/* Back Button */}
        <div className="mt-6 md:mt-10 flex justify-center">
          <Link
            href="/tips"
            className="px-6 sm:px-8 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition shadow-md text-sm sm:text-base md:text-lg"
          >
            ← Back to Tips
          </Link>
        </div>
      </div>
    </div>
  );
}