"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Heart, LogOut, X } from "lucide-react"; 
import { supabase } from "@/lib/supabase/client";
import { useFavStore } from "@/store/useFavStore";
import { useUserData } from "@/hooks/useUserData";
import NavbarLinks from "./NavbarLinks";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  // نستخدم user و loading من الـ store الذي يستخدم persist
  const { user, loading, clearUser } = useUserData(); 
  const router = useRouter();
  
  const favItems = useFavStore((state) => state.favItems);

  const logout = async () => {
    await supabase.auth.signOut();
    clearUser(); // تنظيف الـ Store والـ LocalStorage
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
            <NavbarLinks 
              userRole={user?.role} 
              loading={loading} 
              className="text-sm font-semibold text-gray-600" 
            />

            <Link href="/favorites" className="relative text-gray-700 hover:text-red-500 p-2">
              <Heart className={`w-6 h-6 ${favItems.length > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {favItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black border-2 border-white">
                  {favItems.length}
                </span>
              )}
            </Link>

            {/* عرض اسم المستخدم فقط إذا انتهى التحميل أو إذا كانت البيانات موجودة مسبقاً */}
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700">
                  {user.name || user.email?.split('@')[0]}
                </span>
                <button onClick={logout} className="text-gray-400 hover:text-red-600 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : !loading && (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold">Sign In</Link>
                <Link href="/signup" className="px-5 py-2 rounded-xl text-white bg-green-600 font-bold text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Button */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen(!open)}>
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6">
            <NavbarLinks 
              userRole={user?.role} 
              loading={loading}
              onClick={() => setOpen(false)} 
              className="text-lg font-bold text-gray-800" 
            />
            {user && (
               <button onClick={logout} className="flex items-center gap-2 text-red-600 font-bold">
                  <LogOut size={20} /> Logout
               </button>
            )}
          </div>
        )}
      </nav>
      <div className="h-[72px]"></div>
    </>
  );
}