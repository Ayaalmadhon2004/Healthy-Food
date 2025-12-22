"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserData } from "@/hooks/useUserData";
import { useCartStore } from "@/store/cartStore";
import { Menu, ShoppingCart, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false); // Mobile menu toggle

  const { user, setUserData } = useUserData();

  // Zustand Cart
  const cartItems = useCartStore((state) => state.cartItems);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const totalCalories = cartItems.reduce(
    (sum, item) => sum + item.calories * item.quantity,
    0
  );

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    useUserData.getState().clearUser();
    window.location.href = "/login";
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed in fetch user!");
        const data = await res.json();
        setUserData(data.user);
      } catch (error) {
        console.error(error);
        setUserData(null);
      }
    }
    fetchUserData();
  }, [setUserData]);

  return (
    <>
      {/* Navbar */}
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
          <div className="hidden md:flex items-center gap-6">
            <Link href="/recipes" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Recipes</Link>
            <Link href="/tracker" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Meal Tracker</Link>
            <Link href="/tips" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Tips</Link>
            <Link href="/doctors" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Doctors</Link>
            <Link href="/gaza-kitchen" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Gaza Kitchen</Link>

            <div className="h-6 w-px bg-[var(--color-gray-100)]"></div>

            {!user ? (
              <>
                <Link href="/login" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Sign In</Link>
                <Link href="/signup" className="px-4 py-2 rounded-lg text-[var(--color-white)] bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">Sign Up</Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-[var(--text-main)]">Hello, {user.name}</span>
                <button onClick={logout} className="text-[var(--text-main)] hover:text-[var(--color-primary)] cursor-pointer">
                  Logout
                </button>
              </div>
            )}

            {/* Cart Icon */}
            <button
              onClick={toggleCart}
              className="relative text-[var(--text-main)] hover:text-[var(--color-primary)] ml-4"
            >
               <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden block text-[var(--text-main)] text-3xl" onClick={() => setOpen(!open)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden bg-[var(--color-white)] shadow-lg px-6 pb-4 flex flex-col gap-4">
            <Link href="/recipes" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Recipes</Link>
            <Link href="/tracker" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Meal Tracker</Link>
            <Link href="/tips" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Tips</Link>
            <Link href="/doctors" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Doctors</Link>

            <div className="h-px bg-[var(--color-gray-100)]"></div>

            {!user ? (
              <>
                <Link href="/login" className="text-[var(--text-main)] hover:text-[var(--color-primary)]">Sign In</Link>
                <Link href="/signup" className="text-center text-[var(--color-white)] px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]">Sign Up</Link>
              </>
            ) : (
              <span className="text-[var(--text-main)]">Hello, {user.name}</span>
            )}

            {/* Mobile Cart Button */}
            <button
              onClick={toggleCart}
              className="relative ml-4 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Cart Modal (Zustand controlled) */}
      {isCartOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-end z-50">
          <div className="w-80 bg-white h-full p-6 flex flex-col">
            <div className="flex flex-col md:flex-row md:justify-between items-center gap-4 mt-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Your Cart</h2>
              <button onClick={closeCart} className="self-end text-gray-500 hover:text-gray-800 mb-4"><X className="w-6 h-6" /></button>
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
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">Delete</button>
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
