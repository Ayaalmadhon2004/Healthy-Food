"use client"

import { create } from "zustand"
import { useEffect } from "react"

// 1. تعريف واجهة المستخدم (User Interface)
interface User {
  id: string;
  email: string;
  // أضيفي أي حقول إضافية تستخدمينها هنا
}

// 2. تعريف واجهة الحالة (Store Interface)
interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

let isFetched = false;

// 3. تمرير الواجهة لـ create لضمان النوع الصحيح لـ set و get
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
    } catch (err: unknown) { // استخدام unknown بدلاً من any كأفضل ممارسة
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

/* ----------------------------------
    Hook للتهيئة مرة واحدة
----------------------------------- */

export function useInitUser() {
  // تحديد نوع الـ state هنا بدقة ليختفي خطأ Unexpected any
  const fetchUser = useUserData((state: UserState) => state.fetchUser)

  useEffect(() => {
    fetchUser()
  }, [fetchUser])
}