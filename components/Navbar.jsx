"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useError } from "@/context/ErrorProvider";
import { Menu, ShoppingCart, X } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client.ts";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const [open, setOpen] = useState(false); 
  const [user, setUser] = useState(supabaseClient.auth.getUser()?.data?.user ?? null);
  const { setError } = useError(); 
  const router = useRouter();

  // Zustand Cart
  const cartItems = useCartStore((state) => state.cartItems);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };


  useEffect(() => {
    async function fetchUser() {
      try {
        const { data: { user: supaUser }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!supaUser) throw new Error("you are not loggined in");
        setUser(supaUser);
      } catch (err) {
        setUser(null);
        if (setError) setError(err.message || "An Unexpected error occurred");
      }
    }
    fetchUser();
  }, [setError]);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-orange-600 flex items-center justify-center text-white font-bold">
              NF
            </div>
            <span className="text-xl font-heading text-gray-900 font-bold">NutriFlow</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/recipes" className="text-gray-900 hover:text-green-600">Recipes</Link>
            <Link href="/tracker" className="text-gray-900 hover:text-green-600">Meal Tracker</Link>
            <Link href="/tips" className="text-gray-900 hover:text-green-600">Tips</Link>
            <Link href="/doctors" className="text-gray-900 hover:text-green-600">Doctors</Link>
            <Link href="/gaza-kitchen" className="text-gray-900 hover:text-green-600">Gaza Kitchen</Link>

            <div className="h-6 w-px bg-gray-200"></div>

            {!user ? (
              <>
                <Link href="/login" className="text-gray-900 hover:text-green-600">Sign In</Link>
                <Link href="/signup" className="px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600">Sign Up</Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-gray-900">Hello, {user.email}</span>
                <button onClick={logout} className="text-gray-900 hover:text-green-600 cursor-pointer">Logout</button>
              </div>
            )}

            {/* Cart Icon */}
            <button onClick={toggleCart} className="relative text-gray-900 hover:text-green-600 ml-4">
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-white shadow-lg px-6 pb-4 flex flex-col gap-4">
            <Link href="/recipes" className="text-gray-900 hover:text-green-600">Recipes</Link>
            <Link href="/tracker" className="text-gray-900 hover:text-green-600">Meal Tracker</Link>
            <Link href="/tips" className="text-gray-900 hover:text-green-600">Tips</Link>
            <Link href="/doctors" className="text-gray-900 hover:text-green-600">Doctors</Link>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-around items-center mt-4 w-full">
              {!user ? (
                <>
                <Link href="/login" className="text-gray-900 hover:text-green-600">Sign In</Link>
                <Link href="/signup" className="px-4 py-2 rounded-lg text-white bg-green-500 hover:bg-green-600">Sign Up</Link>
                </>
              ) : (
              <span className="text-gray-900">Hello, {user.email}</span>
            )}

            <button 
              onClick={toggleCart} 
              className="relative text-gray-900 hover:text-green-600"
            >
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

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-end z-50">
          <div className="w-80 bg-white h-full p-6 flex flex-col">
            <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mt-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Your Cart</h2>
              <button onClick={closeCart} className="self-end text-gray-500 hover:text-gray-800 mb-4">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {cartItems.length === 0 ? (
                <p>Cart is empty</p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center mb-3 border-b pb-2">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.calories} cal</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                        className="w-12 border rounded p-1 text-center"
                      />
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
