import { useCartStore } from "../store/cartStore";
import Cart from "./Cart";

export default function CartModal() {
    const isCartOpen=useCartStore((state)=>state.isCartOpen);
    const closeCart=useCartStore((state)=>state.closeCart);

    if(!isCartOpen) return null;
  return (
    <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50"
    onClick={closeCart} >

    <div
        className="w-80 bg-white h-full p-4 overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // منع إغلاق عند الضغط داخل الكارت
    >
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        <Cart />
    </div>
    
    </div>
  )
}
