"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger position: each step adds 70ms. */
  step?: number;
  as?: "div" | "li" | "section";
};

// Fades content up once when it scrolls into view. Content is visible in the
// server HTML; only elements below the fold are hidden after mount, so nothing
// is lost without JavaScript. The CSS lives in globals.css ([data-reveal]).
export default function Reveal({ children, className, step = 0, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: CSSProperties | undefined = step ? { transitionDelay: `${step * 70}ms` } : undefined;
  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
}
