// components/Cart.jsx
import React from "react";
import { useCartStore } from "../store/cartStore";

export default function Cart() {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // حساب السعرات الإجمالية
  const totalCalories = cartItems.reduce(
    (sum, item) => sum + item.calories * item.quantity,
    0
  );

  return (
    <div className="p-4 bg-gray-50 min-h-screen flex flex-col">
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul className="flex-1">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center mb-4 p-2 border rounded"
              >
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p>Calories per unit: {item.calories}</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, parseInt(e.target.value))
                    }
                    className="w-12 p-1 border rounded"
                  />

                  <p>Total: {item.calories * item.quantity} cal</p>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* مجموع السعرات الإجمالية */}
          <div className="mt-4 p-2 border-t font-bold text-lg">
            Total Calories: {totalCalories} cal
          </div>
        </>
      )}
    </div>
  );
}
