"use client";
import React, { useEffect, useState } from "react";

/**
 * Healthy-Food — Gaza Charity Kitchens
 * Single-file Next.js React component (Tailwind CSS required)
 *
 * How to use:
 * 1. Ensure your Next.js project has Tailwind configured.
 * 2. Copy this file to: app/charities/page.jsx (App Router) or pages/charities.jsx (Pages Router)
 * 3. Import and navigate to /charities
 *
 * Features included:
 * - Sample real-like charity data (names, regions, types, needs)
 * - Region filter (North, Gaza, Middle, Khan Younis, Rafah)
 * - Simple SVG "map" with region highlights (no external API)
 * - Meal of the Day card
 * - Donation modal with suggested items
 * - Volunteer/contact quick actions (WhatsApp link placeholder)
 * - Offline-friendly: saved favorites in localStorage
 * - Stories section for human-centered content
 */

const SAMPLE_CHARITIES = [
  {
    id: "kh1",
    name: "جمعية الرحمة - المطبخ المركزي",
    region: "Gaza",
    mealsPerDay: 400,
    mealTypes: ["شوربة عدس", "أرز مع خضار"],
    needs: ["زيت", "أرز", "دقيق"],
    contact: "+970599000111",
    schedule: "يوميًا 11:00 - 14:00",
    donationLink: "https://wa.me/970599000111?text=تبرع+لجمعية+الرحمة",
    description:
      "مطبخ مجتمعي يقدم وجبات ساخنة للعائلات المتأثرة. يركز على الوجبات الآمنة والقابلة للتخزين.",
  },
  {
    id: "kh2",
    name: "مطبخ النخوة - خانيونس",
    region: "Khan Younis",
    mealsPerDay: 250,
    mealTypes: ["خبز", "فلافل", "سلطة بسيطة"],
    needs: ["دقيق", "فول", "متطوعين"],
    contact: "+970599000222",
    schedule: "أيام محددة: 3 مرات أسبوعيًا 13:00",
    donationLink: "https://wa.me/970599000222?text=تبرع+لمطبخ+النخوة",
    description:
      "مطبخ يركز على توزيع الخبز والوجبات البسيطة للعائلات والمسنين في خانيونس.",
  },
  {
    id: "kh3",
    name: "مبادرة خبز للكل - رفح",
    region: "Rafah",
    mealsPerDay: 600,
    mealTypes: ["خبز يومي", "شوربة"],
    needs: ["طحين", "وقود"],
    contact: "+970599000333",
    schedule: "يوميًا 08:00 - 10:00",
    donationLink: "https://wa.me/970599000333?text=دعم+مبادرة+خبز+للكل",
    description:
      "مبادرة توزع الخبز الطازج يوميًا وتركز على الأسر المشردة والنازحين داخليًا.",
  },
];

const REGIONS = [
  "All",
  "North",
  "Gaza",
  "Middle",
  "Khan Younis",
  "Rafah",
];

