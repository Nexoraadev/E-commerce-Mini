"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Package, Check } from "lucide-react";
import { useState } from "react";
import { formatRupiah } from "@/lib/utils/format";
import { useCartStore } from "@/store/cart-store";

type Category = { id: string; name: string; slug: string };
export type ProductCardData = {
  id: string;
  kodeProduk: string;
  namaProduk: string;
  slug: string;
  harga: number;
  stok: number;
  image?: string | null;
  deskripsi?: string | null;
  category: Category;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stok === 0;
  const lowStock = product.stok > 0 && product.stok <= 8;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      id: product.id,
      kodeProduk: product.kodeProduk,
      namaProduk: product.namaProduk,
      kategori: product.category.name,
      harga: Number(product.harga),
      stok: product.stok,
      fotoUrl: product.image ?? null,
      deskripsi: product.deskripsi ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:shadow-lg">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.namaProduk}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <Package size={40} className="text-slate-300" />
          </div>
        )}

        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur-sm">
          {product.category.name}
        </span>

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {lowStock && (
          <span className="absolute right-3 top-3 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
            Only {product.stok} left
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`}>
          <h2 className="text-sm font-bold leading-snug text-slate-900 hover:text-[#1e3a8a] line-clamp-1">
            {product.namaProduk}
          </h2>
          {product.deskripsi && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {product.deskripsi}
            </p>
          )}
        </Link>

        {/* Price + stock row */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-base font-extrabold text-slate-900">
            {formatRupiah(Number(product.harga))}
          </p>
          {!outOfStock && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {product.stok} in stock
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-150 ${
            added
              ? "bg-emerald-600 text-white"
              : outOfStock
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-[#1e3a8a] text-white hover:bg-[#1e40af] active:scale-95"
          }`}
        >
          {added ? (
            <><Check size={15} /> Added!</>
          ) : outOfStock ? (
            <>Unavailable</>
          ) : (
            <><ShoppingCart size={15} /> Add to Cart</>
          )}
        </button>
      </div>
    </article>
  );
}
