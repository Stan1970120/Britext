"use client";

import React from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export type CartItem = {
  _id: string;
  book: {
    _id: string;
    title: string;
    category: string;
    price: number;
  };
};

interface MyCartProps {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  onNext: () => void;
}

const MyCart: React.FC<MyCartProps> = ({
  cartItems,
  setCartItems,
  onNext,
}) => {
  const { token } = useAuth();

  // 🗑 Remove from cart
  const removeFromCart = async (cartItemId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${cartItemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // update UI instantly
      setCartItems((prev) =>
        prev.filter((item) => item._id !== cartItemId)
      );
    } catch (err) {
      console.error("Failed to remove item");
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.book.price,
    0
  );

  return (
    <div className="bg-white py-8 px-4 md:px-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">My Cart</h1>
        <p className="text-sm text-gray-600">
          {cartItems.length} items
        </p>
      </div>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-500 py-20">
          Your cart is empty
        </p>
      ) : (
        <>
          <div className="space-y-5 mb-10">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border rounded-2xl p-5"
              >
                <div>
                  <h2 className="text-lg font-semibold">
                    {item.book.title}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {item.book.category}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-[#035b77]">
                      <Bookmark size={14} />
                      Save for later
                    </button>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="flex items-center gap-1 text-red-500"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>

                <p className="text-lg font-semibold">
                  ₦{item.book.price.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between mb-4">
              <p className="text-lg font-medium">Total</p>
              <p className="text-xl font-semibold">
                ₦{totalAmount.toLocaleString()}
              </p>
            </div>

            <button
              onClick={onNext}
              disabled={cartItems.length === 0}
              className="w-full bg-[#035b77] text-white py-3 rounded-full disabled:opacity-50"
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
