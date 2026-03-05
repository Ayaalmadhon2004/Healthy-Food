import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavStore = create()( 
  persist(
    (set, get) => ({
      favItems: [],
      isFavOpen: false,

      openFav: () => set({ isFavOpen: true }),
      closeFav: () => set({ isFavOpen: false }),
      setFavItems: (items) => set({ favItems: items }),

      toggleFavorite: async (meal, userId) => { 
        const currentItems = get().favItems;
        const mealId = Number(meal.id); 
        const isExist = currentItems.find((item) => Number(item.id) === mealId);

        if (isExist) {
          set({ favItems: currentItems.filter((item) => Number(item.id) !== mealId) });
        } else {
          set({ favItems: [...currentItems, meal] });
        }

        if (userId) {
          try {
            const response = await fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: userId,
                recipeId: mealId, 
                mealData: meal, 
              }),
            });

            if (!response.ok) {
              const err = await response.json();
              throw new Error(err.details || "Server sync failed");
            }
          } catch (error) {
            console.error("❌ Sync Error:", error.message);
          }
        }
      },

      clearAllFavorites: () => set({ favItems: [] }), 
    }),
    { name: "nutriflow-favs" } 
  )
);