"use client";

import { create } from "zustand";
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
  listenToAuth: () => void;
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
        set({ loading: true, error: null });
        await get().fetchUser();
      } else if (event === 'SIGNED_OUT') {
        get().clearUser();
      }
    });
    return subscription;
  },

  fetchUser: async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: 'no-store' });
      if (!res.ok) throw new Error("Session expired or server error");

      const data = await res.json();
      if (!data?.user) {
        set({ user: null, loading: false, error: null });
        return;
      }

      const userFromServer = data.user;
      set({ user: userFromServer, loading: false, error: null });
      try {
        const favRes = await fetch(`/api/favorites?userId=${userFromServer.id}`);
        if (favRes.ok) {
          const favData = await favRes.json();
          if (favData.favorites) {
            const localFavs = useFavStore.getState().favItems;
            const serverFavs = favData.favorites;
            const combinedMap = new Map();
            [...localFavs, ...serverFavs].forEach(item => {
              if (item.id) combinedMap.set(item.id, item);
            });
            useFavStore.getState().setFavItems(Array.from(combinedMap.values()));
          }
        }
      } catch (favErr) {
        console.error("Error syncing favorites:", favErr);
      }
    } catch (err: unknown) {
      const { data: { session } } = await supabase.auth.getSession();
      const errorMessage = err instanceof Error ? err.message : "Unknown sync error";
      if (!session) {
        set({ user: null, loading: false, error: errorMessage });
      } else {
        set({ loading: false, error: "Server sync failed, but session exists." });
      }
    }
  },

}));