import { prisma } from '../lib/prisma.js'; 

export const healthTips = [
  {
    id: 1,
    header: { en: "Hydration", ar: "الترطيب" },
    iconName: "Droplet",
    advice: { en: "Stay hydrated.", ar: "حافظ على شرب الماء." },
    details: { en: "Drink enough water daily.", ar: "اشرب كمية كافية من الماء يومياً." },
    moreDetails: { en: "Water improves energy, focus, and digestion.", ar: "الماء يحسن الطاقة والتركيز والهضم." }
  },
  {
    id: 2,
    header: { en: "Healthy Meals", ar: "وجبات صحية" },
    iconName: "Activity",
    advice: { en: "Eat balanced meals.", ar: "تناول وجبات متوازنة." },
    details: { en: "Include proteins, vegetables, carbs, and fats.", ar: "تضمن البروتينات والخضار والكربوهيدرات والدهون." },
    moreDetails: { en: "Balanced meals give your body essential nutrients.", ar: "الوجبات المتوازنة تمنح جسمك العناصر الغذائية الأساسية." }
  },
  {
    id: 3,
    header: { en: "Sleep", ar: "النوم" },
    iconName: "Bed",
    advice: { en: "Get enough sleep.", ar: "احصل على قسط كافٍ من النوم." },
    details: { en: "7–9 hours improves mood and productivity.", ar: "7–9 ساعات تحسن المزاج والإنتاجية." },
    moreDetails: { en: "Quality sleep is essential for emotional well-being.", ar: "النوم الجيد ضروري للصحة النفسية." }
  },
  {
    id: 4,
    header: { en: "Movement", ar: "الحركة" },
    iconName: "Activity",
    advice: { en: "Move daily.", ar: "تحرك يومياً." },
    details: { en: "15-minute walks improve circulation.", ar: "المشي 15 دقيقة يحسن الدورة الدموية." },
    moreDetails: { en: "Regular activity reduces stress and boosts health.", ar: "النشاط المنتظم يقلل التوتر ويعزز الصحة." }
  },
  {
    id: 5,
    header: { en: "Breathing", ar: "التنفس" },
    iconName: "Leaf",
    advice: { en: "Take deep breaths.", ar: "تنفس بعمق." },
    details: { en: "Slow breathing relaxes your nervous system.", ar: "التنفس البطيء يريح الجهاز العصبي." },
    moreDetails: { en: "Deep breathing lowers anxiety and stress.", ar: "التنفس العميق يقلل القلق والتوتر." }
  }
];

export const foodRecipes = [
  {
    id: 1,
    img: "/assets/Berry.jpg",
    type: { en: "Breakfast", ar: "فطور" },
    title: { en: "Berry Smoothie Bowl", ar: "وعاء سموثي التوت" },
    time: { en: "5 min", ar: "5 دقائق" },
    cal: { en: "280 cal", ar: "280 سعرة" },
    nutrition: { protein: { en: "10g", ar: "10غ" }, carbs: { en: "35g", ar: "35غ" }, fat: { en: "8g", ar: "8غ" }, fiber: { en: "6g", ar: "6غ" } },
    ingredients: { en: ["1 cup frozen berries", "1 banana", "1/2 cup yogurt", "1/4 cup granola", "Honey (optional)"], ar: ["1 كوب توت مجمد", "1 موزة", "1/2 كوب زبادي", "1/4 كوب جرانولا", "عسل (اختياري)"] },
    instructions: { en: ["Blend frozen berries, banana, and yogurt until smooth.", "Pour smoothie into a bowl.", "Top with granola and extra berries.", "Drizzle honey if desired."], ar: ["اخلط التوت المجمد والموز والزبادي حتى يصبح ناعماً.", "صب السموثي في وعاء.", "ضع الجرانولا والتوت الإضافي على الوجه.", "أضف العسل إذا رغبت."] }
  },
  {
    id: 2,
    img: "/assets/Quinoa Buddha Bowl.jpg",
    type: { en: "Lunch", ar: "غداء" },
    title: { en: "Quinoa Buddha Bowl", ar: "وعاء بوذا بالكينوا" },
    time: { en: "15 min", ar: "15 دقيقة" },
    cal: { en: "420 cal", ar: "420 سعرة" },
    nutrition: { protein: { en: "18g", ar: "18غ" }, carbs: { en: "52g", ar: "52غ" }, fat: { en: "14g", ar: "14غ" }, fiber: { en: "12g", ar: "12غ" } },
    ingredients: { en: ["1 cup cooked quinoa", "1 can chickpeas, drained", "1 avocado, sliced", "2 cups mixed greens", "1 cup cherry tomatoes, halved", "1/2 cucumber, diced", "1/4 cup tahini", "Lemon juice, salt, pepper"], ar: ["1 كوب كينوا مطبوخ", "1 علبة حمص مصفى", "1 أفوكادو مقطع", "2 كوب خضار مشكلة", "1 كوب طماطم كرزية مقطعة", "1/2 خيار مقطع", "1/4 كوب طحينة", "عصير ليمون، ملح، فلفل"] },
    instructions: { en: ["Cook quinoa according to package directions.", "Roast chickpeas with olive oil and spices at 400°F for 25 minutes.", "Arrange mixed greens in a bowl.", "Add cooked quinoa, chickpeas, avocado, tomatoes, and cucumber.", "Drizzle with tahini dressing.", "Season with salt and pepper."], ar: ["اطبخ الكينوا حسب التعليمات.", "حمص الحمص مع زيت الزيتون والتوابل في فرن 200° مئوية لمدة 25 دقيقة.", "ضع الخضار المشكلة في وعاء.", "أضف الكينوا المطبوخ والحمص والأفوكادو والطماطم والخيار.", "رش صلصة الطحينة.", "تبل بالملح والفلفل."] }
  }
];

