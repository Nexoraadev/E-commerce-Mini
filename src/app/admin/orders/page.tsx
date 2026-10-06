"use client";

import { useEffect, useState } from "react";
import {
  ShoppingBag, Loader2, ChevronDown, ChevronLeft, ChevronRight,
  Search, X, CheckSquare, Square, Package, Download,
  Clock, CheckCircle, XCircle, AlertCircle, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  formatRupiah, formatDate, orderStatusLabel, orderStatusColor,
  paymentStatusLabel, paymentStatusColor,
} from "@/lib/utils/format";

type OrderItem = {
  id: string; quantity: number; price: number; subtotal: number;
  product: { namaProduk: string; image?: string | null };
};
type Order = {
  id: string; orderNumber: string; orderStatus: string;
  paymentStatus: string; paymentMethod: string; totalAmount: number;
  createdAt: string; recipientName: string; shippingAddress: string;
  user: { namaLengkap: string; email: string };
  orderItems: OrderItem[];
};

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
const LIMIT = 8;

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function AvatarInitials({ name }: { name: string }) {
  const colors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color} text-[11px] font-extrabold text-white`}>
      {getInitials(name)}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPayment, setFilterPayment] = useState("ALL");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, orderStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      if (res.ok) setOrders((prev) => prev.map((o) => o.id === id ? { ...o, orderStatus } : o));
    } finally { setUpdatingId(null); }
  };

  const filtered = orders.filter((o) => {
    const matchStatus = filterStatus === "ALL" || o.orderStatus === filterStatus;
    const matchPay = filterPayment === "ALL" || o.paymentStatus === filterPayment;
    const matchQ = !query ||
      o.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
      o.user.namaLengkap.toLowerCase().includes(query.toLowerCase()) ||
      o.user.email.toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchPay && matchQ;
  });

  const totalPages = Math.ceil(filtered.length / LIMIT);
  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);

  const counts: Record<string, number> = { ALL: orders.length };
  orders.forEach((o) => { counts[o.orderStatus] = (counts[o.orderStatus] ?? 0) + 1; });

  const revenue = orders.filter((o) => o.orderStatus === "COMPLETED")
    .reduce((s, o) => s + Number(o.totalAmount), 0);

  const pendingCount = counts["PENDING"] ?? 0;
  const processingCount = counts["PROCESSING"] ?? 0;
  const completedCount = counts["COMPLETED"] ?? 0;
  const completedPct = orders.length > 0 ? Math.round((completedCount / orders.length) * 100) : 0;

  const allChecked = paginated.length > 0 && paginated.every((o) => checkedIds.has(o.id));
  const toggleAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set([...checkedIds, ...paginated.map((o) => o.id)]));
  };
  const toggleOne = (id: string) => {
    const s = new Set(checkedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setCheckedIds(s);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dashboard / Orders · Fulfillment Central</p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">Manage customer orders, payments, logistics, and transactional fulfillment.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Download size={13} /> Export Orders
          </button>
        </div>
      </div>

      {/* 4 Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Orders", value: orders.length,
            sub: "+12.5% vs previous 30 days",
            icon: ShoppingBag, color: "text-[#1e3a8a]", bg: "bg-blue-50",
            badge: null,
          },
          {
            label: "Pending Orders", value: pendingCount,
            sub: "Awaiting checkout payment completion",
            icon: Clock, color: "text-amber-600", bg: "bg-amber-50",
            badge: pendingCount > 0 ? "Action needed" : null,
          },
          {
            label: "Processing", value: processingCount,
            sub: "Currently being picked and dispatched",
            icon: Package, color: "text-blue-600", bg: "bg-blue-50",
            badge: processingCount > 0 ? "In warehouse" : null,
          },
          {
            label: "Completed", value: completedCount,
            sub: "Delivered and reconciled successfully",
            icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50",
            badge: `${completedPct}% total`,
          },
        ].map(({ label, value, sub, icon: Icon, color, bg, badge }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2 ${bg}`}><Icon size={15} className={color} /></div>
              {badge && (
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  badge.includes("needed") ? "bg-amber-100 text-amber-700" :
                  badge.includes("warehouse") ? "bg-blue-100 text-blue-700" :
                  badge.includes("%") ? "bg-emerald-100 text-emerald-700" :
                  "bg-slate-100 text-slate-600"
                }`}>{badge}</span>
              )}
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="text-[10px] text-slate-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { key: "ALL", label: "All Orders", count: orders.length },
          { key: "PENDING", label: "Pending", count: pendingCount },
          { key: "PROCESSING", label: "Processing", count: processingCount },
          { key: "COMPLETED", label: "Completed", count: completedCount },
          { key: "CANCELLED", label: "Cancelled", count: counts["CANCELLED"] ?? 0 },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => { setFilterStatus(key); setPage(1); }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
              filterStatus === key
                ? "bg-[#1e3a8a] text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-[#1e3a8a]"
            }`}>
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
              filterStatus === key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
            }`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm min-w-48">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search by order number, customer..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" />
          {query && <button onClick={() => setQuery("")} className="text-slate-400"><X size={13} /></button>}
        </div>
        <select value={filterPayment} onChange={(e) => setFilterPayment(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option value="ALL">Payment: All</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option>Method: All</option>
          <option>Virtual Account</option>
          <option>Bank Transfer</option>
          <option>Cash</option>
        </select>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>Last 90 Days</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {checkedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-[#1e3a8a] px-4 py-3 text-white">
          <CheckSquare size={16} />
          <span className="text-sm font-bold">{checkedIds.size} orders selected</span>
          <button className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30">
            Bulk Update Status
          </button>
          <button onClick={() => setCheckedIds(new Set())} className="rounded-lg p-1.5 hover:bg-white/20">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <div className="flex justify-center py-14"><Loader2 size={22} className="animate-spin text-slate-400" /></div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-slate-400">
            <ShoppingBag size={36} /><p className="text-sm font-semibold">No orders found</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden grid-cols-[40px_2fr_2fr_1fr_1fr_1fr_1fr_40px] items-center gap-3 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 md:grid">
              <button onClick={toggleAll} className="flex items-center">
                {allChecked ? <CheckSquare size={14} className="text-[#1e3a8a]" /> : <Square size={14} className="text-slate-300" />}
              </button>
              <span>Order</span><span>Customer</span>
              <span>Items</span><span>Total</span>
              <span>Payment</span><span>Status</span>
              <span />
            </div>

            <div className="divide-y divide-slate-50">
              {paginated.map((order) => (
                <div key={order.id}>
                  <div
                    className={`grid cursor-pointer grid-cols-2 gap-3 px-5 py-4 hover:bg-slate-50 md:grid-cols-[40px_2fr_2fr_1fr_1fr_1fr_1fr_40px] md:items-center ${checkedIds.has(order.id) ? "bg-blue-50/30" : ""}`}
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    {/* Checkbox */}
                    <div className="hidden md:flex" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleOne(order.id)} className="flex items-center">
                        {checkedIds.has(order.id)
                          ? <CheckSquare size={14} className="text-[#1e3a8a]" />
                          : <Square size={14} className="text-slate-300" />}
                      </button>
                    </div>

                    {/* Order */}
                    <div>
                      <p className="text-xs font-extrabold text-[#1e3a8a]">#{order.orderNumber}</p>
                      <p className="text-[10px] text-slate-400">{order.orderItems.length} items total</p>
                    </div>

                    {/* Customer */}
                    <div className="hidden items-center gap-2.5 md:flex">
                      <AvatarInitials name={order.user.namaLengkap} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{order.user.namaLengkap}</p>
                        <p className="truncate text-[10px] text-slate-400">{order.user.email}</p>
                      </div>
                    </div>

                    {/* Items thumbnails */}
                    <div className="hidden items-center gap-1 md:flex">
                      {order.orderItems.slice(0, 3).map((item, i) => (
                        <div key={item.id} className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
                          <Package size={10} className="text-slate-400" />
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <span className="text-[10px] text-slate-400">+{order.orderItems.length - 3}</span>
                      )}
                      <span className="ml-1 text-[10px] text-slate-500">{order.orderItems.reduce((s, i) => s + i.quantity, 0)} pcs</span>
                    </div>

                    {/* Total */}
                    <p className="text-sm font-extrabold text-slate-900">{formatRupiah(Number(order.totalAmount))}</p>

                    {/* Payment */}
                    <div className="hidden md:block">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${paymentStatusColor(order.paymentStatus)}`}>
                        {paymentStatusLabel(order.paymentStatus)}
                      </span>
                      <p className="mt-0.5 text-[10px] text-slate-400">{order.paymentMethod}</p>
                    </div>

                    {/* Status — inline select */}
                    <div className="hidden md:block" onClick={(e) => e.stopPropagation()}>
                      {updatingId === order.id ? (
                        <Loader2 size={14} className="animate-spin text-slate-400" />
                      ) : (
                        <select value={order.orderStatus}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className={`rounded-full border-0 px-2.5 py-0.5 text-[10px] font-bold outline-none cursor-pointer ${orderStatusColor(order.orderStatus)}`}>
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{orderStatusLabel(s)}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Expand */}
                    <div className="flex justify-end">
                      <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expandedId === order.id && (
                    <div className="border-t border-slate-50 bg-[#f8f9fc] px-5 py-5 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-white p-4">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Shipping</p>
                          <p className="text-sm font-bold text-slate-800">{order.recipientName}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{order.shippingAddress}</p>
                        </div>
                        <div className="rounded-xl bg-white p-4">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Payment</p>
                          <p className="text-sm font-bold text-slate-800">{order.paymentMethod}</p>
                          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${paymentStatusColor(order.paymentStatus)}`}>
                            {paymentStatusLabel(order.paymentStatus)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="rounded-xl bg-white p-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Items ({order.orderItems.length})</p>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                                  <Package size={11} className="text-slate-400" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700">{item.product.namaProduk}</span>
                                <span className="text-[10px] text-slate-400">×{item.quantity}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-800">{formatRupiah(Number(item.subtotal))}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* View Details link */}
                      <div className="flex justify-end">
                        <Link href={`/admin/orders/${order.id}`}
                          className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
                          <ExternalLink size={12} /> View Full Details
                        </Link>
                      </div>

                      {/* Mobile status update */}
                      <div className="md:hidden">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Update Status</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_OPTIONS.map((s) => (
                            <button key={s} disabled={order.orderStatus === s || updatingId === order.id}
                              onClick={() => updateStatus(order.id, s)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                                order.orderStatus === s ? "ring-2 ring-[#1e3a8a] bg-blue-50 text-[#1e3a8a]" : "border border-slate-200 bg-white text-slate-600"
                              }`}>
                              {orderStatusLabel(s)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
              <p className="text-xs text-slate-500">
                Showing <span className="font-bold">{filtered.length === 0 ? 0 : (page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, filtered.length)}</span> of <span className="font-bold">{filtered.length}</span> orders
              </p>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold ${page === n ? "bg-[#1e3a8a] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {n}
                  </button>
                ))}
                {totalPages > 5 && <span className="text-xs text-slate-400">...</span>}
                <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
