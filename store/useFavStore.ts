import { create } from "zustand";
import { persist } from "zustand/middleware";

// A favorite recipe as shown in the UI (the recipe fields plus its id).
export interface FavItem {
  id: number | string;
  [key: string]: unknown;
}

interface FavState {
  favItems: FavItem[];
  isFavOpen: boolean;
  openFav: () => void;
  closeFav: () => void;
  setFavItems: (items: FavItem[]) => void;
  toggleFavorite: (meal: FavItem, userId?: string | null) => Promise<void>;
  clearAllFavorites: () => void;
}

export const useFavStore = create<FavState>()(
  persist(
    (set, get) => ({
      favItems: [],
      isFavOpen: false,

      openFav: () => set({ isFavOpen: true }),
      closeFav: () => set({ isFavOpen: false }),
      setFavItems: (items) => set({ favItems: items }),

      // Updates the UI right away, then asks the server to toggle the favorite
      // (the server identifies the user from the session).
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
              body: JSON.stringify({ recipeId: mealId }),
            });

            if (!response.ok) {
              const err: { error?: string } = await response.json().catch(() => ({}));
              throw new Error(err.error || "Server sync failed");
            }
          } catch (error) {
            console.error("Sync Error:", error instanceof Error ? error.message : error);
          }
        }
      },

      clearAllFavorites: () => set({ favItems: [] }),
    }),
    { name: "nutriflow-favs" }
  )
);
