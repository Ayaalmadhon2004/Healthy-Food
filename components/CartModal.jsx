"use client";

import { X, Trash2, ShoppingBasket } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/context/LanguageContext";

export default function CartModal() {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";

  const cartItems = useCartStore((state) => state.cartItems);
  const closeCart = useCartStore((state) => state.closeCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // نصوص الواجهة
  const t = {
    title: { en: "Your Cart", ar: "سلة المشتريات" },
    empty: { en: "Your cart is empty", ar: "السلة فارغة حالياً" },
    delete: { en: "Remove", ar: "حذف" },
    calories: { en: "cal", ar: "سعرة" },
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm flex justify-end z-[100]">
      {/* Drawer Container */}
      <div 
        className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <ShoppingBasket className="text-green-600" />
            {t.title[lang]}
          </h2>
          <button 
            onClick={closeCart} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBasket size={64} strokeWidth={1} />
              <p className="font-medium">{t.empty[lang]}</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.id} 
                className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4 group"
              >
                <div className="flex-1">
                  {/* اسم الوجبة - معالجة الكائن أو النص */}
                  <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                    {typeof item.name === 'object' ? item.name[lang] : item.name}
                  </p>
                  
                  {/* السعرات - معالجة الكائن أو النص */}
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    {typeof item.calories === 'object' ? item.calories[lang] : item.calories}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
                      className="w-12 p-1 text-center bg-transparent font-bold text-sm focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 underline underline-offset-4"
                  >
                    <Trash2 size={14} />
                    {t.delete[lang]}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <button 
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95"
              onClick={closeCart}
            >
              {lang === "ar" ? "إغلاق ومتابعة" : "Close & Continue"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}