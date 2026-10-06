"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Check, Loader2, Package, ChevronRight,
  Printer, Mail, XCircle, RefreshCw, Copy, MapPin,
  Phone, User, CreditCard, Clock, FileText, Plus,
  ExternalLink, Truck, ShieldCheck, ChevronDown,
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
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: string;
  notes?: string | null;
  orderItems: OrderItem[];
  user: { id: string; namaLengkap: string; email: string; userName: string; createdAt: string };
};

const WORKFLOW_STEPS = [
  { key: "placed", label: "Order Placed", desc: "Online Webstore" },
  { key: "payment", label: "Payment Confirmed", desc: "Bank Mandiri VA" },
  { key: "processing", label: "Processing", desc: "Packing & Inspection" },
  { key: "completed", label: "Completed", desc: "Awaiting courier pickup" },
];

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];

function getWorkflowStep(status: string): number {
  const map: Record<string, number> = { PENDING: 0, PROCESSING: 2, COMPLETED: 3, CANCELLED: -1 };
  return map[status] ?? 0;
}

function WorkflowStep({
  step, index, currentStep, order,
}: { step: typeof WORKFLOW_STEPS[0]; index: number; currentStep: number; order: Order }) {
  const done = currentStep > index;
  const active = currentStep === index;
  const cancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="flex flex-1 flex-col items-center gap-2 text-center">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
        done ? "border-[#1e3a8a] bg-[#1e3a8a] text-white" :
        active ? "border-[#1e3a8a] bg-blue-50 text-[#1e3a8a]" :
        cancelled && index > 0 ? "border-red-200 bg-red-50 text-red-400" :
        "border-slate-200 bg-white text-slate-300"
      }`}>
        {done ? <Check size={15} /> : <span className="text-xs font-bold">{index + 1}</span>}
      </div>
      <div>
        <p className={`text-[11px] font-bold ${done || active ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>
        <p className="text-[10px] text-slate-400">{step.desc}</p>
        {(done || active) && (
          <p className="text-[9px] text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

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

  const updateStatus = async (orderStatus: string) => {
    if (!order) return;
    setUpdating(true);
    setShowStatusMenu(false);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      if (res.ok) setOrder((prev) => prev ? { ...prev, orderStatus } : prev);
    } finally { setUpdating(false); }
  };

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
  );

  if (notFound || !order) return (
    <div className="flex flex-col items-center gap-4 py-20">
      <Package size={48} className="text-slate-300" />
      <p className="font-bold text-slate-600">Order not found</p>
      <Link href="/admin/orders" className="rounded-xl bg-[#1e3a8a] px-5 py-2 text-sm font-bold text-white">
        Back to Orders
      </Link>
    </div>
  );

  const currentStep = getWorkflowStep(order.orderStatus);
  const subtotal = order.orderItems.reduce((s, i) => s + Number(i.subtotal), 0);
  const shippingFree = subtotal >= 500000;
  const trackingCode = `SC-${order.id.replace(/-/g, "").slice(0, 11).toUpperCase()}`;

  const AUDIT_EVENTS = [
    {
      icon: "📦", time: formatDate(order.updatedAt),
      text: `Order status changed to ${orderStatusLabel(order.orderStatus)}`,
      who: "System",
    },
    {
      icon: "💳", time: formatDate(order.createdAt),
      text: `Payment verified: ${order.paymentMethod} — ${formatRupiah(Number(order.totalAmount))}`,
      who: "System",
    },
    {
      icon: "🛒", time: formatDate(order.createdAt),
      text: `Order created by customer via Web Storefront`,
      who: order.user.namaLengkap,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Back + breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/admin/orders" className="flex items-center gap-1 hover:text-[#1e3a8a]">
            <ArrowLeft size={13} /> Back to Orders
          </Link>
          <ChevronRight size={11} />
          <span className="text-slate-500">Orders</span>
          <ChevronRight size={11} />
          <span className="font-bold text-slate-700">#{order.orderNumber}</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Sync: Real-time Database
        </span>
      </div>

      {/* Order header */}
      <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">Order #{order.orderNumber}</h1>
              <button onClick={copyOrderNumber} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${orderStatusColor(order.orderStatus)}`}>
                ● {orderStatusLabel(order.orderStatus)}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${paymentStatusColor(order.paymentStatus)}`}>
                ✓ {paymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Placed {formatDate(order.createdAt)} · {order.orderItems.length} items · Channel: Web Storefront
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Printer size={13} /> Print Slip
            </button>
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={updating}
                className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af] disabled:opacity-60"
              >
                {updating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                Update Status
                <ChevronDown size={13} className={`transition-transform ${showStatusMenu ? "rotate-180" : ""}`} />
              </button>
              {showStatusMenu && (
                <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s} onClick={() => updateStatus(s)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold transition hover:bg-slate-50 ${
                        order.orderStatus === s ? "text-[#1e3a8a] font-bold" : "text-slate-700"
                      }`}>
                      {orderStatusLabel(s)}
                      {order.orderStatus === s && <Check size={12} className="text-[#1e3a8a]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Fulfillment Workflow */}
          <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-800">Fulfillment Workflow</h2>
              <span className="text-[10px] text-slate-400">
                Estimated Delivery: Oct 2 – Oct 3, 2026
              </span>
            </div>

            {/* Steps */}
            <div className="relative flex items-start gap-0">
              {WORKFLOW_STEPS.map((step, i) => (
                <div key={step.key} className="flex flex-1 items-start">
                  <WorkflowStep step={step} index={i} currentStep={currentStep} order={order} />
                  {i < WORKFLOW_STEPS.length - 1 && (
                    <div className={`mt-4 h-0.5 flex-1 transition-colors ${currentStep > i ? "bg-[#1e3a8a]" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-800">Order Items ({order.orderItems.length})</h2>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1e3a8a]">
                  {order.orderItems.reduce((s, i) => s + i.quantity, 0)} unique SKUs
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Fulfilled from Warehouse Alpha</span>
            </div>

            {/* Items table header */}
            <div className="hidden grid-cols-[3fr_1fr_1fr_1fr] gap-4 border-b border-slate-50 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 md:grid">
              <span>Product Description</span>
              <span className="text-center">QTY</span>
              <span className="text-right">Price</span>
              <span className="text-right">Total</span>
            </div>

            <div className="divide-y divide-slate-50 px-5">
              {order.orderItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[3fr_1fr_1fr_1fr] items-center gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {item.product.image ? (
                        <Image src={item.product.image} alt={item.product.namaProduk} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package size={16} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.product.namaProduk}</p>
                      <p className="text-[10px] text-slate-400">
                        SKU: {item.product.kodeProduk} · {item.product.category?.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-center text-sm font-semibold text-slate-700">{item.quantity}</p>
                  <p className="text-right text-sm text-slate-600">{formatRupiah(Number(item.price))}</p>
                  <p className="text-right text-sm font-bold text-slate-800">{formatRupiah(Number(item.subtotal))}</p>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="border-t border-slate-100 px-5 py-4">
              <div className="ml-auto max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Items Subtotal ({order.orderItems.length} items)</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Admin & Handling Service</span>
                  <span className="font-semibold text-emerald-600">
                    {shippingFree ? "FREE (Gratis Ongkir)" : formatRupiah(25000)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Included Tax (PPN 11%)</span>
                  <span>Rp 0</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-extrabold text-slate-900">
                  <span>Total Order Value</span>
                  <span className="text-[#1e3a8a]">{formatRupiah(Number(order.totalAmount))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Delivery */}
          <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                <Truck size={14} className="text-[#1e3a8a]" /> Shipping & Delivery Destination
              </h2>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#1e3a8a]">
                SiCepat REG
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Consignee Details</p>
                <p className="text-sm font-bold text-slate-800">{order.recipientName}</p>
                {order.recipientPhone && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone size={11} /> {order.recipientPhone}
                  </p>
                )}
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{order.shippingAddress}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Courier & Tracking</p>
                <p className="text-xs font-semibold text-slate-600">Waybill / Resi</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-bold text-slate-700">
                    {trackingCode}
                  </span>
                  <button
                    onClick={() => { navigator.clipboard.writeText(trackingCode); }}
                    className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50">
                    <Copy size={12} />
                  </button>
                </div>
                {order.notes && (
                  <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2">
                    <p className="text-[10px] font-bold text-amber-700">Delivery Note</p>
                    <p className="text-xs text-amber-600">"{order.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                <Clock size={14} className="text-[#1e3a8a]" /> Audit Trail & Activity Log
              </h2>
              <span className="text-[10px] text-slate-400">{AUDIT_EVENTS.length} events recorded</span>
            </div>
            <div className="space-y-4">
              {AUDIT_EVENTS.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-base">
                    {event.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">{event.text}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{event.who}</span>
                      <span>·</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                <FileText size={14} className="text-[#1e3a8a]" /> Internal Staff Notes
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                Private to staff
              </span>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add an internal note about this order (packing instructions, customer requests, etc.)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <button
              disabled={!note.trim()}
              className="mt-2 flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af] disabled:opacity-40"
            >
              <Plus size={13} /> Add Internal Note
            </button>
          </div>

          {/* Order Cancellation */}
          {order.orderStatus !== "CANCELLED" && order.orderStatus !== "COMPLETED" && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-700">Order Cancellation</p>
                  <p className="mt-0.5 text-xs text-red-600">
                    Cancelling this order will release reserved stock back into inventory.
                  </p>
                </div>
                <button
                  onClick={() => updateStatus("CANCELLED")}
                  className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT sidebar */}
        <div className="space-y-4">
          {/* Customer Profile */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-800">Customer Profile</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <ShieldCheck size={10} /> Verified
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-extrabold text-white">
                  {order.user.namaLengkap.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{order.user.namaLengkap}</p>
                  <p className="text-xs text-slate-500">{order.user.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Member Since</span>
                  <span className="font-semibold">
                    {new Date(order.user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Username</span>
                  <span className="font-mono font-semibold">@{order.user.userName}</span>
                </div>
              </div>
              <Link
                href={`/admin`}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-[#1e3a8a] hover:bg-slate-50"
              >
                View Customer Profile <ExternalLink size={11} />
              </Link>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-800">Payment Information</h2>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${paymentStatusColor(order.paymentStatus)}`}>
                {paymentStatusLabel(order.paymentStatus)}
              </span>
            </div>
            <div className="space-y-2.5 px-5 py-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Method</span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <CreditCard size={11} /> {order.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">VA Transaction Ref</span>
                <span className="font-mono text-[10px] font-bold text-slate-700">
                  VA-MC-{order.id.slice(0, 8).toUpperCase()}-886
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Timestamp</span>
                <span className="font-semibold text-slate-700">{formatDate(order.updatedAt)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="font-bold text-slate-700">Total Paid</span>
                <span className="text-sm font-extrabold text-[#1e3a8a]">{formatRupiah(Number(order.totalAmount))}</span>
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <button className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <FileText size={12} /> View Payment Receipt
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-800">Quick Actions</h2>
            </div>
            <div className="space-y-2 p-4">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex w-full items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1e40af]">
                <RefreshCw size={13} /> Update Order Status
              </button>
              <button className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Printer size={13} /> Print Invoice & Slip
              </button>
              <button className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                <Mail size={13} /> Resend Email Confirmation
              </button>
              {order.orderStatus !== "CANCELLED" && order.orderStatus !== "COMPLETED" && (
                <button
                  onClick={() => updateStatus("CANCELLED")}
                  className="flex w-full items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50">
                  <XCircle size={13} /> Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