export const kitchens = [
  {
    id: 1,
    name: { en: "Al-Sadaqa Kitchen", ar: "مطبخ الصداقة" },
    location: { en: "Al-Shuja'iyya, Gaza City", ar: "الشجاعية، غزة" },
    region: { en: "Gaza", ar: "غزة" },
    distributionTime: { en: "1:00 PM", ar: "1:00 ظهراً" },
    capacity: { en: "350-500 families", ar: "350-500 أسرة" },
    todaysMeal: { en: "Lentil soup + bread", ar: "شوربة عدس + خبز" },
    accessInfo: { en: "Open to all families. No registration needed.", ar: "مفتوح لجميع العائلات. لا حاجة للتسجيل." },
    contact: "+970-599-123456"
  },
  {
    id: 2,
    name: { en: "Rahma Charity Kitchen", ar: "مطبخ رحمة" },
    location: { en: "Beit Lahia, North Gaza", ar: "بيت لاهيا، شمال غزة" },
    region: { en: "North", ar: "الشمال" },
    distributionTime: { en: "12:30 PM", ar: "12:30 ظهراً" },
    capacity: { en: "300 families", ar: "300 أسرة" },
    todaysMeal: { en: "Rice & beans", ar: "أرز وفاصوليا" },
    accessInfo: { en: "First come, first served. Bring your own containers.", ar: "الأسبقية لمن يصل أولاً. أحضر وعاءك." },
    contact: "+970-597-554321"
  }
];

const doctorsData = [
  {
    id: 1,
    name: { en: "Dr. Sarah Johnson", ar: "د. سارة جونسون" },
    specialty: { en: "Nutritionist", ar: "أخصائية تغذية" },
    qualifications: {
      en: ["RD, LDN", "MS Nutrition", "Certified Nutrition Specialist"],
      ar: ["أخصائية تغذية مرخصة", "ماجستير علوم التغذية", "أخصائي تغذية معتمد"]
    },
    rating: 4.9,
    reviews: 127,
    location: { en: "New York, NY", ar: "نيويورك، الولايات المتحدة" },
    phone: "+1 (555) 123-4567",
    email: "sarah@nutritioncare.com",
    about: {
      en: "Dr. Sarah specializes in personalized nutrition plans for weight management and chronic disease prevention.",
      ar: "تتخصص د. سارة في وضع خطط تغذية شخصية لإدارة الوزن والوقاية من الأمراض المزمنة."
    },
    image: "/assets/doctor1.jpg",
    availability: { en: "Mon-Fri, 9AM-5PM", ar: "الإثنين-الجمعة، 9ص-5م" },
  },
  {
    id: 2,
    name: { en: "Dr. Michael Chen", ar: "د. مايكل تشن" },
    specialty: { en: "Cardiologist & Wellness", ar: "طبيب قلب وعافية" },
    qualifications: {
      en: ["MD", "Board Certified Cardiology", "Preventive Medicine"],
      ar: ["دكتوراه في الطب", "بورد معتمد في أمراض القلب", "طب وقائي"]
    },
    rating: 4.8,
    reviews: 98,
    location: { en: "San Francisco, CA", ar: "سان فرانسيسكو، كاليفورنيا" },
    phone: "+1 (555) 234-5678",
    email: "michael@wellnessmd.com",
    about: {
      en: "Dr. Chen focuses on heart-healthy nutrition and lifestyle modifications to prevent cardiovascular disease.",
      ar: "يركز د. تشن على التغذية الصحية للقلب وتعديلات نمط الحياة للوقاية من أمراض القلب والأوعية الدموية."
    },
    image: "/assets/doctor1.jpg",
    availability: { en: "Mon-Thu, 10AM-6PM", ar: "الإثنين-الخميس، 10ص-6م" },
  }
];


async function main() {
  console.log("🌱 Start seeding...");

  await prisma.healthTip.deleteMany({});
  await prisma.foodRecipe.deleteMany({});
  await prisma.kitchen.deleteMany({});
  await prisma.doctor.deleteMany({});

  await prisma.healthTip.createMany({
    data: healthTips,
  });
  console.log("✅ Seeded health tips!");

  await prisma.foodRecipe.createMany({
  data: foodRecipes,
  });
  console.log("✅ Seeded Food Recipes!");


  await prisma.kitchen.createMany({
    data: kitchens 
  });
  console.log("✅ Seeded kitchens!");

  for (const doctor of doctorsData) {
    await prisma.doctor.create({ data: doctor });
  }
  console.log("✅ Seeded doctors!");

  console.log("🏁 Seeding finished.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });