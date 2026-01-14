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

export const nutritionGuide = {
  header: {
    badge: { en: "Nutrition Knowledge", ar: "الثقافة الغذائية" },
    title: { en: "Family Nutrition Guide", ar: "دليل تغذية العائلة" },
    subtitle: {
      en: "Learn how to maximize nutrition from community kitchen meals and make the most of available ingredients for your family's health.",
      ar: "تعرف على كيفية تحقيق أقصى استفادة من وجبات المطابخ المجتمعية والمكونات المتاحة للحفاظ على صحة عائلتك.",
    },
  },

  sections: [
    {
      title: { en: "Complete Protein Combinations", ar: "تكامل البروتينات" },
      description: {
        en: "When meals contain rice or bread, pair them with lentils or beans to create complete protein - essential for children's growth and family health.",
        ar: "عندما تحتوي الوجبات على الأرز أو الخبز، ادمجها مع العدس أو الفاصوليا للحصول على بروتين كامل - وهو أمر ضروري لنمو الأطفال وصحة الأسرة.",
      },
      listTitle: { en: "Smart Pairing Examples:", ar: "أمثلة للدمج الذكي:" },
      items: [
        { en: "Rice + Lentils = Complete protein", ar: "أرز + عدس = بروتين كامل" },
        { en: "Bread + Hummus/beans = Full nutrition", ar: "خبز + حمص/بقوليات = تغذية كاملة" },
        { en: "Pasta + Chickpeas = Balanced meal", ar: "معكرونة + حمص = وجبة متوازنة" },
      ],
      color: "green",
    },
    {
      title: { en: "Food Preservation Tips", ar: "نصائح حفظ الطعام" },
      description: {
        en: "Keep meals fresh longer without refrigeration. These traditional methods help preserve food safety and prevent waste in difficult conditions.",
        ar: "حافظ على الوجبات طازجة لفترة أطول بدون ثلاجة. هذه الطرق التقليدية تساعد في الحفاظ على سلامة الغذاء ومنع الهدر في الظروف الصعبة.",
      },
      listTitle: { en: "Preservation Methods:", ar: "طرق الحفظ:" },
      items: [
        { en: "Store in cool, shaded areas", ar: "التخزين في أماكن باردة ومظللة" },
        { en: "Use covered containers to prevent contamination", ar: "استخدام أوعية مغطاة لمنع التلوث" },
        { en: "Consume cooked meals within 4–6 hours", ar: "تناول الوجبات المطبوخة خلال 4-6 ساعات" },
        { en: "Keep bread in cloth bags, not plastic", ar: "حفظ الخبز في أكياس قماشية وليس بلاستيكية" },
      ],
      color: "orange",
    },
    {
      title: { en: "Children's Nutrition Priority", ar: "أولوية تغذية الأطفال" },
      description: {
        en: "Children need consistent nutrition for growth and development. Ensure they receive adequate portions from community meals daily.",
        ar: "يحتاج الأطفال إلى تغذية مستمرة للنمو والتطور. تأكد من حصولهم على حصص كافية من الوجبات المجتمعية يومياً.",
      },
      listTitle: { en: "Essential for Children:", ar: "ضروريات للأطفال:" },
      items: [
        { en: "Protein-rich foods (lentils, beans, eggs)", ar: "الأطعمة الغنية بالبروتين (عدس، بقوليات، بيض)" },
        { en: "Regular meal times (3 meals daily)", ar: "مواعيد منتظمة للوجبات (3 وجبات يومياً)" },
        { en: "Adequate water intake", ar: "شرب كميات كافية من الماء" },
        { en: "Any available fruits or vegetables", ar: "أي فواكه أو خضروات متاحة" },
      ],
      color: "blue",
    },
  ],

  stretching: {
    title: { en: "Stretching Community Meals", ar: "مضاعفة فوائد الوجبات" },
    subtitle: {
      en: "Simple ways to make kitchen meals serve your family better and last longer",
      ar: "طرق بسيطة لجعل وجبات المطابخ تكفي عائلتك بشكل أفضل وتدوم لفترة أطول",
    },
    steps: [
      {
        number: 1,
        title: { en: "Add Vegetables or Greens", ar: "إضافة الخضروات أو الأوراق الخضراء" },
        text: { en: "If you can access any vegetables, adding them to soup or rice increases volume and nutrition.", ar: "إذا استطعت الحصول على أي خضروات، فإن إضافتها للحساء أو الأرز تزيد من حجم الوجبة وقيمتها الغذائية." },
      },
      {
        number: 2,
        title: { en: "Save Bread for Breakfast", ar: "توفير الخبز للإفطار" },
        text: { en: "Save bread for the next morning; stale bread can be softened with water or tea.", ar: "وفر بعض الخبز لصباح اليوم التالي؛ يمكن تليين الخبز الجاف بالماء أو الشاي." },
      },
      {
        number: 3,
        title: { en: "Split Into Smaller Portions", ar: "التقسيم إلى حصص صغيرة" },
        text: { en: "Serve smaller portions 3 times daily to maintain energy levels.", ar: "قدم حصصاً أصغر 3 مرات يومياً للحفاظ على مستويات الطاقة." },
      },
      {
        number: 4,
        title: { en: "Use All the Broth", ar: "استهلاك المرق بالكامل" },
        text: { en: "Soup broth contains nutrients — don't waste it.", ar: "مرق الحساء يحتوي على مواد مغذية — لا تهدره." },
      },
      {
        number: 5,
        title: { en: "Prioritize Pregnant & Nursing Mothers", ar: "الأولوية للحوامل والمرضعات" },
        text: { en: "Mothers need extra nutrition. Ensure they receive protein portions.", ar: "تحتاج الأمهات إلى تغذية إضافية. تأكد من حصولهن على حصص البروتين." },
      },
      {
        number: 6,
        title: { en: "Visit Multiple Kitchens", ar: "زيارة مطابخ متعددة" },
        text: { en: "Different kitchens serve different meals. Variety improves nutrition.", ar: "تقدم المطابخ المختلفة وجبات متنوعة. التنوع يحسن القيمة الغذائية." },
      },
    ],
  },
};


async function main() {
  console.log("🌱 Start seeding...");

  await prisma.healthTip.deleteMany({});
  await prisma.foodRecipe.deleteMany({});
  await prisma.kitchen.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.nutritionGuide.deleteMany({});

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
  };
  console.log("✅ Seeded doctors!");

  await prisma.nutritionGuide.create({
    data: {
      content: nutritionGuide // هنا نضع الكائن بالكامل داخل حقل content
    }
  });
  
  console.log("✅ Seeded nutritionGuide into the content field!");

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