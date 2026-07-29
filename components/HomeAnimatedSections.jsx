import { Activity, ShieldCheck } from "lucide-react";

export default function HomeAnimatedSections({ stats, isAr }) {
  return (
    <>
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group transition duration-500">
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-white/5 text-green-400 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                {stat.icon}
              </div>
              <h3 className="text-5xl font-black mb-2">{stat.val}</h3>
              <p className="text-gray-400 font-medium uppercase tracking-widest text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-5xl font-black mb-8 leading-tight">
              {isAr ? "نظام البلاغات والاحتياج الميداني" : "Field Reporting & Needs System"}
            </h2>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed italic border-l-4 border-green-600 pl-6">
              &quot;نقوم بتحليل البيانات الواردة من مخيمات النزوح لتحديد أولويات توزيع الطرود الغذائية.&quot;
            </p>
            <div className="space-y-6">
              {[
                { title: isAr ? "تحليل البيانات الجغرافي" : "Geographic Data Analysis", icon: <Activity /> },
                { title: isAr ? "تنسيق الجهود الإغاثية" : "Relief Coordination", icon: <ShieldCheck /> }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 transition-colors">
                  <span className="text-green-600">{item.icon}</span>
                  <span className="font-bold text-lg">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="relative w-full aspect-square bg-gray-100 rounded-[4rem] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('/assets/jabalia.jpg')] bg-cover bg-center opacity-80" />
             </div>
             <div className="absolute -bottom-10 -left-10 p-8 bg-white rounded-3xl shadow-xl max-w-xs border-t-8 border-green-600">
                <p className="text-sm font-bold text-gray-400 mb-2">LAST REPORT IN</p>
                <p className="text-xl font-black">Jabalia Refugee Camp</p>
             </div>
          </div>
        </div>
      </section>
    </>
  );
}
