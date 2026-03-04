"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { useFavStore } from "@/store/useFavStore";
import { supabase } from "@/lib/supabase/client"; 

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ORG" | "ADMIN";
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
  listenToAuth: () => any; // دالة المراقبة الجديدة
}

export const useUserData = create<UserState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }),

  clearUser: () => {
    useFavStore.getState().clearAllFavorites(); 
    set({ user: null, loading: false, error: null });
  },

  listenToAuth: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const newUser: User = {
          id: session.user.id,
          email: session.user.email || "",
          role: (session.user.user_metadata?.role as any) || "USER",
          name: session.user.user_metadata?.name
        };
        set({ user: newUser, loading: false });
        
        if (get().user?.id) {
            get().fetchUser(); 
        }
      } else if (event === 'SIGNED_OUT') {
        get().clearUser();
      }
    });
    return subscription;
  },

  fetchUser: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: 'no-store' });
      if (!res.ok) throw new Error("Session expired");

      const data = await res.json();

      if (data.user) {
        set({ user: data.user, loading: false, error: null });

        try {
          const favRes = await fetch(`/api/favorites?userId=${data.user.id}`);
          const favData = await favRes.json();
          
          if (favData.favorites) {
            const localFavs = useFavStore.getState().favItems;
            const serverFavs = favData.favorites;

            const combinedMap = new Map();
            [...serverFavs, ...localFavs].forEach(item => combinedMap.set(item.id, item));
            useFavStore.getState().setFavItems(Array.from(combinedMap.values()));
          }
        } catch (favErr) {
          console.error("Error syncing favorites:", favErr);
        }
      }
    } catch (err: any) {
      // إذا فشل الـ API، نحاول التأكد من Supabase مباشرة قبل المسح
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ user: null, loading: false });
      }
    }
  },
}));

// تحديث الـ Hook المستخدم في المكونات
export function useInitUser() {
  const fetchUser = useUserData((state) => state.fetchUser);
  const listenToAuth = useUserData((state) => state.listenToAuth);

  useEffect(() => {
    fetchUser();
    const subscription = listenToAuth();
    
    // تنظيف المراقبة عند إغلاق الصفحة
    return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [fetchUser, listenToAuth]);
}