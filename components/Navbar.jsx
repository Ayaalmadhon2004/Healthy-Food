"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Heart, LogOut, X } from "lucide-react"; // أضفنا X للإغلاق
import { supabase } from "@/lib/supabase/client";
import { useFavStore } from "@/store/useFavStore";
import { useUserData } from "@/hooks/useUserData";
import NavbarLinks from "./NavbarLinks";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUserData();
  const router = useRouter();
  
  const favItems = useFavStore((state) => state.favItems);
  const clearAllFavorites = useFavStore((state) => state.clearAllFavorites);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    clearAllFavorites(); 
    // ملاحظة: تأكدي أن اسم التخزين هنا يطابق ما وضعتِه في الـ Store
    localStorage.removeItem("nutriflow-favs"); 
    setOpen(false);
    router.push("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold">NF</div>
            <span className="text-xl font-black text-gray-900">NutriFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavbarLinks className="text-sm font-semibold text-gray-600" />

            <Link href="/favorites" className="relative text-gray-700 hover:text-red-500 p-2">
              <Heart className={`w-6 h-6 ${favItems.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {favItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border-2 border-white animate-in zoom-in">
                  {favItems.length}
                </span>
              )}
            </Link>

            {!user ? (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold">Sign In</Link>
                <Link href="/signup" className="px-5 py-2 rounded-xl text-white bg-green-600 font-bold text-sm">Sign Up</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700">{user.email?.split('@')[0]}</span>
                <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-600"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {open && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            <NavbarLinks onClick={() => setOpen(false)} className="text-lg font-bold text-gray-800" />
            
            <Link 
              href="/favorites" 
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 text-lg font-bold text-gray-800"
            >
              <Heart size={20} className={favItems.length > 0 ? "fill-red-500 text-red-500" : ""} />
              Favorites ({favItems.length})
            </Link>

            <hr className="border-gray-100" />

            {!user ? (
              <div className="flex flex-col gap-4">
                <Link href="/login" onClick={() => setOpen(false)} className="text-center py-3 font-bold border border-gray-200 rounded-xl">Sign In</Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="text-center py-3 font-bold bg-green-600 text-white rounded-xl">Sign Up</Link>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                <span className="font-bold text-gray-700">{user.email}</span>
                <button onClick={logout} className="flex items-center gap-2 text-red-600 font-bold">
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
      {/* Spacer to prevent content from going under the fixed nav */}
      <div className="h-[72px]"></div>
    </>
  );
}