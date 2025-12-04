"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-[var(--color-white)] shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-orange-600 flex items-center justify-center text-white font-bold">
        NF
      </div>
      <span className="text-xl font-heading text-[var(--text-main)] font-bold">
        NutriFlow
      </span>
      </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/recipes" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Recipes
          </Link>

          <Link href="/tracker" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Meal Tracker
          </Link>

          <Link href="/tips" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Tips
          </Link>

          <Link href="/doctors" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Doctors
          </Link>

          <div className="h-6 w-px bg-[var(--color-gray-100)]"></div>

          <Link href="/signin" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Sign In
          </Link>

          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg text-[var(--color-white)] bg-[var(--color-primary)] bg-opacity-100 hover:bg-opacity-60 bg-[var(--color-primary)]"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden block text-[var(--text-main)] text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[var(--color-white)] shadow-lg px-6 pb-4 flex flex-col gap-4">
          <Link href="/recipes" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Recipes
          </Link>

          <Link href="/tracker" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Meal Tracker
          </Link>

          <Link href="/tips" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Tips
          </Link>

          <Link href="/doctors" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Doctors
          </Link>

          <div className="h-px bg-[var(--color-gray-100)]"></div>

          <Link href="/signin" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">
            Sign In
          </Link>

          <Link
            href="/signup"
            className="text-center text-[var(--color-white)] px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]"
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
