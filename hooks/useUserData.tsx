"use client";
// in this all page i was thinking that in hooks , i put all hooks , but here in this file it seams like use a logic like an actions not hooks ??????

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
  listenToAuth: () => any;
}

export const useUserData = create<UserState>((set, get) => ({ // why i am using create here 
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }), // what do we mean by this line 

  clearUser: () => {
    useFavStore.getState().clearAllFavorites(); 
    set({ user: null, loading: false, error: null });
  }, // setUser and ClearUser where i am using them and how ?

  listenToAuth: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => { // this is take long time or not , what is take long time ? 
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

  // where here i am calling fetch("/api/auth/me here in useUserData not direct in the ui ? , why in hooks section ?
  fetchUser: async () => {
  try {
    const res = await fetch("/api/auth/me", { cache: 'no-store' });
    
    if (!res.ok) throw new Error("Session expired or server error");

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
          
          [...localFavs, ...serverFavs].forEach(item => {
              if (item.id) combinedMap.set(item.id, item);
          });

          const finalFavorites = Array.from(combinedMap.values());
          useFavStore.getState().setFavItems(finalFavorites);
        }
      } catch (favErr) {
        console.error("Error syncing favorites:", favErr);
      }
    }
  } catch (err: any) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      set({ user: null, loading: false, error: err.message });
    } else {
      set({ loading: false, error: "Server sync failed, but session exists." });
    }
  }
},

}));

export function useInitUser() {
  const fetchUser = useUserData((state) => state.fetchUser);
  const listenToAuth = useUserData((state) => state.listenToAuth);

  useEffect(() => { // explain to me with real example what this useEffect do and contain ?
    fetchUser();
    const subscription = listenToAuth();

      return () => {
      if (subscription?.unsubscribe) subscription.unsubscribe();
    };
  }, [fetchUser, listenToAuth]);
}