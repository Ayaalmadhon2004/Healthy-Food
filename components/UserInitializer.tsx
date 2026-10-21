"use client";

import { useEffect, useRef } from "react";
import { readUserHint, useUserData } from "@/hooks/useUserData";
import { useFavStore } from "@/store/useFavStore";

// True when this browser could hold a session: Supabase writes sb-<project>-auth-token cookies
// (readable from JS), and we also remember the last identity in localStorage after sign-in.
function mightBeSignedIn(hintPresent: boolean): boolean {
  if (hintPresent) return true;
  return document.cookie.split("; ").some((c) => c.startsWith("sb-") && c.includes("-auth-token"));
}

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

    // Restore saved favorites before anything reads or merges them.
    void useFavStore.persist.rehydrate();
    const hint = readUserHint();
    setHint(hint);

    // A visitor who has never signed in has nothing to look up: skip the /api/auth/me request
    // and keep the Supabase client out of the page entirely. Signing in goes through
    // /api/auth/login, which fills the user store directly.
    if (!mightBeSignedIn(hint !== null)) {
      useUserData.setState({ loading: false });
      return;
    }

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