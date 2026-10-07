"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Home, Check, Loader2, Package,
  MapPin, CreditCard, Printer, Phone, HelpCircle, AlertCircle,
  Truck, Copy, ArrowLeft, Clock, CheckCircle2,
  Circle, XCircle,
} from "lucide-react";
import {
  formatRupiah, formatDate, orderStatusLabel, orderStatusColor,
  paymentStatusLabel, paymentStatusColor,
} from "@/lib/utils/format";

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: string;
    namaProduk: string;
    kodeProduk: string;
    image?: string | null;
    slug: string;
    category: { name: string };
  };
};

type Order = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  bank?: string | null;
  virtualAccount?: string | null;
  paidAt?: string | null;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: string;
  notes?: string | null;
  orderItems: OrderItem[];
  user: { namaLengkap: string; email: string };
};

/* ── Tracking steps config ── */
function getTrackingSteps(status: string) {
  const steps = [
    {
      key: "placed",
      label: "Order Placed",
      desc: "Order received and logged in MiniShop commerce engine",
      icon: CheckCircle2,
    },
    {
      key: "payment",
      label: "Payment Confirmed",
      desc: "Payment verified automatically",
      icon: CreditCard,
    },
    {
      key: "processing",
      label: "Processing & Packaging",
      desc: "Order verified by warehouse team, items being prepared",
      icon: Package,
    },
    {
      key: "shipped",
      label: "Shipped & In Transit",
      desc: "Package handed to courier for delivery",
      icon: Truck,
    },
    {
      key: "delivered",
      label: "Delivered",
      desc: "Package handed to recipient at destination",
      icon: Home,
    },
  ];

  const statusOrder: Record<string, number> = {
    PENDING: 1,
    PROCESSING: 2,
    COMPLETED: 4,
    CANCELLED: -1,
  };

  const currentStep = statusOrder[status] ?? 0;

  return steps.map((step, i) => ({
    ...step,
    state:
      status === "CANCELLED" && i > 0
        ? "cancelled"
        : i < currentStep
        ? "done"
        : i === currentStep
        ? "active"
        : "pending",
  }));
}

