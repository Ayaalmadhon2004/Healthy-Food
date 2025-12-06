export async function GET() {
  const data = [
    {
      id: 0,
      header: "Hydration",
      icon: "💧",
      advice: "Stay hydrated throughout the day.",
      details:
        "Drinking enough water helps maintain energy, focus, and digestive health.",
      moreDetails: `
        • Aim for 6–8 cups of water daily depending on your activity level.  
        • Hydration improves skin elasticity, supports kidney function, and prevents headaches.  
        • Add lemon or mint if you don’t like plain water.  
        • Drink more water in hot weather or after exercise.  
        • Signs you’re dehydrated: dry mouth, dark urine, fatigue, and dizziness.
      `,
    },
    {
      id: 1,
      header: "Healthy Meals",
      icon: "🥗",
      advice: "Eat balanced meals.",
      details:
        "Include proteins, vegetables, carbs, and healthy fats in every meal.",
      moreDetails: `
        • Balanced meals stabilize blood sugar and keep hunger away longer.  
        • Good proteins: chicken, eggs, legumes, tofu.  
        • Healthy fats: avocado, olive oil, nuts.  
        • Avoid skipping meals—your metabolism slows down.  
        • Try the “half plate vegetables” rule to improve digestion and vitamins.
      `,
    },
    {
      id: 2,
      header: "Sleep",
      icon: "🛌",
      advice: "Get enough sleep.",
      details:
        "7–9 hours of good quality sleep boosts mood and productivity.",
      moreDetails: `
        • Create a sleep routine: same sleep and wake time daily.  
        • Reduce screen use 1 hour before bed.  
        • A cool, dark room improves sleep quality.  
        • Avoid heavy meals and caffeine late at night.  
        • Good sleep boosts memory, skin health, and hormones.
      `,
    },
    {
      id: 3,
      header: "Movement",
      icon: "🚶‍♀️",
      advice: "Move your body daily.",
      details:
        "Even a 15-minute walk improves circulation and reduces stress.",
      moreDetails: `
        • Try walking after meals to help digestion.  
        • Light movement reduces back pain and stiffness.  
        • Desk worker? Move every 45–60 minutes.  
        • Mix cardio with stretching for balance.  
        • Movement improves mood by increasing endorphins.
      `,
    },
    {
      id: 4,
      header: "Breathing",
      icon: "🌿",
      advice: "Take deep breaths.",
      details:
        "Slow breathing relaxes your nervous system and reduces anxiety.",
      moreDetails: `
        • Try 4-4-6 breathing: inhale 4 sec, hold 4 sec, exhale 6 sec.  
        • Helps calm your mind and heart rate.  
        • Useful during stress, exams, or work pressure.  
        • Deep breathing improves oxygen flow and sharpens focus.  
        • Pair it with meditation for even better results.
      `,
    },
  ];

  return Response.json(data);
}
