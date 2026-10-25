"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  /** Locale for digit formatting, e.g. "ar" or "en". */
  locale?: string;
  suffix?: string;
  duration?: number;
};

// Counts from the last shown number to `value`. The server HTML carries the
// final number, and reduced-motion users get it without any counting.
export default function CountUp({ value, locale = "en", suffix = "", duration = 700 }: Props) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const first = useRef(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = first.current ? 0 : from.current;
    first.current = false;
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const p = (reduced ? 1 : Math.min(1, (now - t0) / duration));
      const eased = 1 - Math.pow(1 - p, 3);
      const next = Math.round(start + (value - start) * eased);
      from.current = next;
      setShown(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <>{shown.toLocaleString(locale)}{suffix}</>;
}
