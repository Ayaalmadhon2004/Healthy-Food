import Link from "next/link";

// A bowl with a sprout. Drawn with slightly uneven curves on purpose.
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M6.5 22.5c.4 9.6 7.2 17 17.6 17 10.2 0 17.1-7.4 17.6-17.2-11.7.5-23.6.4-35.2.2Z" fill="#4d5a2c" />
      <path d="M5 22.4c11.8.3 25.6.5 38.1-.1" stroke="#2b261f" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M24.3 21.5c-.4-5.2.3-9.4 2.6-13.4" stroke="#2b261f" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M26.6 9.2c4.6-.9 8.2.4 10.1 3.1-3.9 2.3-7.9 1.9-10.1-3.1Z" fill="#b5613c" />
      <path d="M24.6 15.6c-3.6-2.2-7.3-2.1-10-.2 1.7 3.7 6 4.4 10 .2Z" fill="#8a9654" />
    </svg>
  );
}

export default function Logo({ className = "", linked = true }: { className?: string; linked?: boolean }) {
  const inner = (
    <>
      <LogoMark />
      <span className="font-display text-[1.3125rem] font-semibold tracking-tight text-ink">
        Nutri<span className="text-olive-700">Flow</span>
      </span>
    </>
  );
  if (!linked) return <span className={`inline-flex items-center gap-2 ${className}`}>{inner}</span>;
  return (
    <Link href="/" aria-label="NutriFlow" className={`inline-flex items-center gap-2 ${className}`} dir="ltr">
      {inner}
    </Link>
  );
}