function TrackingTimeline({ order }: { order: Order }) {
  const steps = getTrackingSteps(order.orderStatus);
  const activeStep = steps.find((s) => s.state === "active");

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
          <Truck size={16} className="text-[#1e3a8a]" />
          Order Tracking
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          Courier:
          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-semibold text-[#1e3a8a]">
            Standard Delivery (J&T Express)
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Active status banner */}
        {activeStep && (
          <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2 font-semibold text-[#1e3a8a]">
              <Package size={16} />
              {activeStep.label === "Order Placed"
                ? "Your order is being prepared"
                : activeStep.label === "Payment Confirmed"
                ? "Payment has been confirmed"
                : activeStep.label === "Processing & Packaging"
                ? "Your order is currently being prepared"
                : activeStep.label === "Shipped & In Transit"
                ? "Your order is on its way!"
                : "Order delivered"}
            </div>
            <p className="mt-1 text-xs text-blue-600">{activeStep.desc}</p>
            {order.orderStatus === "PROCESSING" && (
              <p className="mt-2 flex items-center gap-1 text-[10px] text-blue-500">
                <Clock size={11} />
                Courier tracking code will be activated as soon as physical dispatch scans are confirmed.
              </p>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-0">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            return (
              <div key={step.key} className="flex gap-4">
                {/* Line + icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      step.state === "done"
                        ? "border-[#1e3a8a] bg-[#1e3a8a] text-white"
                        : step.state === "active"
                        ? "border-[#1e3a8a] bg-blue-50 text-[#1e3a8a]"
                        : step.state === "cancelled"
                        ? "border-red-200 bg-red-50 text-red-400"
                        : "border-slate-200 bg-white text-slate-300"
                    }`}
                  >
                    {step.state === "done" ? (
                      <Check size={14} />
                    ) : step.state === "cancelled" ? (
                      <XCircle size={14} />
                    ) : step.state === "active" ? (
                      <step.icon size={14} />
                    ) : (
                      <Circle size={14} />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 my-1 min-h-[24px] ${
                        step.state === "done" ? "bg-[#1e3a8a]" : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className={`flex-1 pb-5 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-bold ${
                            step.state === "done" || step.state === "active"
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.state === "active" && (
                          <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-[#1e3a8a]">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-0.5 text-xs ${
                          step.state === "done" || step.state === "active"
                            ? "text-slate-500"
                            : "text-slate-300"
                        }`}
                      >
                        {step.desc}
                      </p>
                    </div>
                    {(step.state === "done" || step.state === "active") && (
                      <span className="shrink-0 text-xs text-slate-400">
                        {formatDate(order.createdAt)}
                      </span>
                    )}
                    {step.state === "pending" && step.key === "delivered" && (
                      <span className="shrink-0 text-xs text-slate-400">
                        Est. Oct 2 – Oct 4, 2026
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedVA, setCopiedVA] = useState(false);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(async (r) => {
        if (r.status === 404 || r.status === 403) { setNotFound(true); return; }
        const d = await r.json();
        setOrder(d.order ?? null);
        if (!d.order) setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyVA = () => {
    if (!order?.virtualAccount) return;
    navigator.clipboard.writeText(order.virtualAccount);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const simulatePay = async () => {
    if (!order) return;
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Simulasi bayar gagal"); return; }
      setOrder({ ...order, ...data.order, paymentStatus: "PAID" });
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setPaying(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    const ok = window.confirm(
      "Yakin ingin membatalkan order ini? Stok akan dikembalikan dan aksi tidak bisa dibatalkan."
    );
    if (!ok) return;
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal membatalkan order"); return; }
      setOrder({ ...order, ...data.order, orderStatus: "CANCELLED" });
    } catch {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-[#f8f9fc]">
        <div className="flex justify-center py-24">
          <Loader2 size={28} className="animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f8f9fc]">
        <Package size={56} className="text-slate-300" />
        <p className="font-bold text-slate-700">Order not found</p>
        <Link href="/orders" className="rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-bold text-white">
          Back to Orders
        </Link>
      </div>
    );
  }

  const subtotal = order.orderItems.reduce((s, i) => s + Number(i.subtotal), 0);
  const shippingFree = subtotal >= 500000;

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 hover:text-[#1e3a8a]"><Home size={11} /> Home</Link>
          <ChevronRight size={11} />
          <Link href="/orders" className="hover:text-[#1e3a8a]">Orders</Link>
          <ChevronRight size={11} />
          <span className="font-medium text-slate-700">#{order.orderNumber}</span>
          <Link href="/orders" className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#1e3a8a] hover:underline">
            <ArrowLeft size={12} /> Back to Orders
          </Link>
        </nav>

        {/* Order header card */}
        <div className="mb-5 rounded-2xl bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900">Order #{order.orderNumber}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${orderStatusColor(order.orderStatus)}`}>
                  ● {orderStatusLabel(order.orderStatus)}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${paymentStatusColor(order.paymentStatus)}`}>
                  ✓ {paymentStatusLabel(order.paymentStatus)}
                </span>
                <button
                  onClick={copyOrderNumber}
                  className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] text-slate-400 hover:bg-slate-100"
                >
                  <Copy size={11} />
                  {copied ? "Copied!" : "Copy ID"}
                </button>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock size={11} />
                Placed on {formatDate(order.createdAt)} · {order.orderItems.length} items
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {order.orderStatus !== "CANCELLED" && order.orderStatus !== "COMPLETED" && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || paying}
                  className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  {cancelling ? "Membatalkan…" : "Cancel Order"}
                </button>
              )}
              {(order.orderStatus === "PROCESSING" || order.orderStatus === "PENDING") && (
                <button className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af] transition">
                  <Truck size={14} /> Track Order
                </button>
              )}
            </div>
            {error && order.orderStatus !== "CANCELLED" && order.orderStatus !== "COMPLETED" && (
              <div className="mt-2 flex items-start gap-1.5 rounded-xl bg-red-50 p-2.5 text-[11px] text-red-600">
                <AlertCircle size={11} /> {error}
              </div>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-5 md:grid-cols-[1fr_320px] lg:grid-cols-[1fr_340px]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Tracking timeline */}
            <TrackingTimeline order={order} />

            {/* Items */}
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                  <Package size={16} className="text-[#1e3a8a]" />
                  Items in Your Order
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                  {order.orderItems.length} items total
                </span>
              </div>

              <div className="divide-y divide-slate-50 px-5">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4">
                    {/* Image */}
                    <Link href={`/products/${item.product.slug}`} className="shrink-0">
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                        {item.product.image ? (
                          <Image src={item.product.image} alt={item.product.namaProduk} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package size={20} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex flex-1 items-start justify-between gap-2 min-w-0">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          {item.product.category?.name}
                        </p>
                        <Link href={`/products/${item.product.slug}`}>
                          <p className="text-sm font-extrabold text-slate-900 hover:text-[#1e3a8a] line-clamp-1">
                            {item.product.namaProduk}
                          </p>
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Qty: {item.quantity} · {formatRupiah(Number(item.price))} / ea
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-extrabold text-slate-900">{formatRupiah(Number(item.subtotal))}</p>
                        <p className="text-xs text-slate-400">{item.quantity} × {formatRupiah(Number(item.price))}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {/* Order Summary */}
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-extrabold text-slate-800">Order Summary</h2>
                <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <Printer size={15} />
                </button>
              </div>
              <div className="space-y-2.5 px-5 py-4 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Standard Shipping</span>
                  {shippingFree ? (
                    <span className="font-bold text-emerald-600">FREE</span>
                  ) : (
                    <span className="font-semibold text-slate-800">{formatRupiah(25000)}</span>
                  )}
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Estimated Tax (PPN 11%)</span>
                  <span className="font-semibold text-slate-800">Rp 0 (Included)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Discount / Voucher</span>
                  <span className="text-slate-400">—</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
                  <span className="font-extrabold text-slate-900">Total Paid</span>
                  <span className="text-xl font-extrabold text-[#1e3a8a]">{formatRupiah(Number(order.totalAmount))}</span>
                </div>
                <p className="text-[10px] text-slate-400">Prices include applicable value added taxes.</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-extrabold text-slate-800">Payment Details</h2>
                <CreditCard size={15} className="text-slate-400" />
              </div>
              <div className="space-y-3 px-5 py-4 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800 text-right">
                    <span className="h-2 w-2 rounded-full bg-[#1e3a8a]" />
                    {order.paymentMethod}
                  </span>
                </div>

                {/* Bank + VA — jika virtual account */}
                {order.bank && (
                  <div className="flex justify-between items-start">
                    <span className="text-slate-500">Bank Tujuan</span>
                    <span className="font-extrabold text-slate-800">{order.bank}</span>
                  </div>
                )}
                {order.virtualAccount && (
                  <div className="rounded-xl border border-dashed border-[#1e3a8a]/40 bg-blue-50 p-3 space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nomor Virtual Account</p>
                        <p className="font-mono text-xl font-extrabold tracking-wider text-[#1e3a8a]">{order.virtualAccount}</p>
                      </div>
                      <button
                        onClick={copyVA}
                        className="flex shrink-0 items-center gap-1 rounded-lg bg-[#1e3a8a] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#1e40af] transition"
                      >
                        <Copy size={11} /> {copiedVA ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono text-xs font-semibold text-slate-700 text-right">
                    TXN-MC-{order.id.slice(0, 6).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">Payment Status</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${paymentStatusColor(order.paymentStatus)}`}>
                    {paymentStatusLabel(order.paymentStatus)}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500">{order.paidAt ? "Paid At" : "Last Updated"}</span>
                  <span className="text-xs text-slate-700 text-right">
                    {formatDate(order.paidAt ?? order.updatedAt)}
                  </span>
                </div>

                {/* Simulasi Tombol Bayar — jika belum PAID */}
                {order.paymentStatus !== "PAID" && (
                  <>
                    {error && (
                      <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
                        <AlertCircle size={13} /> {error}
                      </div>
                    )}
                    <button
                      onClick={simulatePay}
                      disabled={paying}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-700 transition disabled:opacity-60 active:scale-[0.99]"
                    >
                      {paying ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                      {paying ? "Memproses…" : "💡 Simulasikan Pembayaran Sudah Diterima"}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 -mt-1">
                      Demo app — ini akan menandai pembayaran PAID dan status order otomatis PROCESSING
                    </p>
                  </>
                )}
                {order.paymentStatus === "PAID" && order.virtualAccount && (
                  <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 flex items-start gap-2">
                    <Check size={13} /> VA diverifikasi otomatis. Dana sudah masuk rekening MiniShop.
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 px-5 py-3">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  <Printer size={13} /> Download Tax Invoice (PDF)
                </button>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-extrabold text-slate-800">Shipping Address</h2>
                <MapPin size={15} className="text-slate-400" />
              </div>
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-slate-900">{order.recipientName}</p>
                  <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">Primary</span>
                </div>
                {order.recipientPhone && (
                  <p className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone size={11} /> {order.recipientPhone}
                  </p>
                )}
                <p className="text-xs leading-relaxed text-slate-600">{order.shippingAddress}</p>
                {order.notes && (
                  <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    📝 Delivery Notes: "{order.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Need assistance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                  <HelpCircle size={18} className="text-[#1e3a8a]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Need assistance?</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Questions regarding delivery delays, warranties, or return requests?
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-2.5 text-xs font-bold text-white hover:bg-[#1e40af]">
                  <Phone size={13} /> Contact MiniShop Support
                </button>
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  <Printer size={13} /> Print Order Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white px-4 py-5">
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
          { href: "/cart", icon: "🛒", label: "Cart" },
          { href: "/orders", icon: "📋", label: "Orders" },
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
