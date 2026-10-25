"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/LocaleLink";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const NOTIFICATIONS_CHANGED = "nf:notifications";
const POLL_MS = 60_000;

// Unread appointment updates for a signed-in patient. Rendered only once the session is confirmed,
// so it never delays the navbar.
export default function NotificationBell({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [wiggle, setWiggle] = useState(false);
  const seen = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { count?: number };
      const next = typeof data.count === "number" ? data.count : 0;
      if (next > seen.current) setWiggle(true);
      seen.current = next;
      setCount(next);
    } catch {
      // offline or server hiccup: keep the last number
    }
  }, []);

  useEffect(() => {
    // Deferred so the state update is not synchronous in the effect body.
    void Promise.resolve().then(refresh);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    window.addEventListener(NOTIFICATIONS_CHANGED, refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(NOTIFICATIONS_CHANGED, refresh);
    };
    // pathname: look again after every navigation (e.g. coming back from the appointments page)
  }, [refresh, pathname]);

  const isAr = lang === "ar";
  const label = count > 0
    ? (isAr ? `تحديثات المواعيد، ${count} جديد` : `Appointment updates, ${count} new`)
    : (isAr ? "تحديثات المواعيد" : "Appointment updates");

  if (mobile) {
    return (
      <Link href="/dashboard/appointments" onClick={onClick} className="text-base text-ink">
        {isAr ? "تحديثات المواعيد" : "Appointment updates"}{count > 0 ? ` (${count})` : ""}
      </Link>
    );
  }

  return (
    <Link href="/dashboard/appointments" aria-label={label} className="relative inline-flex items-center justify-center w-11 h-11 -mx-2 text-ink-soft hover:text-olive-800">
      <Bell aria-hidden="true" className={`w-5 h-5 ${wiggle ? "bell-wiggle" : ""}`} strokeWidth={1.75} onAnimationEnd={() => setWiggle(false)} />
      {count > 0 && (
        <span aria-hidden="true" className="absolute top-1 end-0 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-clay-700 text-white flex items-center justify-center text-[0.6875rem] font-semibold leading-none">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
