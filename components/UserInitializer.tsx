"use client";

import { useEffect, useRef } from "react";
import { readUserHint, useUserData } from "@/hooks/useUserData";

export function UserInitializer() {
  const fetchUser = useUserData((state) => state.fetchUser);
  const listenToAuth = useUserData((state) => state.listenToAuth);
  const setHint = useUserData((state) => state.setHint);
  const idleCallbackId = useRef<number | null>(null);

  useEffect(() => {
    const scheduleAuthFetch = () => {
      if (typeof window === "undefined") return;

      if (window.requestIdleCallback) {
        idleCallbackId.current = window.requestIdleCallback(() => {
          fetchUser();
        });
      } else {
        idleCallbackId.current = window.setTimeout(() => {
          fetchUser();
        }, 250);
      }
    };

    setHint(readUserHint());
    scheduleAuthFetch();
    const subscription = listenToAuth();

    return () => {
      if (idleCallbackId.current != null) {
        if (window.cancelIdleCallback) {
          window.cancelIdleCallback(idleCallbackId.current);
        } else {
          window.clearTimeout(idleCallbackId.current);
        }
      }
      subscription.unsubscribe();
    };
  }, [fetchUser, listenToAuth, setHint]);

  return null;
}