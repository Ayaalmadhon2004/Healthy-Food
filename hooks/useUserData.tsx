
"use client"

import { create } from "zustand"
import { useEffect } from "react"

export const useUserData = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user: any) => set({ user }),

  clearUser: () =>
    set({
      user: null,
      loading: false,
      error: null,
    }),

  fetchUser: async () => {
    const { user, loading }: any = get()

    if (user || !loading) return

    try {
      const res = await fetch("/api/auth/me")

      if (!res.ok) {
        throw new Error("Not authenticated")
      }

      const data = await res.json()

      set({
        user: data.user,
        loading: false,
        error: null,
      })
    } catch (err: any) {
      set({
        user: null,
        loading: false,
        error: err.message || "Failed to fetch user",
      })
    }
  },
}))

/* ----------------------------------
   Hook للتهيئة مرة واحدة
----------------------------------- */

export function useInitUser() {
  const fetchUser = useUserData((state: any) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])
}