export default function CharityKitchensPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem("hf_favs");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [donationTarget, setDonationTarget] = useState(null);
  const [showDonation, setShowDonation] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("hf_favs", JSON.stringify(favorites));
    } catch (e) {}
  }, [favorites]);

  const filtered = SAMPLE_CHARITIES.filter((c) => {
    const matchRegion = region === "All" || c.region === region;
    const matchQuery =
      !query || c.name.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase());
    return matchRegion && matchQuery;
  });

  function toggleFav(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function openDonation(charity) {
    setDonationTarget(charity);
    setShowDonation(true);
  }

  function closeDonation() {
    setDonationTarget(null);
    setShowDonation(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">🍲 دعم مطابخ غزة — Healthy Food</h1>
            <p className="text-sm text-gray-600">ابحث عن مطابخ ومبادرات التوزيع، تبرع أو تطوع بسهولة.</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              aria-label="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث باسم الجمعية أو الطعام..."
              className="px-3 py-2 rounded-md border shadow-sm"
            />
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="px-3 py-2 rounded-md border">
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </header>

        <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Map + Meal of the Day + Stories */}
          <aside className="space-y-6">
            <Card>
              <h3 className="font-semibold text-lg">🗺️ خريطة المناطق (بسيطة)</h3>
              <p className="text-sm text-gray-600">اضغطي على أي منطقة لتصفية المطابخ.</p>
              <SimpleMap activeRegion={region} onSelect={(r) => setRegion(r)} />
            </Card>

            <Card>
              <h3 className="font-semibold text-lg">🍽️ وجبة اليوم</h3>
              <p className="text-sm text-gray-600">تحديث يومي يوضح الوجبة الرئيسية المتوفرة الآن.</p>
              <div className="mt-3">
                <MealOfDay charities={SAMPLE_CHARITIES} />
              </div>
            </Card>

            <Card>
              <h3 className="font-semibold text-lg">قصص ومبادرات</h3>
              <p className="text-sm text-gray-600">مشاركات قصيرة ترفع المعنوية وتعرض فرص تطوع.</p>
              <ul className="mt-3 space-y-3">
                <li className="text-sm bg-white p-3 rounded shadow-sm">
                  <strong>قصة: </strong> متطوعات قاموا بتحويل مطبخ صغير إلى مطبخ يكفي 150 وجبة يوميًا.
                </li>
                <li className="text-sm bg-white p-3 rounded shadow-sm">مشروع "خبز للجميع" بدأ بتبرع 2 طن طحين.</li>
              </ul>
            </Card>
          </aside>

          {/* Middle + Right columns: Charity List */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">قائمة المطابخ والمبادرات ({filtered.length})</h2>
              <div className="text-sm text-gray-500">المحفوظات: {favorites.length}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((c) => (
                <article key={c.id} className="bg-white p-4 rounded shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{c.name}</h3>
                      <div className="mt-1 text-sm text-gray-600">{c.description}</div>

                      <div className="mt-3 text-sm grid grid-cols-2 gap-2">
                        <div>
                          <strong>المنطقة: </strong>
                          <span>{c.region}</span>
                        </div>
                        <div>
                          <strong>الجدول: </strong>
                          <span>{c.schedule}</span>
                        </div>
                        <div>
                          <strong>الطعام: </strong>
                          <span>{c.mealTypes.join("، ")}</span>
                        </div>
                        <div>
                          <strong>عدد الوجبات: </strong>
                          <span>{c.mealsPerDay}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => toggleFav(c.id)} className="px-3 py-1 border rounded">
                        {favorites.includes(c.id) ? "♥ محفوظ" : "♡ حفظ"}
                      </button>
                      <a target="_blank" rel="noreferrer" href={c.donationLink} className="text-xs underline">
                        تبرع عبر واتساب
                      </a>
                      <button onClick={() => openDonation(c)} className="px-3 py-1 rounded bg-green-600 text-white text-sm">
                        رؤية احتياجات
                      </button>
                      <a target="_blank" rel="noreferrer" href={`https://wa.me/${c.contact.replace(/\+/g, "")}?text=السلام+عليكم`} className="text-xs">
                        تواصل/تطوع
                      </a>
                    </div>
                  </div>
                </article>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full text-center text-gray-500">لا توجد نتائج مطابقة للفلتر.</div>
              )}
            </div>
          </section>
        </main>

        {/* Donation Modal */}
        {showDonation && donationTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded shadow max-w-xl w-full p-6">
              <h3 className="text-lg font-semibold">احتياجات {donationTarget.name}</h3>
              <p className="text-sm text-gray-600">الموقع: {donationTarget.region} — {donationTarget.schedule}</p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <strong>الأشياء المطلوبة:</strong>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {donationTarget.needs.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>كيف تساعد (اقتراحات بسيطة):</strong>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    <li>تبرع بكيس دقيق أو عبوة زيت.</li>
                    <li>التطوع في التغليف أو التوزيع.</li>
                    <li>المساهمة بمبلغ نقدي لتغطية الوقود أو الغاز.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <a target="_blank" rel="noreferrer" href={donationTarget.donationLink} className="px-4 py-2 rounded bg-blue-600 text-white">
                  تبرع الآن عبر واتساب
                </a>
                <button onClick={closeDonation} className="px-4 py-2 rounded border">
                  غلق
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-sm text-gray-500">© Healthy-Food — دعم مطابخ غزة — مثال تعليمي</footer>
      </div>
    </div>
  );
}

function Card({ children }) {
  return <div className="bg-white p-4 rounded shadow-sm">{children}</div>;
}

function MealOfDay({ charities }) {
  // Simple rotation: pick charity with highest mealsPerDay
  const best = charities.reduce((a, b) => (a.mealsPerDay > b.mealsPerDay ? a : b));
  return (
    <div>
      <div className="text-sm"><strong>مقدم الوجبة: </strong>{best.name}</div>
      <div className="mt-2 text-sm">الوجبة المتوقعة: <em>{best.mealTypes.join("، ")}</em></div>
      <div className="mt-2 text-xs text-gray-500">يشمل هذا مثالًا؛ يجب على المستخدمين التواصل مباشرة مع الجمعية للتحقق من التوافر.</div>
    </div>
  );
}

function SimpleMap({ activeRegion, onSelect }) {
  // This component renders a simple SVG with clickable regions.
  // The mapping is illustrative; replace with a proper map if APIs are available.
  const regions = [
    { key: "North", label: "الشمال", x: 10, y: 10 },
    { key: "Gaza", label: "غزة", x: 80, y: 10 },
    { key: "Middle", label: "الوسط", x: 10, y: 70 },
    { key: "Khan Younis", label: "خانيونس", x: 80, y: 70 },
    { key: "Rafah", label: "رفح", x: 45, y: 130 },
  ];

  return (
    <div className="mt-3">
      <svg viewBox="0 0 160 160" className="w-full h-40 border rounded">
        {regions.map((r) => {
          const isActive = activeRegion === r.key;
          return (
            <g key={r.key} onClick={() => onSelect(r.key)} className="cursor-pointer">
              <rect
                x={r.x}
                y={r.y}
                width={60}
                height={40}
                rx={6}
                fill={isActive ? "#10B981" : "#E5E7EB"}
                stroke="#9CA3AF"
              />
              <text x={r.x + 30} y={r.y + 22} textAnchor="middle" fontSize={9} dominantBaseline="middle">
                {r.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex gap-2 text-xs text-gray-600">
        <button onClick={() => onSelect("All")} className="px-2 py-1 rounded border">عرض الكل</button>
        {regions.map((r) => (
          <button key={r.key} onClick={() => onSelect(r.key)} className="px-2 py-1 rounded border">
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
