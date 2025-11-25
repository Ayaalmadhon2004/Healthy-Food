export default async function TipDetails({ params }) {
  const { id } = await params;

  const res = await fetch("http://localhost:3000/api/health-tips");
  const data = await res.json();

  const tip = data.find((t) => t.id.toString() === id);

  if (!tip) return <p className="text-center text-red-500 mt-20">Tip not found</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef7f0] to-[#f6f6f6] p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
        
        {/* Icon */}
        <div className="text-6xl text-green-600 mb-6 flex justify-center">
          {tip.icon}
        </div>

        {/* Header */}
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          {tip.header}
        </h1>

        {/* Advice */}
        <p className="text-xl mt-6 text-gray-700 leading-relaxed text-center">
          {tip.advice}
        </p>

        {/* Details */}
        <p className="text-gray-500 mt-6 leading-relaxed text-center">
          {tip.details}
        </p>

        <div className="mt-8 bg-[var(--color-primary-light)] rounded-xl p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">More Details</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
            {tip.moreDetails}
            </p>
        </div>


        {/* Back Button */}
        <div className="mt-10 flex justify-center">
          <a
            href="/tips"
            className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            ← Back to Tips
          </a>
        </div>
      </div>
    </div>
  );
}
