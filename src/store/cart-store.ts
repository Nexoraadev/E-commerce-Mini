"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// CartItem shape — menggunakan field dari legacy Product entity
// agar kompatibel dengan product-card dan product detail
export type CartItem = {
  id: string;
  kodeProduk: string;
  namaProduk: string;
  kategori: string;
  harga: number;
  stok: number;
  fotoUrl?: string | null;
  deskripsi?: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + 1, product.stok) }
                  : item
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        }),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity > 0
              ? state.items.map((item) =>
                  item.id === id
                    ? { ...item, quantity: Math.min(quantity, item.stok) }
                    : item
                )
              : state.items.filter((item) => item.id !== id),
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      clear: () => set({ items: [] }),
    }),
    {
      name: "minishop-cart", // key localStorage
    }
  )
);
