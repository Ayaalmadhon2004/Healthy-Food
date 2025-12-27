"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client.ts";
import { useCartStore } from "@/store/cartStore";
import { useUserData } from "@/hooks/useUserData";
import NavbarLinks from "./NavbarLinks";
import CartModal from "@/components/CartModal";
import { useError } from "@/context/ErrorProvider";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, setUser } = useUserData();
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const { setError } = useError();

  useEffect(() => {
    if (!user) {
      setError("You must sign in to access this page!");
    }
  }, [user, setError]);


  const logout = async () => {
    await supabaseClient.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => router.push("/")} 
          >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-orange-600 flex items-center justify-center text-white font-bold">
          NF
          </div>
        <span className="text-xl font-heading text-gray-900 font-bold">NutriFlow</span>
        </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <NavbarLinks className="text-gray-900 hover:text-green-600" />

            <div className="h-6 w-px bg-gray-200"></div>

            {!user ? (
              <>
                <button onClick={() => router.push("/login")} className="text-gray-900 hover:text-green-600">Sign In</button>
                <button onClick={() => router.push("/signup")} className="px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600">Sign Up</button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-gray-900">Hello, {user.email}</span>
                <button onClick={logout} className="text-gray-900 hover:text-green-600 cursor-pointer">Logout</button>
              </div>
            )}

            <button onClick={toggleCart} className="relative text-gray-900 hover:text-green-600 ml-4">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <button className="md:hidden block text-gray-900" onClick={() => setOpen(!open)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-white shadow-lg px-6 pb-4 flex flex-col gap-4">
            <NavbarLinks className="text-gray-900 hover:text-green-600" />
            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-around items-center mt-4 w-full">
              {!user ? (
                <>
                  <button onClick={() => router.push("/login")} className="text-gray-900 hover:text-green-600">Sign In</button>
                  <button onClick={() => router.push("/signup")} className="px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600">Sign Up</button>
                </>
              ) : (
                <span className="text-gray-900">Hello, {user.email}</span>
              )}

              <button onClick={toggleCart} className="relative text-gray-900 hover:text-green-600">
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cartItems.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </nav>

      {isCartOpen && <CartModal />}
    </>
  );
}
