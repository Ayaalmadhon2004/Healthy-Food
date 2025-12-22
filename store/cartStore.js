import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      cartItems: [],
      isCartOpen: false,

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cartItems.find(
            (i) => i.id === item.id
          );

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }

          return {
            cartItems: [...state.cartItems, { ...item, quantity: 1 }],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        })),

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () =>
        set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: "cart-storage", // 👈 localStorage key
    }
  )
);
