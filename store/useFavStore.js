import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavStore = create(
  persist(
    (set) => ({
      favItems: [],
      isFavOpen: false,


      toggleFavorite: (item) =>
        set((state) => {
          const isExist = state.favItems.some((i) => i.id === item.id);
          if (isExist) {
            return {
              favItems: state.favItems.filter((i) => i.id !== item.id),
            };
          }
          return {
            favItems: [...state.favItems, item],
          };
        }),

      openFav: () => set({ isFavOpen: true }),
      closeFav: () => set({ isFavOpen: false }),
      toggleFavDrawer: () => set((state) => ({ isFavOpen: !state.isFavOpen })),

      clearAllFavorites: () => set({ favItems: [] }),
    }),
    {
      name: "favorites-storage", 
      partialize: (state) => ({ favItems: state.favItems }), 
    }
  )
);