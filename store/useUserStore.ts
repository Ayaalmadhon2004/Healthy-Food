import { create } from "zustand"

type User = {
  id: string
  name: string
  email: string
} | null

type UserState = {
  user: User
  loading: boolean
  error: string | null
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearUser: () => set({ user: null }),
}))
