// lib/health-tips-data.js
import { Droplet, Bed, Leaf, Activity } from "lucide-react";

export const healthTips = [
  {
    id: 0,
    header: "Hydration",
    icon: Droplet, // نمرر الـ Component نفسه هنا
    advice: "Stay hydrated throughout the day.",
    details: "Drinking enough water helps maintain energy, focus, and digestive health.",
    moreDetails: `Drinking enough water is essential for maintaining energy levels, supporting focus, and ensuring healthy digestion. Staying hydrated throughout the day helps your body function optimally.`,
  },
  {
    id: 1,
    header: "Healthy Meals",
    icon: Activity,
    advice: "Eat balanced meals.",
    details: "Include proteins, vegetables, carbs, and healthy fats in every meal.",
    moreDetails: `Eating balanced meals provides your body with the necessary nutrients for overall health. A combination of proteins, vegetables, carbs, and healthy fats helps maintain steady energy levels.`,
  },
  {
    id: 2,
    header: "Sleep",
    icon: Bed,
    advice: "Get enough sleep.",
    details: "7–9 hours of good quality sleep boosts mood and productivity.",
    moreDetails: `Getting 7–9 hours of quality sleep each night is vital for emotional well-being and productivity. Good sleep allows your body to recover and prepare for the day ahead.`,
  },
  {
    id: 3,
    header: "Movement",
    icon: Activity,
    advice: "Move your body daily.",
    details: "Even a 15-minute walk improves circulation and reduces stress.",
    moreDetails: `Regular physical activity, such as a 15-minute daily walk, enhances blood circulation and reduces stress. Consistent movement contributes significantly to heart health.`,
  },
  {
    id: 4,
    header: "Breathing",
    icon: Leaf,
    advice: "Take deep breaths.",
    details: "Slow breathing relaxes your nervous system and reduces anxiety.",
    moreDetails: `Practicing deep, slow breathing helps relax the nervous system and lowers anxiety levels. It is a simple yet powerful way to calm your mind during stressful moments.`,
  },
];