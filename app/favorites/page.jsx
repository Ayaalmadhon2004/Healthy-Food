"use client";
import { useFavStore } from "@/store/useFavStore";
import RecipeCard from "@/components/recipes/RecipeCard";
import { HeartOff } from "lucide-react";
import Link from "next/link";

export default function FavoritesPage() {
  const { favItems } = useFavStore();

  return (
    <main className="min-h-screen pt-28 pb-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-500">All the recipes you loved in one place</p>
        </header>

        {favItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <HeartOff size={64} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800">Your list is empty</h2>
            <p className="text-gray-500 mt-2 mb-6">Start exploring and save your first recipe!</p>
            <Link 
              href="/recipes" 
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95"
            >
              Browse Recipes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favItems.map((meal, index) => (
              <RecipeCard key={meal.id} meal={meal} index={index} lang="en" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}