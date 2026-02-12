import MealTracker from "@/components/dashboard/MealTracker";

export const metadata = {
  title: "Daily Tracker | NutriFlow",
  description: "Track your daily meals and calories",
};

export default function TrackerPage() {
  return (
    <section className="p-4 md:p-8 min-h-full">
      <MealTracker />
    </section>
  );
}