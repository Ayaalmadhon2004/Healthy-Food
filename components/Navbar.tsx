"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Heart, LogOut, X } from "lucide-react"; 
import { getSupabase } from "@/lib/supabase/client";
import { useFavStore } from "@/store/useFavStore";
import { useUserData } from "@/hooks/useUserData";
import NavbarLinks from "./NavbarLinks";
import Logo from "./Logo";
import NotificationBell from "./NotificationBell";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { lang } = useLanguage();
  
  const { user, hint, loading, clearUser } = useUserData();
  // Never block the navbar on the session check: show the cached identity
  // (or the signed-out buttons) right away and correct it when the check lands.
  const shown = user ?? (loading ? hint : null);
  
  const router = useRouter();
  const onFavorites = usePathname() === "/favorites";
  const favItems = useFavStore((state) => state.favItems);
  const resolvedRole = shown?.role || "USER";

  // Escape closes the mobile menu and hands focus back to the button that opened it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const logout = async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    clearUser();
    setOpen(false);
    router.push("/login");
  };

  const t = lang === "ar"
    ? { signIn: "تسجيل الدخول", signUp: "إنشاء حساب", logout: "تسجيل الخروج", favorites: "المفضلة", menu: "القائمة الرئيسية", toggle: "فتح أو إغلاق القائمة" }
    : { signIn: "Sign in", signUp: "Create account", logout: "Log out", favorites: "Favorites", menu: "Main navigation", toggle: "Open or close the menu" };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-paper border-b border-line z-50">
      <nav aria-label={t.menu}>
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">

          <Logo />

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavbarLinks
              userRole={resolvedRole}
              className="text-[0.9375rem] text-ink-soft hover:text-ink"
            />

            <Link href="/favorites" aria-current={onFavorites ? "page" : undefined} aria-label={favItems.length > 0 ? `${t.favorites} (${favItems.length})` : t.favorites} className="relative inline-flex items-center justify-center w-11 h-11 -mx-2 text-ink-soft hover:text-clay-700">
              <Heart aria-hidden="true" className={`w-5 h-5 ${favItems.length > 0 ? "fill-clay-600 text-clay-600" : ""}`} strokeWidth={1.75} />
              {favItems.length > 0 && (
                <span aria-hidden="true" className="absolute top-1 end-0 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-clay-700 text-white flex items-center justify-center text-[0.6875rem] font-semibold leading-none">
                  {favItems.length}
                </span>
              )}
            </Link>

            {user?.role === "USER" && <NotificationBell />}

            {shown ? (
              <div className="flex items-center gap-4 ps-6 border-s border-line">
                <span className="text-[0.9375rem] font-medium text-ink">
                  {shown.name || shown.email?.split('@')[0]}
                </span>
                <button aria-label={t.logout} onClick={logout} className="inline-flex items-center justify-center w-11 h-11 -m-2 text-ink-mute hover:text-clay-700 transition-colors">
                  <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 ps-6 border-s border-line">
                <Link href="/login" className="inline-flex items-center min-h-11 text-[0.9375rem] font-medium text-ink hover:text-olive-700">{t.signIn}</Link>
                <Link href="/signup" className="btn btn-primary !py-1.5 min-h-10">{t.signUp}</Link>
              </div>
            )}
          </div>

          {/* Mobile button */}
          <button
            ref={toggleRef}
            type="button"
            aria-label={t.toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 -me-2 text-ink"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={26} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={26} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div id="mobile-menu" className="md:hidden absolute top-full left-0 w-full bg-paper border-b border-line px-5 pt-2 pb-5 flex flex-col [&>a]:py-3 [&>a]:border-b [&>a]:border-line">
            <NavbarLinks
              userRole={resolvedRole}
              onClick={() => setOpen(false)}
              className="text-base text-ink"
              mobile
            />
            <Link href="/favorites" onClick={() => setOpen(false)} aria-current={onFavorites ? "page" : undefined} className="text-base text-ink">
              {t.favorites}{favItems.length > 0 ? ` (${favItems.length})` : ""}
            </Link>
            {user?.role === "USER" && <NotificationBell mobile onClick={() => setOpen(false)} />}
            <div className="pt-4 flex items-center gap-3">
              {shown ? (
                <button onClick={logout} className="btn btn-quiet">
                  <LogOut size={18} strokeWidth={1.75} aria-hidden="true" /> {t.logout}
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
      </header>
      <div className="h-16" aria-hidden="true"></div>
    </>
  );
}
