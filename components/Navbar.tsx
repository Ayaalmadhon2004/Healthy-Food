"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Heart, LogOut, X } from "lucide-react"; 
import { supabase } from "@/lib/supabase/client";
import { useFavStore } from "@/store/useFavStore";
import { useUserData } from "@/hooks/useUserData";
import NavbarLinks from "./NavbarLinks";
import Logo from "./Logo";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();
  
  const { user, hint, loading, clearUser } = useUserData();
  // Never block the navbar on the session check: show the cached identity
  // (or the signed-out buttons) right away and correct it when the check lands.
  const shown = user ?? (loading ? hint : null);
  
  const router = useRouter();
  const favItems = useFavStore((state) => state.favItems);
  const resolvedRole = shown?.role || "USER";

  const logout = async () => {
    await supabase.auth.signOut();
    clearUser();
    setOpen(false);
    router.push("/login");
  };

  const t = lang === "ar"
    ? { signIn: "تسجيل الدخول", signUp: "إنشاء حساب", logout: "تسجيل الخروج" }
    : { signIn: "Sign in", signUp: "Create account", logout: "Log out" };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-paper border-b border-line z-50">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

          <Logo />

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavbarLinks
              userRole={resolvedRole}
              className="text-[0.9375rem] text-ink-soft hover:text-ink"
            />

            <Link href="/favorites" aria-label="Favorites" className="relative text-ink-soft hover:text-clay-700 p-2 -m-2">
              <Heart className={`w-5 h-5 ${favItems.length > 0 ? "fill-clay-600 text-clay-600" : ""}`} strokeWidth={1.75} />
              {favItems.length > 0 && (
                <span className="absolute -top-1.5 -end-2 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-clay-700 text-white flex items-center justify-center text-[0.6875rem] font-semibold leading-none">
                  {favItems.length}
                </span>
              )}
            </Link>

            {shown ? (
              <div className="flex items-center gap-4 ps-6 border-s border-line">
                <span className="text-[0.9375rem] font-medium text-ink">
                  {shown.name || shown.email?.split('@')[0]}
                </span>
                <button aria-label="Log out" onClick={logout} className="text-ink-mute hover:text-clay-700 transition-colors">
                  <LogOut size={18} strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ps-6 border-s border-line">
                <Link href="/login" className="text-[0.9375rem] font-medium text-ink hover:text-olive-700">{t.signIn}</Link>
                <Link href="/signup" className="btn btn-primary !py-1.5">{t.signUp}</Link>
              </div>
            )}
          </div>

          {/* Mobile button */}
          <button aria-label="Toggle navigation menu" aria-expanded={open} className="md:hidden p-2 -me-2 text-ink" onClick={() => setOpen(!open)}>
            {open ? <X size={26} strokeWidth={1.75} /> : <Menu size={26} strokeWidth={1.75} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden absolute top-full left-0 w-full bg-paper border-b border-line px-5 pt-2 pb-5 flex flex-col [&>a]:py-3 [&>a]:border-b [&>a]:border-line">
            <NavbarLinks
              userRole={resolvedRole}
              onClick={() => setOpen(false)}
              className="text-base text-ink"
              mobile
            />
            <Link href="/favorites" onClick={() => setOpen(false)} className="text-base text-ink">
              {lang === "ar" ? "المفضلة" : "Favorites"}{favItems.length > 0 ? ` (${favItems.length})` : ""}
            </Link>
            <div className="pt-4 flex items-center gap-3">
              {shown ? (
                <button onClick={logout} className="btn btn-quiet">
                  <LogOut size={18} strokeWidth={1.75} /> {t.logout}
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="btn btn-quiet">{t.signIn}</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="btn btn-primary">{t.signUp}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-16"></div>
    </>
  );
}
