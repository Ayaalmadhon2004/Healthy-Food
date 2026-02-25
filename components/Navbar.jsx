"use client";

import { useState } from "react";
import Link from "next/link"; // --- NEW: استيراد Link بدلاً من الاعتماد الكلي على useRouter ---
import { useRouter } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { useCartStore } from "@/store/cartStore";
import { useUserData } from "@/hooks/useUserData";
import NavbarLinks from "./NavbarLinks";
import CartModal from "@/components/CartModal";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUserData(); // سيقرأ الآن من الكاش فوراً
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isCartOpen = useCartStore((state) => state.isCartOpen);

  const logout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* --- NEW: تحويل اللوجو إلى Link لسرعة الانتقال --- */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-orange-600 flex items-center justify-center text-white font-bold">
              NF
            </div>
            <span className="text-xl font-heading text-gray-900 font-bold">NutriFlow</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <NavbarLinks className="text-gray-900 hover:text-green-600" />

            <div className="h-6 w-px bg-gray-200"></div>

            {!user ? (
              <div className="flex items-center gap-4">
                {/* --- NEW: استخدام Link لزر الدخول والتسجيل لمنع التأخير --- */}
                <Link href="/login" className="text-gray-900 hover:text-green-600 font-medium">
                  Sign In
                </Link>
                <Link href="/signup" className="px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600 font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-gray-900 text-sm hidden lg:inline">Hello, {user.email?.split('@')[0]}</span>
                <button onClick={logout} className="text-gray-900 hover:text-red-600 cursor-pointer text-sm font-bold">
                  Logout
                </button>
              </div>
            )}

            <button onClick={toggleCart} className="relative text-gray-900 hover:text-green-600 ml-4">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden block text-gray-900" onClick={() => setOpen(!open)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Dropdown */}
        {open && (
          <div className="md:hidden bg-white shadow-lg px-6 pb-6 flex flex-col gap-4 border-t border-gray-50">
            <NavbarLinks className="text-gray-900 py-2 border-b border-gray-50" />
            
            <div className="flex flex-col gap-3 mt-2">
              {!user ? (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="text-center py-2 text-gray-900 font-medium">Sign In</Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="text-center py-3 rounded-xl text-white bg-green-500 font-bold">Sign Up</Link>
                </>
              ) : (
                <button onClick={logout} className="py-3 rounded-xl text-red-600 bg-red-50 font-bold">Logout</button>
              )}
            </div>
          </div>
        )}
      </nav>

      {isCartOpen && <CartModal />}
    </>
  );
}