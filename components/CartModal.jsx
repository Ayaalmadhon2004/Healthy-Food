"use client";

import { X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartModal() {
    const cartItems = useCartStore((state) => state.cartItems);
    const closeCart = useCartStore((state) => state.closeCart);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    return (
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
    );
}
