import { prisma } from '../lib/prisma.js'; 

const healthTips = [
  {
    header: { en: "Hydration", ar: "الترطيب" },
    iconName: "Droplet",
    advice: { en: "Stay hydrated.", ar: "حافظ على شرب الماء." },
    details: { en: "Drink enough water daily.", ar: "اشرب كمية كافية من الماء يومياً." },
    moreDetails: { en: "Water improves energy, focus, and digestion.", ar: "الماء يحسن الطاقة والتركيز والهضم." }
  },
  {
    header: { en: "Healthy Meals", ar: "وجبات صحية" },
    iconName: "Activity",
    advice: { en: "Eat balanced meals.", ar: "تناول وجبات متوازنة." },
    details: { en: "Include proteins, vegetables, carbs, and fats.", ar: "تضمن البروتينات والخضار والكربوهيدرات والدهون." },
    moreDetails: { en: "Balanced meals give your body essential nutrients.", ar: "الوجبات المتوازنة تمنح جسمك العناصر الغذائية الأساسية." }
  }
];

// --- 2. بيانات الوصفات ---
const foodRecipes = [
  {
    id: 1,
    img: "/assets/Berry.jpg",
    type: { en: "Breakfast", ar: "فطور" },
    title: { en: "Berry Smoothie Bowl", ar: "وعاء سموثي التوت" },
    time: { en: "5 min", ar: "5 دقائق" },
    cal: { en: "280 cal", ar: "280 سعرة" },
    nutrition: { protein: "10g", carbs: "35g", fat: "8g", fiber: "6g" },
    ingredients: { en: ["1 cup frozen berries", "1 banana", "1/2 cup yogurt"], ar: ["1 كوب توت مجمد", "1 موزة", "1/2 كوب زبادي"] },
    instructions: { en: ["Blend all until smooth."], ar: ["اخلط الجميع حتى ينعم."] }
  },
  {
    id: 2,
    img: "/assets/Quinoa Buddha Bowl.jpg",
    type: { en: "Lunch", ar: "غداء" },
    title: { en: "Quinoa Buddha Bowl", ar: "وعاء بوذا بالكينوا" },
    time: { en: "15 min", ar: "15 دقائق" },
    cal: { en: "420 cal", ar: "420 سعرة" },
    nutrition: { protein: "18g", carbs: "52g", fat: "14g", fiber: "12g" },
    ingredients: { en: ["1 cup cooked quinoa", "1 can chickpeas"], ar: ["1 كوب كينوا مطبوخ", "1 علبة حمص"] },
    instructions: { en: ["Arrange in a bowl and serve."], ar: ["رتب المكونات في وعاء وقدمها."] }
  }
];

// --- 3. بيانات المطابخ المجتمعية ---
const kitchens = [
  {
    name: { en: "Al-Sadaqa Kitchen", ar: "مطبخ الصداقة" },
    location: { en: "Al-Shuja'iyya, Gaza City", ar: "الشجاعية، غزة" },
    region: { en: "Gaza", ar: "غزة" },
    distributionTime: { en: "1:00 PM", ar: "1:00 ظهراً" },
    capacity: { en: "350-500 families", ar: "350-500 أسرة" },
    todaysMeal: { en: "Lentil soup + bread", ar: "شوربة عدس + خبز" },
    accessInfo: { en: "Open to all families.", ar: "مفتوح لجميع العائلات." },
    contact: "+970-599-123456"
  }
];

// --- 4. بيانات الأطباء ---
const doctorsData = [
  {
    name: { en: "Dr. Sarah Johnson", ar: "د. سارة جونسون" },
    specialty: { en: "Nutritionist", ar: "أخصائية تغذية" },
    qualifications: { en: ["RD, LDN"], ar: ["أخصائية تغذية مرخصة"] },
    rating: 4.9,
    reviews: 127,
    location: { en: "New York, NY", ar: "نيويورك" },
    phone: "+1 (555) 123-4567",
    email: "sarah@nutritioncare.com",
    about: { en: "Expert in nutrition.", ar: "خبيرة في التغذية." },
    image: "/assets/doctor1.jpg",
    availability: { en: "Mon-Fri", ar: "الإثنين-الجمعة" }
  }
];

// --- 5. دليل التغذية (تم التحديث ليتطابق مع الكود البرمجي) ---
const nutritionGuideData = {
  header: {
    badge: { en: "Nutrition Knowledge", ar: "الثقافة الغذائية" },
    title: { en: "Family Nutrition Guide", ar: "دليل تغذية العائلة" },
    subtitle: { 
      en: "Essential tips to maintain health during challenging times.", 
      ar: "نصائح أساسية للحفاظ على الصحة في الأوقات الصعبة." 
    }
  },
  sections: [
    { 
      title: { en: "Protein Source", ar: "مصادر البروتين" }, 
      description: { en: "Essential for muscle health.", ar: "ضروري لصحة العضلات." },
      listTitle: { en: "Examples", ar: "أمثلة" },
      color: "green", 
      items: [
        { en: "Rice + Lentils", ar: "أرز + عدس" },
        { en: "Canned Beans", ar: "بقوليات معلبة" }
      ] 
    },
    { 
      title: { en: "Hydration", ar: "الترطيب" }, 
      description: { en: "Keep your body functioning.", ar: "حافظ على وظائف جسمك." },
      listTitle: { en: "Daily Goal", ar: "الهدف اليومي" },
      color: "blue", 
      items: [
        { en: "3 Liters of water", ar: "3 لتر ماء" }
      ] 
    }
  ],
  stretching: {
    title: { en: "Meal Stretching", ar: "مضاعفة الوجبات" },
    subtitle: { en: "How to make food last longer.", ar: "كيف تجعل الطعام يدوم لفترة أطول." },
    steps: [
      { 
        number: 1, 
        title: { en: "Add Bulkers", ar: "إضافة الحجم" }, 
        text: { en: "Use rice or bread to stretch stew.", ar: "استخدم الأرز أو الخبز لزيادة حجم المرق." } 
      },
      { 
        number: 2, 
        title: { en: "Save Leftovers", ar: "حفظ البقايا" }, 
        text: { en: "Reheat safely for next day.", ar: "أعد التسخين بأمان لليوم التالي." } 
      }
    ]
  }
};

// --- الدالة الأساسية لتنفيذ الـ Seed ---
async function main() {
  console.log("🌱 بدأت عملية تنظيف البيانات القديمة...");
  
  // ترتيب الحذف لتجنب مشاكل العلاقات
  await prisma.favorite.deleteMany({});
  await prisma.healthTip.deleteMany({});
  await prisma.foodRecipe.deleteMany({});
  await prisma.kitchen.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.nutritionGuide.deleteMany({});
  
  console.log("🗑️ تم تنظيف قاعدة البيانات. جاري إضافة البيانات الجديدة...");

  // إضافة النصائح
  await prisma.healthTip.createMany({ data: healthTips });

  // إضافة الوصفات
  for (const recipe of foodRecipes) {
    await prisma.foodRecipe.create({ data: recipe });
  }

  // إضافة المطابخ
  await prisma.kitchen.createMany({ data: kitchens });

  // إضافة الأطباء
  for (const doctor of doctorsData) {
    await prisma.doctor.create({ data: doctor });
  }

  // إضافة دليل التغذية
  await prisma.nutritionGuide.create({
    data: { content: nutritionGuideData }
  });

  console.log("🏁 تمت العملية بنجاح! قاعدة البيانات جاهزة الآن ببيانات مترجمة.");
}

main()
  .catch((e) => {
    console.error("❌ خطأ أثناء الـ Seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });