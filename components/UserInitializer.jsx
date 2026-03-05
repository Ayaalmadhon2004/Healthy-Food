// components/UserInitializer.jsx
"use client";
import { useEffect } from "react";
import { useUserData } from "@/hooks/useUserData";

export function UserInitializer() {
  const fetchUser = useUserData((state) => state.fetchUser);
  const listenToAuth = useUserData((state) => state.listenToAuth);

  useEffect(() => {
    fetchUser();
    const { unsubscribe } = listenToAuth(); 
    
    return () => unsubscribe(); 
  }, [fetchUser, listenToAuth]);

  return null;
}