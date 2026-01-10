import { prisma } from '../lib/prisma.js'; 

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

const recipes = [
  {
    img: "/assets/Berry.jpg",
    type: "Breakfast",
    title: "Berry Smoothie Bowl",
    time: "5 min",
    cal: "280cal",
    nutrition: { protein: "10g", carbs: "35g", fat: "8g", fiber: "6g" },
    ingredients: ["1 cup frozen berries", "1 banana", "1/2 cup yogurt", "1/4 cup granola", "Honey (optional)"],
    instructions: ["Blend frozen berries, banana, and yogurt until smooth.", "Pour smoothie into a bowl.", "Top with granola and extra berries.", "Drizzle honey if desired."]
  },
  {
    img: "/assets/Quinoa Buddha Bowl.jpg",
    type: "Lunch",
    title: "Quinoa Buddha Bowl",
    time: "15 min",
    cal: "420cal",
    nutrition: { protein: "18g", carbs: "52g", fat: "14g", fiber: "12g" },
    ingredients: ["1 cup cooked quinoa", "1 can chickpeas, drained", "1 avocado, sliced", "2 cups mixed greens", "1 cup cherry tomatoes, halved", "1/2 cucumber, diced", "1/4 cup tahini", "Lemon juice, salt, pepper"],
    instructions: ["Cook quinoa according to package directions.", "Roast chickpeas with olive oil and spices at 400°F for 25 minutes.", "Arrange mixed greens in a bowl.", "Add cooked quinoa, chickpeas, avocado, tomatoes, and cucumber.", "Drizzle with tahini dressing.", "Season with salt and pepper."]
  },
  {
    img: "/assets/Grilled Salmon.jpg",
    type: "Dinner",
    title: "Grilled Salmon",
    time: "20 min",
    cal: "520cal",
    nutrition: { protein: "34g", carbs: "10g", fat: "32g", fiber: "2g" },
    ingredients: ["1 salmon fillet", "1 tbsp olive oil", "Salt and pepper", "1 lemon slice", "Steamed vegetables"],
    instructions: ["Season salmon with salt, pepper, and olive oil.", "Grill for 6–8 minutes per side.", "Serve with steamed vegetables.", "Garnish with lemon."]
  },
  {
    img: "/assets/Greek Salad.jpg",
    type: "Lunch",
    title: "Greek Salad",
    time: "10 min",
    cal: "310cal",
    nutrition: { protein: "7g", carbs: "14g", fat: "22g", fiber: "4g" },
    ingredients: ["1 cucumber, diced", "2 tomatoes, chopped", "1/4 cup olives", "Feta cheese", "Olive oil and lemon"],
    instructions: ["Chop all vegetables.", "Add olives and feta cheese.", "Drizzle with lemon and olive oil.", "Toss gently and serve."]
  },
  {
    img: "/assets/Chicken Stir Fry.jpg",
    type: "Dinner",
    title: "Chicken Stir Fry",
    time: "25 min",
    cal: "480cal",
    nutrition: { protein: "40g", carbs: "30g", fat: "18g", fiber: "5g" },
    ingredients: ["1 chicken breast, sliced", "1 cup mixed vegetables", "2 tbsp soy sauce", "1 tbsp olive oil", "1 garlic clove"],
    instructions: ["Cook chicken in olive oil until golden.", "Add vegetables and stir fry 5 minutes.", "Add soy sauce and garlic.", "Serve warm."]
  },
  {
    img: "/assets/Avocado Toast.jpg",
    type: "Breakfast",
    title: "Avocado Toast",
    time: "8 min",
    cal: "320cal",
    nutrition: { protein: "9g", carbs: "28g", fat: "20g", fiber: "7g" },
    ingredients: ["2 bread slices", "1 avocado", "Salt and pepper", "Cherry tomatoes"],
    instructions: ["Toast bread slices.", "Mash avocado and spread over toast.", "Season with salt and pepper.", "Add cherry tomatoes on top."]
  },
  {
    img: "/assets/Lentil Soup.jpg",
    type: "Lunch",
    title: "Lentil Soup",
    time: "30 min",
    cal: "290cal",
    nutrition: { protein: "16g", carbs: "40g", fat: "4g", fiber: "15g" },
    ingredients: ["1 cup red lentils", "1 onion, chopped", "1 carrot, chopped", "1 tbsp olive oil", "Salt, pepper, cumin"],
    instructions: ["Cook onions and carrots in olive oil.", "Add lentils and water.", "Simmer for 20 minutes.", "Blend if desired and season."]
  },
  {
    img: "/assets/Veggie Wrap.jpg",
    type: "Lunch",
    title: "Veggie Wrap",
    time: "12 min",
    cal: "350cal",
    nutrition: { protein: "12g", carbs: "44g", fat: "11g", fiber: "8g" },
    ingredients: ["1 tortilla wrap", "1/2 cup mixed veggies", "Hummus", "Lettuce", "Salt and pepper"],
    instructions: ["Spread hummus on tortilla.", "Add veggies and lettuce.", "Roll tightly.", "Slice and enjoy."]
  }
];

