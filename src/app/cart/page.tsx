"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Minus, Plus, Trash2, ShoppingCart, Package, Tag,
  ChevronRight, Home, Truck, ShieldCheck, ArrowLeft,
  RotateCcw, Zap,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatRupiah } from "@/lib/utils/format";

const FREE_SHIPPING_THRESHOLD = 500000;

const PAYMENT_BADGES = ["QRIS", "BCA Virtual", "Mandiri", "VISA", "Mastercard"];

export default function CartPage() {
  const { items, updateQuantity, removeItem, clear } = useCartStore();
  const router = useRouter();

  const subtotal = items.reduce((sum, item) => sum + item.harga * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 45000;
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 hover:text-[#1e3a8a]">
            <Home size={11} /> Home
          </Link>
          <ChevronRight size={11} />
          <span className="font-medium text-slate-700">Cart</span>
        </nav>

        {/* Page title */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 md:text-3xl">Your Cart</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review your items before continuing to checkout.
            </p>
          </div>
          {items.length > 0 && (
            <span className="hidden text-xs text-slate-400 md:block">
              Session ID: MC-{Math.random().toString(36).slice(2, 8).toUpperCase()}-JKT
            </span>
          )}
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-white py-20 text-center shadow-sm">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <ShoppingCart size={40} className="text-slate-300" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-800">Your cart is empty</p>
              <p className="mt-1 text-sm text-slate-500">Add some products to get started.</p>
            </div>
            <Link
              href="/"
              className="rounded-xl bg-[#1e3a8a] px-8 py-3 text-sm font-bold text-white hover:bg-[#1e40af]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px]">
            {/* ── LEFT: Cart Items ── */}
            <div className="space-y-4">
              {/* Header row */}
              <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3.5 shadow-sm">
                <p className="text-sm font-bold text-slate-700">
                  Cart Items ({items.length} items, {totalItems} total units)
                </p>
                <button
                  onClick={clear}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
                >
                  <Trash2 size={13} /> Clear All
                </button>
              </div>

              {/* Free shipping progress */}
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-emerald-700">
                      <Truck size={14} />
                      Add {formatRupiah(remaining)} more for FREE shipping
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-200">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {subtotal >= FREE_SHIPPING_THRESHOLD && (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3">
                  <Truck size={14} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">
                    🎉 Free Express Shipping unlocked!
                  </span>
                </div>
              )}

              {/* Cart item list */}
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="p-4 md:p-5">
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link href={`/products/${item.id}`} className="shrink-0">
                        <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                          {item.fotoUrl ? (
                            <Image
                              src={item.fotoUrl}
                              alt={item.namaProduk}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package size={24} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              {item.kategori}
                            </p>
                            <Link href={`/products/${item.id}`}>
                              <h3 className="text-sm font-extrabold text-slate-900 hover:text-[#1e3a8a] line-clamp-1">
                                {item.namaProduk}
                              </h3>
                            </Link>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {formatRupiah(item.harga)} / unit
                            </p>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              In Stock
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold text-slate-900">
                              {formatRupiah(item.harga * item.quantity)}
                            </p>
                            <p className="text-xs text-slate-400">Subtotal</p>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="mt-2 flex items-center gap-4">
                          {/* Qty */}
                          <div className="flex items-center gap-1 rounded-xl border border-slate-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-l-xl hover:bg-slate-50"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stok}
                              className="flex h-8 w-8 items-center justify-center rounded-r-xl hover:bg-slate-50 disabled:opacity-40"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <button className="hover:text-slate-600">Save for later</button>
                            <span>·</span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue shopping */}
              <div className="flex items-center justify-between px-1">
                <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#1e3a8a] hover:underline">
                  <ArrowLeft size={15} /> Continue Shopping
                </Link>
                <span className="text-xs text-slate-400">Prices include local VAT where applicable.</span>
              </div>

              {/* Frequently Bought Together */}
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-800">Frequently Bought Together</h3>
                  <span className="text-xs text-slate-400">Recommended for your gear</span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { name: "Custom Braided Aviator Cable", price: 189000, icon: "🔌" },
                    { name: "Aluminum Headphone Stand", price: 229000, icon: "🎧" },
                  ].map((rec) => (
                    <div key={rec.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                        {rec.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{rec.name}</p>
                        <p className="text-xs text-slate-500">{formatRupiah(rec.price)}</p>
                      </div>
                      <button className="shrink-0 text-xs font-bold text-[#1e3a8a] hover:underline">
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div className="space-y-4">
              <div className="sticky top-20 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-extrabold text-slate-900">Order Summary</h2>

                {/* Free shipping banner */}
                {subtotal >= FREE_SHIPPING_THRESHOLD && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <Truck size={14} />
                      Free express shipping unlocked!
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-emerald-500" />
                    <p className="mt-1 text-[10px] text-emerald-600">
                      Orders over Rp 500.000 qualify for guaranteed 2-day delivery.
                    </p>
                  </div>
                )}

                {/* Promo code */}
                <div className="mb-4">
                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-slate-400" />
                      Have a promo or gift code?
                    </div>
                    <ChevronRight size={15} className="text-slate-400" />
                  </button>
                </div>

                {/* Summary rows */}
                <div className="space-y-3 border-b border-slate-100 pb-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      Estimated Shipping
                    </span>
                    {shippingFee === 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 line-through">{formatRupiah(45000)}</span>
                        <span className="font-bold text-emerald-600">FREE</span>
                      </div>
                    ) : (
                      <span className="font-semibold">{formatRupiah(shippingFee)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estimated Tax (PPN 11%)</span>
                    <span className="font-semibold text-slate-800">Rp 0 (Included)</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <p className="text-base font-extrabold text-slate-900">Total Amount</p>
                    <p className="text-xs text-slate-400">Includes all Indonesian VAT</p>
                  </div>
                  <p className="text-2xl font-extrabold text-[#1e3a8a]">
                    {formatRupiah(subtotal + shippingFee)}
                  </p>
                </div>

                {/* CTA */}
                <button
                  onClick={() => router.push("/checkout")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-4 text-sm font-extrabold text-white transition hover:bg-[#1e40af] active:scale-95"
                >
                  Proceed to Checkout <ChevronRight size={16} />
                </button>

                <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">🔒 Encrypted 256-bit</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">🛡️ 30-Day Guarantee</span>
                </div>

                {/* Payment methods */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {PAYMENT_BADGES.map((p) => (
                    <span key={p} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {p}
                    </span>
                  ))}
                </div>

                {/* Trust badges */}
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <RotateCcw size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-700">Free 30-Day Returns</span>
                      <p>Eligible items qualify for complimentary return pick-up.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-500" />
                    <div>
                      <span className="font-bold text-slate-700">Authenticity Guaranteed</span>
                      <p>100% genuine verified products with full manufacturer warranty.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-xs text-slate-400">© 2025 MiniShop, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button className="hover:text-slate-600">Privacy Policy</button>
            <button className="hover:text-slate-600">Terms</button>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white md:hidden">
        {[
          { href: "/", icon: "🏠", label: "Home" },
          { href: "/", icon: "📦", label: "Products" },
          { href: "/?search=", icon: "🔍", label: "Search" },
          { href: "/cart", icon: "🛒", label: "Cart" },
          { href: "/orders", icon: "👤", label: "Account" },
        ].map(({ href, icon, label }) => (
          <Link key={label} href={href} className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-slate-500 hover:text-[#1e3a8a]">
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
