"use client";

import React from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { CartItem } from "../page"; 
import { API } from "../../../constant/api"; 

interface AuthContextType {
  token: string | null;
  user: {
    id: string;
  } | null;
  loading: boolean;
}

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
  // Removed 'user' to fix the TS/ESLint unused variable error
  const { token } = useAuth() as AuthContextType;

  const removeFromCart = async (bookId: string) => {
    if (!token) return;

    try {
      await fetch(`${API.CART}/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setCartItems((prev) =>
        prev.filter((item) => item.bookId !== bookId)
      );
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.book?.price || 0) * item.quantity,
    0
  );

  return (
    <div className="bg-white py-8 px-4 md:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">My Cart</h1>
        <p className="text-sm text-gray-600">
          {cartItems.length} items
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 border rounded-2xl border-dashed">
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="space-y-5 mb-10">
            {cartItems.map((item) => (
              <div
                key={item.bookId}
                className="flex justify-between items-center border rounded-2xl p-5"
              >
                <div className="flex gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {item.book?.title || "Loading..."}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {item.book?.category} {item.quantity > 1 && `(Qty: ${item.quantity})`}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <button className="flex items-center gap-1 text-gray-600 hover:text-[#035b77]">
                        <Bookmark size={14} />
                        Save
                      </button>

                      <button
                        onClick={() => removeFromCart(item.bookId)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-lg font-semibold">
                  ₦{((item.book?.price || 0) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between mb-4">
              <p className="text-lg font-medium">Total</p>
              <p className="text-xl font-semibold text-[#035b77]">
                ₦{totalAmount.toLocaleString()}
              </p>
            </div>

            <button
              onClick={onNext}
              disabled={cartItems.length === 0}
              className="w-full bg-[#035b77] text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Proceed to Payment →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MyCart;
/*
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
*/