const kitchens = [
    {
      name: "Al-Sadaqa Kitchen",
      location: "Al-Shuja'iyya, Gaza City",
      region: "Gaza",
      distribution_time: "1:00 PM",
      capacity: "350-500 families",
      todays_meal: "Lentil soup + bread",
      access_info: "Open to all families. No registration needed.",
      contact: "+970-599-123456"
    },
    {
      name: "Rahma Charity Kitchen",
      location: "Beit Lahia, North Gaza",
      region: "North",
      distribution_time: "12:30 PM",
      capacity: "300 families",
      todays_meal: "Rice & beans",
      access_info: "First come, first served. Bring your own containers.",
      contact: "+970-597-554321"
    },
    {
      name: "Al-Amal Women's Community Kitchen",
      location: "Nuseirat Camp, Middle Area",
      region: "Middle",
      distribution_time: "2:00 PM",
      capacity: "250 families",
      todays_meal: "Vegetable soup",
      access_info: "Women-run kitchen. Wheelchair accessible entrance.",
      contact: "+970-592-876543"
    },
    {
      name: "Khan Younis Public Kitchen",
      location: "Khan Younis Camp, Khan Younis",
      region: "Khan Younis",
      distribution_time: "1:30 PM",
      capacity: "600 families",
      todays_meal: "Chicken rice (weekly), lentils (daily)",
      access_info: "Large capacity. Multiple distribution points in the camp.",
      contact: "+970-591-334477"
    },
    {
      name: "Al-Tadhamon Social Kitchen",
      location: "Tal Al-Sultan, Rafah",
      region: "Rafah",
      distribution_time: "12:00 PM",
      capacity: "200 families",
      todays_meal: "Pasta + tomato sauce",
      access_info: "Located near main road. Easy to find.",
      contact: "+970-599-884422"
    }
];

const doctorsData = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Nutritionist",
      qualifications: ["RD, LDN", "MS Nutrition", "Certified Nutrition Specialist"],
      rating: 4.9,
      reviews: 127,
      location: "New York, NY",
      phone: "+1 (555) 123-4567",
      email: "sarah@nutritioncare.com",
      about:
        "Dr. Sarah specializes in personalized nutrition plans for weight management and chronic disease prevention.",
      image: "/assets/doctor1.jpg",
      availability: "Mon-Fri, 9AM-5PM",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Cardiologist & Wellness",
      qualifications: ["MD", "Board Certified Cardiology", "Preventive Medicine"],
      rating: 4.8,
      reviews: 98,
      location: "San Francisco, CA",
      phone: "+1 (555) 234-5678",
      email: "michael@wellnessmd.com",
      about:
        "Dr. Chen focuses on heart-healthy nutrition and lifestyle modifications to prevent cardiovascular disease.",
      image: "/assets/doctor1.jpg",
      availability: "Mon-Thu, 10AM-6PM",
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Holistic Health Coach",
      qualifications: ["PhD Nutrition Science", "Holistic Health Certification", "Yoga Instructor"],
      rating: 4.9,
      reviews: 156,
      location: "Austin, TX",
      phone: "+1 (555) 345-6789",
      email: "emily@holistichealth.com",
      about:
        "Emily combines modern nutrition science with holistic wellness practices for sustainable health transformation.",
      image: "/assets/doctor1.jpg",
      availability: "Flexible Scheduling",
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialty: "Sports Nutritionist",
      qualifications: ["RD, CSSD", "Sports Nutrition Specialist", "Exercise Physiology"],
      rating: 4.7,
      reviews: 112,
      location: "Los Angeles, CA",
      phone: "+1 (555) 456-7890",
      email: "james@sportsnutrition.com",
      about: "James helps athletes and fitness enthusiasts optimize their nutrition for peak performance and recovery.",
      image: "/assets/doctor1.jpg",
      availability: "Tue-Sat, 8AM-8PM",
    },
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
    data: recipes,
  });
  console.log("✅ Seeded Food Recipes!");


  await prisma.kitchen.createMany({
    data: kitchens 
  });
  console.log("✅ Seeded kitchens!");

  await prisma.doctor.createMany({
    data:doctorsData
  });
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