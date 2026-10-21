import Link from "@/components/LocaleLink";
import { ArrowRight } from "lucide-react";
import SafeImage from "@/components/SafeImage";

// The home page's two content sections: a ruled list of where to start, and a
// short account of how field reports are used. Despite the file name there is
// no client-side animation here any more.
export default function HomeAnimatedSections({ isAr }: { isAr: boolean }) {
  const places = [
    {
      href: "/gaza-kitchen",
      title: isAr ? "المطابخ المجتمعية" : "Community kitchens",
      text: isAr ? "أين تُقدَّم الوجبات اليوم، ومتى، وكم مكاناً بقي." : "Where meals are served today, at what time, and how many places are left.",
    },
    {
      href: "/recipes",
      title: isAr ? "وصفات من مكونات قليلة" : "Recipes for short supplies",
      text: isAr ? "عدس وطحين وبقوليات معلّبة: أطباق تُطيل عمر ما في بيتك." : "Lentils, flour, tinned beans: dishes that make what you have last.",
    },
    {
      href: "/tips",
      title: isAr ? "نصائح صحية" : "Health tips",
      text: isAr ? "الماء والنوم وتغذية الأطفال، في فقرات قصيرة." : "Water, sleep and feeding children, in short pieces.",
    },
    {
      href: "/doctors",
      title: isAr ? "أطباء" : "Doctors",
      text: isAr ? "أطباء وأخصائيو تغذية، وأوقات وجودهم." : "Physicians and dietitians, and when you can reach them.",
    },
  ];

  return (
    <>
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24 grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20">
        <div>
          <h2 className="text-3xl md:text-4xl font-medium text-ink max-w-[14ch]">
            {isAr ? "من أين تبدأ" : "Where to start"}
          </h2>
          <p className="mt-4 text-ink-soft text-lg max-w-sm">
            {isAr ? "أربعة أشياء نحاول أن نفعلها جيداً." : "Four things we are trying to do well."}
          </p>
        </div>

        <ul className="border-t border-line-strong">
          {places.map((item, i) => (
            <li key={item.href} className="border-b border-line-strong">
              <Link href={item.href} className="group flex items-start gap-5 py-6">
                <span className="font-display text-sm font-medium text-clay-700 pt-1.5 w-6 tabular-nums" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1">
                  <span className="block text-xl font-semibold text-ink group-hover:text-olive-800">{item.title}</span>
                  <span className="block mt-1 text-ink-soft">{item.text}</span>
                </span>
                <ArrowRight
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className={`mt-1.5 text-ink-mute group-hover:text-olive-800 transition-colors ${isAr ? "rotate-180" : ""}`}
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-24 grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-medium text-ink max-w-[18ch]">
            {isAr ? "بلاغات الناس ترسم خريطة الحاجة" : "Reports from people on the ground"}
          </h2>
          <p className="mt-5 text-lg text-ink-soft leading-relaxed max-w-lg">
            {isAr
              ? "نجمع ما يصلنا من البلاغات عن الأحياء والمخيمات التي ينقصها الطعام، ثم نستخدمها لنقرر أين تذهب الطرود التالية."
              : "We collect reports about neighbourhoods and camps that are short of food, then use them to decide where the next parcels go."}
          </p>
          <Link href="/report-area" className="text-link mt-6 inline-block">
            {isAr ? "قدّم بلاغاً" : "Send a report"}
          </Link>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-line">
          <SafeImage
            src="/assets/placeholders/kitchen-table.svg"
            alt={isAr ? "مطبخ مجتمعي تحت مظلة، وعلى الطاولة ثلاثة أوعية" : "A community kitchen under an awning, with three bowls on the table"}
            kind="kitchen"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </section>
    </>
  );
}
