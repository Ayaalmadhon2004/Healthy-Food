// app/api/meals/route.js
import { NextResponse } from "next/server";

const meals = [
  {
    id: 0,
    img: "/assets/Berry.jpg",
    type: "Breakfast",
    title: "Berry Smoothie Bowl",
    time: "5 min",
    cal: "280cal",
  },
  {
    id: 1,
    img: "/assets/Quinoa Buddha Bowl.jpg",
    type: "Lunch",
    title: "Quinoa Buddha Bowl",
    time: "15 min",
    cal: "420cal",
  },
  {
    id: 2,
    img: "/assets/Grilled Salmon.jpg",
    type: "Dinner",
    title: "Grilled Salmon",
    time: "20 min",
    cal: "520cal",
  },
  {
    id: 3,
    img: "/assets/Greek Salad.jpg",
    type: "Lunch",
    title: "Greek Salad",
    time: "10 min",
    cal: "310cal",
  },
  {
    id: 4,
    img: "/assets/Chicken Stir Fry.jpg",
    type: "Dinner",
    title: "Chicken Stir Fry",
    time: "25 min",
    cal: "480cal",
  },
  {
    id: 5,
    img: "/assets/Avocado Toast.jpg",
    type: "Breakfast",
    title: "Avocado Toast",
    time: "8 min",
    cal: "320cal",
  },
  {
    id: 6,
    img: "/assets/Lentil Soup.jpg",
    type: "Lunch",
    title: "Lentil Soup",
    time: "30 min",
    cal: "290cal",
  },
  {
    id: 7,
    img: "/assets/Veggie Wrap.jpg",
    type: "Lunch",
    title: "Veggie Wrap",
    time: "12 min",
    cal: "350cal",
  },
];

export async function GET() {
  return NextResponse.json(meals);
}
