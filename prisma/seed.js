// prisma/seed.js
import { PrismaClient } from "../src/generated/index.js"; 
import { PrismaPg } from '@prisma/adapter-pg'; // إذا كنت تستخدم Postgres
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// تمرير الـ adapter هنا ضروري في الإصدار 7
const prisma = new PrismaClient({ adapter });

const healthTips = [
  {
    header: "Hydration",
    iconName: "Droplet",
    advice: "Stay hydrated.",
    details: "Drink enough water daily.",
    moreDetails: "Water improves energy, focus, and digestion."
  },
  {
    header: "Healthy Meals",
    iconName: "Activity",
    advice: "Eat balanced meals.",
    details: "Include proteins, vegetables, carbs, and fats.",
    moreDetails: "Balanced meals give your body essential nutrients."
  },
  {
    header: "Sleep",
    iconName: "Bed",
    advice: "Get enough sleep.",
    details: "7–9 hours improves mood and productivity.",
    moreDetails: "Quality sleep is essential for emotional well-being."
  },
  {
    header: "Movement",
    iconName: "Activity",
    advice: "Move daily.",
    details: "15-minute walks improve circulation.",
    moreDetails: "Regular activity reduces stress and boosts health."
  },
  {
    header: "Breathing",
    iconName: "Leaf",
    advice: "Take deep breaths.",
    details: "Slow breathing relaxes your nervous system.",
    moreDetails: "Deep breathing lowers anxiety and stress."
  }
];
async function main() {
  // نصيحة احترافية: استخدم createMany للأداء الأفضل بدلاً من Loop
  await prisma.HealthTip.createMany({
    data: healthTips,
    skipDuplicates: true, // اختياري: لتجنب الخطأ إذا كانت البيانات موجودة مسبقاً
  });
  console.log("✅ Seeded health tips successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });