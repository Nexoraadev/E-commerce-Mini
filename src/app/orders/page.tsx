"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag, Loader2, Package, Search, ChevronRight,
  Home, ArrowRight, RefreshCw, Eye, Truck, HelpCircle,
} from "lucide-react";
import { formatRupiah, formatDate, orderStatusLabel, orderStatusColor, paymentStatusColor, paymentStatusLabel } from "@/lib/utils/format";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: { namaProduk: string; image?: string | null; slug?: string };
};

type Order = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  recipientName: string;
  shippingAddress: string;
  orderItems: OrderItem[];
};

const STATUS_TABS = [
  { key: "ALL", label: "All Orders" },
  { key: "PENDING", label: "Processing" },
  { key: "PROCESSING", label: "Shipped" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

function StatusBadge({ status }: { status: string }) {
  const color = orderStatusColor(status);
  const label = orderStatusLabel(status);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function PayBadge({ status, method }: { status: string; method: string }) {
  if (status === "PAID") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
      ✓ Paid
    </span>
  );
  if (status === "FAILED") return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500">✗ Failed</span>
  );
  return <span className="text-xs text-slate-400">{method} · Pending</span>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/orders/my")
      .then(async (r) => {
        if (r.status === 401) { setNotLoggedIn(true); return; }
        const d = await r.json();
        setOrders(d.orders ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => { c[o.orderStatus] = (c[o.orderStatus] ?? 0) + 1; });
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchTab = activeTab === "ALL" || o.orderStatus === activeTab;
      const matchSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.orderItems.some((i) => i.product.namaProduk.toLowerCase().includes(search.toLowerCase()));
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, search]);

  if (notLoggedIn) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f8f9fc] px-4">
        <ShoppingBag size={56} className="text-slate-300" />
        <p className="text-lg font-bold text-slate-700">Please sign in to view your orders</p>
        <Link href="/login?next=/orders" className="rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af]">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-24 md:pb-0">
      <div className="mx-auto max-w-5xl px-4 py-5 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 hover:text-[#1e3a8a]"><Home size={11} /> Home</Link>
          <ChevronRight size={11} />
          <span className="text-slate-500">Account</span>
          <ChevronRight size={11} />
          <span className="font-medium text-slate-700">Orders</span>
        </nav>

        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Account Portal</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 md:text-3xl">My Orders</h1>
            <p className="mt-1 text-sm text-slate-500">Track shipment milestones, retrieve tax invoices, and manage repeat purchases.</p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[#1e3a8a] hover:underline">
            ← Continue Shopping
          </Link>
        </div>

        {/* Tabs + Search */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Status tabs */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => {
              const count = counts[tab.key] ?? 0;
              if (tab.key !== "ALL" && count === 0) return null;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    activeTab === tab.key
                      ? "bg-[#1e3a8a] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[#1e3a8a]"
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search size={14} className="shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number or product..."
              className="w-48 bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Order list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-white py-20 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Package size={36} className="text-slate-300" />
            </div>
            <div>
              <p className="font-extrabold text-slate-700">No orders found</p>
              <p className="mt-1 text-sm text-slate-500">
                {search ? "Try a different search term." : "You haven't placed any orders yet."}
              </p>
            </div>
            <Link href="/" className="rounded-xl bg-[#1e3a8a] px-8 py-3 text-sm font-bold text-white hover:bg-[#1e40af]">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const thumbnails = order.orderItems.slice(0, 3);
              const extraCount = order.orderItems.length - 3;

              return (
                <div key={order.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs text-slate-400">Order</span>
                      <span className="text-base font-extrabold text-[#1e3a8a]">#{order.orderNumber}</span>
                      <span className="hidden items-center gap-1 text-xs text-slate-400 sm:flex">
                        📅 {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.orderStatus} />
                      <PayBadge status={order.paymentStatus} method={order.paymentMethod} />
                    </div>
                  </div>

                  {/* Status message */}
                  {order.orderStatus === "PROCESSING" && (
                    <div className="flex items-center gap-2 bg-blue-50 px-5 py-2 text-xs text-blue-700">
                      📦 Your items are being carefully picked and packed.
                    </div>
                  )}
                  {order.orderStatus === "COMPLETED" && (
                    <div className="flex items-center gap-2 bg-emerald-50 px-5 py-2 text-xs text-emerald-700">
                      ✓ Delivered · Received by {order.recipientName}
                    </div>
                  )}
                  {order.orderStatus === "CANCELLED" && (
                    <div className="flex items-center gap-2 bg-red-50 px-5 py-2 text-xs text-red-600">
                      ✕ Order was cancelled. Refund will be processed within 3–5 business days.
                    </div>
                  )}

                  {/* Product thumbnails */}
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnails */}
                      <div className="flex gap-2">
                        {thumbnails.map((item) => (
                          <div key={item.id} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {item.product.image ? (
                              <Image src={item.product.image} alt={item.product.namaProduk} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package size={18} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                        ))}
                        {extraCount > 0 && (
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                            +{extraCount}
                          </div>
                        )}
                      </div>

                      {/* Item names */}
                      <div className="flex-1 min-w-0">
                        <div className="space-y-1">
                          {order.orderItems.slice(0, 2).map((item) => (
                            <p key={item.id} className="line-clamp-1 text-sm font-semibold text-slate-800">
                              {item.product.namaProduk}
                              <span className="ml-2 text-xs text-slate-400">Qty {item.quantity} · {formatRupiah(Number(item.price))}</span>
                            </p>
                          ))}
                          {order.orderItems.length > 2 && (
                            <p className="text-xs text-slate-400">+{order.orderItems.length - 2} more items</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer row */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Total ({order.orderItems.length} items)</p>
                          <p className="text-lg font-extrabold text-slate-900">{formatRupiah(Number(order.totalAmount))}</p>
                        </div>
                        <div className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
                          <span>{order.paymentMethod}</span>
                          <span>·</span>
                          <span className={paymentStatusColor(order.paymentStatus).includes("emerald") ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                            {paymentStatusLabel(order.paymentStatus)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {order.orderStatus === "COMPLETED" && (
                          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                            <RefreshCw size={13} /> Buy Again
                          </button>
                        )}
                        {(order.orderStatus === "PENDING" || order.orderStatus === "PROCESSING") && (
                          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                            <Truck size={13} /> Track Order
                          </button>
                        )}
                        <Link href={`/orders/${order.id}`} className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
                          <Eye size={13} /> View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Showing count */}
            <p className="text-center text-xs text-slate-400">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </div>
        )}

        {/* Help banner */}
        {!loading && orders.length > 0 && (
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                <HelpCircle size={20} className="text-[#1e3a8a]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Need help with a recent shipment?</p>
                <p className="text-xs text-slate-500">Our support desk is ready 24/7. Have your order reference number handy.</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 text-sm font-bold text-[#1e3a8a] hover:underline">
              Read Delivery FAQs <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
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
