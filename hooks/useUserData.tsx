"use client";

import { create } from "zustand";
import { useEffect } from "react";

// 1. تعريف واجهة بيانات المستخدم (تأكدي من مطابقتها لـ Prisma Schema)
interface User {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ORG" | "ADMIN"; // الأدوار المسموحة في نظامك
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

// متغير للتحكم في عدد مرات الطلب (اختياري، يفضل تركه false عند تصحيح الأخطاء)
let isFetched = false;

export const useUserData = create<UserState>((set) => ({
  user: null,
  loading: true, // نبدأ بـ true لانتظار الـ Fetch الأول
  error: null,

  // وظيفة لتحديث المستخدم يدوياً (مثلاً بعد تعديل الملف الشخصي)
  setUser: (user) => set({ user, loading: false }),

  // وظيفة لمسح البيانات عند تسجيل الخروج
  clearUser: () => {
    isFetched = false; 
    set({ user: null, loading: false, error: null });
  },

  // الوظيفة الأساسية لجلب البيانات من السيرفر
  fetchUser: async () => {
    // إذا كنتِ تريدين تحديثاً فورياً عند كل دخول للداشبورد، يمكنكِ تعطيل السطر التالي:
    // if (isFetched) return; 

    try {
      const res = await fetch("/api/auth/me");

      if (!res.ok) {
        throw new Error("Session expired or not authenticated");
      }

      const data = await res.json();

      // ملاحظة: تأكدي أن الـ API يعيد كائن يحتوي على { user: { role, ... } }
      if (data.user) {
        set({
          user: data.user,
          loading: false,
          error: null,
        });
        isFetched = true;
      } else {
        throw new Error("User data not found in response");
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch user";
      set({ 
        user: null, 
        loading: false, 
        error: errorMessage 
      });
      isFetched = true; // نعتبرها مكتملة حتى لو فشلت لمنع الحلقات اللانهائية
    }
  },
}));

/**
 * هوك مخصص لبدء عملية الجلب عند تحميل التطبيق لأول مرة.
 * يوضع عادة في Layout أو Dashboard Page.
 */
export function useInitUser() {
  const fetchUser = useUserData((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
}