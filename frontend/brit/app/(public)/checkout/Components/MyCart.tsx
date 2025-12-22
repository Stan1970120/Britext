"use client";

import React, { useState } from "react";
import { Bookmark, BookmarkCheck, Trash2 } from "lucide-react";

type CartItem = {
  id: string;
  title: string;
  category: string;
  price: number;
  savedForLater: boolean;
};

interface MyCartProps {
  onNext: () => void;
}

const MyCart: React.FC<MyCartProps> = ({ onNext }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: "987425798654", title: "Build Your Family Bank", category: "Fictional Book", price: 700, savedForLater: false },
    { id: "987425798655", title: "Learn React", category: "Programming", price: 500, savedForLater: false },
  ]);

  const handleRemove = (index: number) => setCartItems(cartItems.filter((_, i) => i !== index));
  const handleSaveForLater = (index: number) =>
    setCartItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, savedForLater: !item.savedForLater } : item))
    );

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="bg-white py-8 px-4 md:px-20 transition-all">
      {/* Cart Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">My Cart</h1>
        <p className="text-sm text-gray-600">{cartItems.length} items</p>
      </div>

      {/* Empty cart handling */}
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Your cart is empty. Add some items before checkout.</p>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-5 mb-10">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                  <p className="text-sm text-gray-500">#{item.id}</p>
                  <p className="text-sm text-gray-400">{item.category}</p>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <button
                      onClick={() => handleSaveForLater(index)}
                      className={`flex items-center gap-1 transition ${
                        item.savedForLater ? "text-[#035b77]" : "text-gray-600 hover:text-[#035b77]"
                      }`}
                    >
                      {item.savedForLater ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                      {item.savedForLater ? "Saved" : "Save for later"}
                    </button>

                    <button
                      onClick={() => handleRemove(index)}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>

                <p className="text-lg font-semibold text-gray-900">${item.price}</p>
              </div>
            ))}
          </div>

          {/* Total & Pay Now */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-medium text-gray-700">Total Amount</p>
              <p className="text-xl font-semibold text-gray-900">${totalAmount}</p>
            </div>

            <button
              onClick={onNext}
              disabled={cartItems.length === 0}
              className={`w-full bg-[#035b77] text-white py-3 rounded-full font-semibold hover:bg-[#02485d] transition ${
                cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Pay Now →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyCart;
