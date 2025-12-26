"use client";

import Link from "next/link";

export default function NavbarLinks({ className }) {
  return (
    <>
      <Link href="/recipes" className={className}>Recipes</Link>
      <Link href="/tracker" className={className}>Meal Tracker</Link>
      <Link href="/tips" className={className}>Tips</Link>
      <Link href="/doctors" className={className}>Doctors</Link>
      <Link href="/gaza-kitchen" className={className}>Gaza Kitchen</Link>
    </>
  );
}
