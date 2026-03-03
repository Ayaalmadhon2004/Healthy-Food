// components/UserInitializer.jsx
"use client";
import { useEffect } from "react";
import { useUserData } from "@/hooks/useUserData";

export function UserInitializer() {
  const fetchUser = useUserData((state) => state.fetchUser);
  const listenToAuth = useUserData((state) => state.listenToAuth);

  useEffect(() => {
    fetchUser(); // جلب البيانات عند البداية
    const { unsubscribe } = listenToAuth(); // بدء مراقبة الجلسة
    
    return () => unsubscribe(); // تنظيف عند إغلاق المكون
  }, [fetchUser, listenToAuth]);

  return null;
}