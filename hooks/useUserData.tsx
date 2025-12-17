// import { useEffect, useState } from "react";

// export function useUserData() {

//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchUserData = async () => {
//       try {
//         const res = await fetch("/api/auth/me", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         });

//         if (!res.ok) {
//           throw new Error("Failed to fetch user data");
//         }

//         const data = await res.json();

//         if (isMounted) {
//           setUserData(data.user);
//         }

//         console.log("Fetched user data:", data.user);
//       } catch (err) {
//         if (isMounted) {
//           setError(err.message);
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchUserData();

  
//   }, []);

//   return { userData, loading, error, setUserData };
// }

// /*
// Usage:

// import { useUserData } from "@/hooks/useUserData";

// const { userData, loading, error } = useUserData();
// */


















// import { useEffect } from "react"
// import { useUserStore } from "@/store/useUserStore"

// export function useUserData() {
//   const {
//     user,
//     loading,
//     error,
//     setUser,
//     setLoading,
//     setError,
//   } = useUserStore();

//   useEffect(() => {
//     if (user) {
//       setLoading(false)
//       return
//     }

//     let isMounted = true

//     const fetchUserData = async () => {
//       try {
//         const res = await fetch("/api/auth/me")

//         if (!res.ok) {
//           throw new Error("Not authenticated")
//         }

//         const data = await res.json();

//         if (isMounted) {
//           setUser(data.user)
//         }
//       } catch (err: any) {
//         if (isMounted) {
//           setError(err.message)
//           setUser(null)
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false)
//         }
//       }
//     }

//     fetchUserData()

//     return () => {
//       isMounted = false
//     }
//   }, [user, setUser, setLoading, setError]);



//   return { user, loading, error }
// }





















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
    const { user, loading } = get()

    // ✅ لا تعيد الطلب إذا المستخدم موجود أو الطلب انتهى
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
