"use client";

import { create } from "zustand";
import { useFavStore } from "@/store/useFavStore";
import { getSupabase } from "@/lib/supabase/client";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ORG" | "ADMIN" | "DOCTOR";
}

// Last known identity, kept in localStorage so the navbar can paint the right
// links/name immediately while the real session check is still in flight.
export interface UserHint {
  name?: string;
  email?: string;
  role: User["role"];
}

const HINT_KEY = "nf-user-hint";

export function readUserHint(): UserHint | null {
  try {
    const raw = window.localStorage.getItem(HINT_KEY);
    return raw ? (JSON.parse(raw) as UserHint) : null;
  } catch {
    return null;
  }
}

function writeUserHint(user: User | null) {
  try {
    if (user) {
      const hint: UserHint = { name: user.name, email: user.email, role: user.role };
      window.localStorage.setItem(HINT_KEY, JSON.stringify(hint));
    } else {
      window.localStorage.removeItem(HINT_KEY);
    }
  } catch {
    // storage unavailable (private mode etc.) - the hint is only an optimisation
  }
}

interface UserState {
  user: User | null;
  hint: UserHint | null;
  setHint: (hint: UserHint | null) => void;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
  listenToAuth: () => { unsubscribe: () => void };
}

export const useUserData = create<UserState>((set, get) => ({ 
  user: null,
  hint: null,
  setHint: (hint) => set({ hint }),
  loading: true,
  error: null,

  setUser: (user) => {
    writeUserHint(user);
    set({ user, hint: null, loading: false });
  },

  clearUser: () => {
    useFavStore.getState().clearAllFavorites(); 
    writeUserHint(null);
    set({ user: null, hint: null, loading: false, error: null });
  },

  listenToAuth: () => {
    // The Supabase client is loaded lazily, so the subscription is attached once it
    // arrives. `unsubscribe` also works if it is called before that happens.
    let cancelled = false;
    let subscription: { unsubscribe: () => void } | null = null;

    getSupabase()
      .then((supabase) => {
        if (cancelled) return;
        subscription = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            set({ loading: true, error: null });
            await get().fetchUser();
          } else if (event === 'SIGNED_OUT') {
            get().clearUser();
          }
        }).data.subscription;
      })
      .catch((err) => console.error("Could not start the auth listener:", err));

    return {
      unsubscribe: () => {
        cancelled = true;
        subscription?.unsubscribe();
      },
    };
  },

  fetchUser: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Session expired or server error");

      const data = await res.json();
      if (!data?.user) {
        writeUserHint(null);
        set({ user: null, hint: null, error: null });
        return;
      }

      const userFromServer = data.user;
      writeUserHint(userFromServer);
      set({ user: userFromServer, hint: null, error: null });
      try {
        const favRes = await fetch("/api/favorites");
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
      try {
        const supabase = await getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        const errorMessage = err instanceof Error ? err.message : "Unknown sync error";
        if (!session) {
          writeUserHint(null);
          set({ user: null, hint: null, error: errorMessage });
        } else {
          set({ error: "Server sync failed, but session exists." });
        }
      } catch (innerErr) {
        console.error("Error while checking supabase session:", innerErr);
        set({ user: null, error: "Auth check failed." });
      }
    } finally {
      set({ loading: false });
    }
  },

}));