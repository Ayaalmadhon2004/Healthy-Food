"use client"

import { create } from "zustand"
import { useEffect } from "react"

interface User {
  id: string;
  email: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

let isFetched = false;

export const useUserData = create<UserState>((set) => ({
  user: null,
  loading: !isFetched, 
  error: null,

  setUser: (user: User | null) => set({ user, loading: false }),

  clearUser: () =>
    set({
      user: null,
      loading: false,
      error: null,
    }),

  fetchUser: async () => {
    if (isFetched) return;

    try {
      const res = await fetch("/api/auth/me")

      if (!res.ok) {
        throw new Error("Not authenticated")
      }

      const data = await res.json()

      isFetched = true;
      set({
        user: data.user,
        loading: false,
        error: null,
      })
    } catch (err: unknown) { 
      isFetched = true;
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user";
      set({
        user: null,
        loading: false,
        error: errorMessage,
      })
    }
  },
}))


export function useInitUser() {
  const fetchUser = useUserData((state: UserState) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])
}