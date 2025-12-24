import { Droplet, Bed, Leaf, Activity } from "lucide-react";

export async function GET() {
  const data = [
    {
      id: 0,
      header: "Hydration",
      icon: Droplet,
      advice: "Stay hydrated throughout the day.",
      details:
        "Drinking enough water helps maintain energy, focus, and digestive health.",
      moreDetails: `...`,
    },
    {
      id: 1,
      header: "Healthy Meals",
      icon: Activity, 
      advice: "Eat balanced meals.",
      details: "Include proteins, vegetables, carbs, and healthy fats in every meal.",
      moreDetails: `...`,
    },
    {
      id: 2,
      header: "Sleep",
      icon: Bed,
      advice: "Get enough sleep.",
      details: "7–9 hours of good quality sleep boosts mood and productivity.",
      moreDetails: `...`,
    },
    {
      id: 3,
      header: "Movement",
      icon: Activity,
      advice: "Move your body daily.",
      details: "Even a 15-minute walk improves circulation and reduces stress.",
      moreDetails: `...`,
    },
    {
      id: 4,
      header: "Breathing",
      icon: Leaf,
      advice: "Take deep breaths.",
      details: "Slow breathing relaxes your nervous system and reduces anxiety.",
      moreDetails: `...`,
    },
  ];

  return Response.json(data);
}
