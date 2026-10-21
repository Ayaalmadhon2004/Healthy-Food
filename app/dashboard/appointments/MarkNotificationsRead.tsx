"use client";

import { useEffect } from "react";
import { markNotificationsReadAction } from "@/app/actions/appointmentActions";
import { NOTIFICATIONS_CHANGED } from "@/components/NotificationBell";

// Opening the page counts as reading the updates on it; the navbar bell then clears its badge.
export default function MarkNotificationsRead() {
  useEffect(() => {
    void markNotificationsReadAction().then((result) => {
      if (result.success) window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
    });
  }, []);
  return null;
}
