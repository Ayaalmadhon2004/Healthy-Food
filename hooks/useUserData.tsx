"use client"

import { create } from "zustand"
import { useEffect } from "react"

let isFetched = false;

export const useUserData = create((set, get) => ({
  user: null,
  loading: !isFetched, 
  error: null,

  setUser: (user: any) => set({ user, loading: false }),

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
    } catch (err: any) {
      isFetched = true;
      set({
        user: null,
        loading: false,
        error: err.message || "Failed to fetch user",
      })
    }
  },
}))

export function useInitUser() {
  const fetchUser: any = useUserData((state) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])
}