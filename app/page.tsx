"use client";
import { useRouter } from "next/navigation";
import { useUserData } from "@/hooks/useUserData";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
const { userData, loading } = useUserData();
console.log("User data in layout:ttttttttttttttttttttttttttttttttt", userData);




// useEffect(() => {
//   if (!userData?.email) {
//     window.location.href = "/login";
//   }
// }, [userData])


  useEffect(() => {
    if (!loading && !userData?.email) {
      window.location.href = "/login";
    }
  }, [loading, userData]);

  if (loading) return null; // or spinner
  return (
    <div className="bg-[var(--color-primary-light)] w-full min-h-screen text-center flex flex-col justify-center items-center gap-6 p-4 md:p-10">
      <h1 className="font-bold text-3xl md:text-5xl">
        Eat Healthy, Live Healthy
      </h1>

      <p className="text-[var(--color-gray-300)] text-lg md:text-2xl max-w-xl md:max-w-2xl">
        Discover delicious recipes, track your daily meals, and achieve your nutrition goals with our comprehensive healthy eating app.
      </p>

      <div className="flex flex-col md:flex-row gap-4 md:gap-10 mt-4">
        <button
          className="cursor-pointer bg-[var(--color-primary)] hover:bg-[var(--color-white)] hover:text-[var(--color-primary)] hover:border hover:border-[var(--color-primary)] text-white rounded-lg px-6 py-3 md:px-8 md:py-4"
          onClick={() => router.push("/recipes")}
        >
          Browse Recipes
        </button>
        <button
          className="cursor-pointer hover:bg-[var(--color-primary)] hover:text-white bg-[var(--color-white)] text-[var(--color-primary)] border border-[var(--color-primary)] rounded-lg px-6 py-3 md:px-8 md:py-4"
          onClick={() => router.push("/tracker")}
        >
          Start Tracking
        </button>
      </div>
    </div>
  );
}
