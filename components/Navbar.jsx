"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Heart, LogOut, User } from "lucide-react"; // استيراد أيقونات أنسب
import { supabase } from "@/lib/supabase/client";
import { useFavStore } from "@/store/useFavStore"; // المتجر الجديد
import { useUserData } from "@/hooks/useUserData";
import NavbarLinks from "./NavbarLinks";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUserData();
  const router = useRouter();
  
  const favItems = useFavStore((state) => state.favItems);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <Link href="/" className="flex items-center gap-2 transition-transform active:scale-95">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold shadow-lg shadow-green-100">
              NF
            </div>
            <span className="text-xl font-heading text-gray-900 font-black tracking-tight">NutriFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavbarLinks className="text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors" />

            <div className="h-5 w-px bg-gray-200 mx-2"></div>

            {!user ? (
              <div className="flex items-center gap-5">
                <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-green-600 transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="px-5 py-2.5 rounded-xl text-sm text-white bg-green-600 hover:bg-green-700 font-bold shadow-md shadow-green-100 transition-all active:scale-95">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </div>
                  <span className="text-sm font-bold hidden lg:inline max-w-[120px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                </div>
                <button 
                  onClick={logout} 
                  className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors text-sm font-bold"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}

            {/* Favorites Icon Button */}
            <Link 
              href="/favorites" 
              className="relative text-gray-700 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-full"
              aria-label={`View ${favItems.length} favorites`}
            >
              <Heart className={`w-6 h-6 ${favItems.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {favItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border-2 border-white animate-in zoom-in">
                  {favItems.length}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors" 
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
            <NavbarLinks className="text-lg font-bold text-gray-800" />
            
            <div className="flex flex-col gap-4">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="text-center py-3 text-gray-700 font-bold border border-gray-100 rounded-xl">Sign In</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="text-center py-4 rounded-xl text-white bg-green-600 font-black shadow-lg shadow-green-100">Sign Up</Link>
                </>
              ) : (
                <div className="flex flex-col gap-4">
                   <Link href="/favorites" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold">
                    <Heart size={20} fill="currentColor" /> Favorites ({favItems.length})
                  </Link>
                  <button onClick={logout} className="py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50">Logout</button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-[72px]"></div>
    </>
  );
}