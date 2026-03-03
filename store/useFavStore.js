import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useFavStore = create(
  persist(
    (set, get) => ({
      favItems: [],
      
      // دالة التبديل (إضافة/حذف)
      toggleFavorite: async (item, userId) => {
        const currentFavs = get().favItems;
        // نستخدم معرف فريد للتأكد من المقارنة (id)
        const isExist = currentFavs.some((i) => i.id === item.id);

        let newFavs;
        if (isExist) {
          newFavs = currentFavs.filter((i) => i.id !== item.id);
        } else {
          newFavs = [...currentFavs, item];
        }

        // ✅ تحديث الحالة فوراً وبشكل صريح
        set({ favItems: newFavs });

        // المزامنة مع السيرفر
        if (userId) {
          try {
            await fetch("/api/favorites", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                recipeId: item.id,
                mealData: item,
              }),
            });
          } catch (error) {
            console.error("Failed to sync favorite:", error);
          }
        }
      },

      setFavItems: (items) => {
        // نضمن أن البيانات القادمة من السيرفر مصفوفة دائماً
        set({ favItems: Array.isArray(items) ? items : [] });
      },
      
      clearAllFavorites: () => set({ favItems: [] }),
    }),
    {
      name: "favorites-storage",
      storage: createJSONStorage(() => localStorage), // تحديد مكان التخزين بوضوح
      // نختار فقط favItems للحفظ لتقليل حجم التخزين
      partialize: (state) => ({ favItems: state.favItems }),
    }
  )
);