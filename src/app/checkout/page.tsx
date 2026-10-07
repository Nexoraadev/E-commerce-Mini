"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Home, Check, Loader2, AlertCircle,
  Package, ShieldCheck, RotateCcw, Truck, Zap, CreditCard, Banknote,
  MapPin, Phone, Mail, User, Copy, Clock,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatRupiah } from "@/lib/utils/format";

/* ── Types ── */
type Step = 1 | 2 | 3;
type ShippingMethod = "standard" | "express";
type PaymentMethod = "Virtual Account" | "Bank Transfer" | "Cash";
type VABank = "BCA" | "MANDIRI" | "BNI" | "BRI";

const STEPS = [
  { n: 1, label: "Cart" },
  { n: 2, label: "Checkout" },
  { n: 3, label: "Confirmation" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; badge: string; desc: string; icon: React.ElementType }[] = [
  { value: "Virtual Account", label: "Virtual Account (Transfer Otomatis)", badge: "Instant", desc: "Pilih bank: BCA / Mandiri / BNI / BRI. Nomor VA dibuat otomatis.", icon: Zap },
  { value: "Bank Transfer", label: "Direct Bank Transfer Manual", badge: "", desc: "Transfer manual ke rekening toko. Verifikasi 15 menit kerja.", icon: CreditCard },
  { value: "Cash", label: "Cash on Delivery (COD)", desc: "Bayar di tempat saat kurir sampai.", badge: "", icon: Banknote },
];

const VA_BANK_LIST: { value: VABank; name: string; prefix: string; color: string }[] = [
  { value: "BCA",     name: "BCA",        prefix: "8808", color: "bg-blue-600" },
  { value: "MANDIRI", name: "Bank Mandiri", prefix: "8810", color: "bg-blue-800" },
  { value: "BNI",     name: "BNI 46",     prefix: "8811", color: "bg-orange-500" },
  { value: "BRI",     name: "BRI",        prefix: "8812", color: "bg-indigo-700" },
];

type OrderResult = {
  id: string; orderNumber: string; totalAmount: number;
  paymentMethod: string; bank: string | null; virtualAccount: string | null;
  orderStatus: string; paymentStatus: string;
};

/* ── Progress Bar ── */
function StepProgress({ current }: { current: Step }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              current > s.n ? "bg-emerald-500 text-white" :
              current === s.n ? "bg-[#1e3a8a] text-white" :
              "bg-slate-200 text-slate-500"
            }`}>
              {current > s.n ? <Check size={12} /> : s.n}
            </div>
            <span className={`text-xs font-semibold ${current === s.n ? "text-[#1e3a8a]" : current > s.n ? "text-emerald-600" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px w-8 ${current > s.n ? "bg-emerald-400" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Section Card ── */
function Section({ number, title, badge, children }: { number: number; title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-extrabold text-white">
          {number}
        </div>
        <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
        {badge && (
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{badge}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

/* ── Input Field ── */
function Field({
  label, icon: Icon, placeholder, value, onChange, type = "text", required, hint,
}: {
  label: string; icon?: React.ElementType; placeholder: string;
  value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100 ${Icon ? "pl-9 pr-4" : "px-4"}`}
        />
      </div>
      {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCartStore();

  const subtotal = items.reduce((s, i) => s + i.harga * i.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 25000;

  const [step, setStep] = useState<Step>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Form state
  const [form, setForm] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientPhone: "",
    streetAddress: "",
    city: "",
    province: "",
    postalCode: "",
    shippingAddress: "",
    notes: "",
  });
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Virtual Account");
  const [vaBank, setVaBank] = useState<VABank>("BCA");
  const [copying, setCopying] = useState(false);
  const [paying, setPaying] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setIsLoggedIn(!!d.user));
  }, []);

  if (items.length === 0 && step !== 3) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f8f9fc]">
        <Package size={48} className="text-slate-300" />
        <p className="font-bold text-slate-700">Your cart is empty</p>
        <Link href="/" className="rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-bold text-white">
          Back to Shop
        </Link>
      </div>
    );
  }

  const expressExtra = shippingMethod === "express" ? 25000 : 0;
  const totalAmount = subtotal + (shippingFee === 0 ? 0 : shippingFee) + expressExtra;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) { router.push("/login?next=/checkout"); return; }
    setError(""); setLoading(true);
    try {
      const fullAddress = [form.streetAddress, form.city, form.province, form.postalCode].filter(Boolean).join(", ");
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: form.recipientName,
          recipientEmail: form.recipientEmail,
          recipientPhone: form.recipientPhone,
          shippingAddress: fullAddress || form.shippingAddress || "Indonesia",
          notes: form.notes || null,
          paymentMethod,
          bank: paymentMethod === "Virtual Account" ? vaBank : null,
          cartItems: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Checkout gagal"); return; }
      setOrder(data.order);
      clear();
      setStep(3);
    } catch { setError("Terjadi kesalahan koneksi."); }
    finally { setLoading(false); }
  };

  const copyVA = async () => {
    if (!order?.virtualAccount) return;
    try {
      await navigator.clipboard.writeText(order.virtualAccount);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch { /* ignore */ }
  };

  const simulatePay = async () => {
    if (!order) return;
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}/pay`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Simulasi bayar gagal"); return; }
      setOrder({ ...order, ...data.order, paymentStatus: "PAID", orderStatus: data.order?.orderStatus ?? order.orderStatus });
    } catch { setError("Terjadi kesalahan koneksi."); }
    finally { setPaying(false); }
  };

  /* ── Success Screen ── */
  if (step === 3 && order) {
    const isVA = order.paymentMethod === "Virtual Account";
    const isPaid = order.paymentStatus === "PAID";
    const bankInfo = VA_BANK_LIST.find((b) => b.value === order.bank);

    return (
      <div className="min-h-dvh bg-[#f8f9fc] pb-24 md:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-10 space-y-5">
          {/* ── Order Success Banner ── */}
          <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
            <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${isPaid ? "bg-emerald-100" : "bg-amber-100"}`}>
              {isPaid ? <Check size={40} className="text-emerald-600" /> : <Clock size={40} className="text-amber-600" />}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isPaid ? "Pembayaran Berhasil! 🎉" : "Order Berhasil — Silakan Selesaikan Pembayaran"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isPaid
                ? "Pesanan kamu sudah dibayar dan sedang diproses oleh penjual."
                : isVA
                ? "Transfer sesuai nominal tepat di bawah ini ke nomor Virtual Account untuk verifikasi otomatis."
                : "Simpan bukti transfer untuk proses verifikasi manual."}
            </p>
          </div>

          {/* ── VA Card (hanya jika Virtual Account & belum bayar) ── */}
          {isVA && !isPaid && bankInfo && (
            <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className={`${bankInfo.color} px-6 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-white" />
                  <span className="font-extrabold text-white">{bankInfo.name} Virtual Account</span>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-bold text-white">
                  Prefix {bankInfo.prefix}
                </span>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Nomor Virtual Account</p>
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-[#1e3a8a]/40 bg-blue-50 px-5 py-4">
                    <p className="font-mono text-2xl md:text-3xl font-extrabold tracking-wider text-[#1e3a8a]">
                      {order.virtualAccount}
                    </p>
                    <button
                      onClick={copyVA}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#1e40af] transition"
                    >
                      <Copy size={13} /> {copying ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tagihan</p>
                  <div className="mt-2 rounded-xl bg-emerald-50 px-5 py-4 flex items-center justify-between">
                    <p className="text-sm text-emerald-700 font-semibold">Bayar SESUAI nominal agar terverifikasi otomatis</p>
                    <p className="text-2xl font-extrabold text-emerald-700">
                      {formatRupiah(Number(order.totalAmount))}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertCircle size={14} /> Instruksi Pembayaran
                  </p>
                  <ul className="text-xs text-amber-700 space-y-1 pl-5 list-disc">
                    <li>Buka aplikasi mobile banking / ATM / internet banking {bankInfo.name}</li>
                    <li>Pilih menu Transfer → Virtual Account / ke Rekening {bankInfo.name}</li>
                    <li>Masukkan nomor VA: <span className="font-mono font-bold">{order.virtualAccount}</span></li>
                    <li>Konfirmasi — nominal tagihan akan muncul otomatis</li>
                    <li>Jumlahkan pas: {formatRupiah(Number(order.totalAmount))}, lalu Kirim / Bayar</li>
                  </ul>
                </div>

                {/* Simulasi Tombol Bayar */}
                <button
                  onClick={simulatePay}
                  disabled={paying}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-sm font-extrabold text-white hover:bg-emerald-700 transition disabled:opacity-60 active:scale-[0.99]"
                >
                  {paying ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}
                  {paying ? "Memproses Pembayaran…" : "💡 Simulasikan: Saya Sudah Bayar"}
                </button>
                <p className="text-center text-[10px] text-slate-400">
                  ⚡ Simulasi demo — tekan tombol untuk menandai VA terbayar & pesanan otomatis masuk Processing
                </p>
              </div>
            </div>
          )}

          {/* ── Sudah Bayar VA Summary ── */}
          {isVA && isPaid && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-left">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-600 p-2.5">
                  <Check size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-extrabold text-emerald-800">Pembayaran Virtual Account Diverifikasi</p>
                  <p className="mt-1 text-xs text-emerald-700">
                    {bankInfo?.name} VA · {order.virtualAccount} · Status otomatis PAID
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Bank Transfer Manual / COD summary ── */}
          {!isVA && (
            <div className="rounded-2xl bg-white shadow-sm p-6 text-left space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-[#1e3a8a]" />
                <p className="font-extrabold text-slate-800">Metode Pembayaran: {order.paymentMethod}</p>
              </div>
              {order.paymentMethod === "Bank Transfer" && !isPaid && (
                <div className="rounded-xl bg-blue-50 p-4 text-xs text-blue-700 space-y-1.5">
                  <p className="font-bold">📌 Rekening Tujuan Toko (contoh simulasi):</p>
                  <p>🏦 Bank BCA · 0123456789 · a.n. MiniShop Indonesia</p>
                  <p>💸 Total Transfer: <span className="font-extrabold">{formatRupiah(Number(order.totalAmount))}</span></p>
                  <button
                    onClick={simulatePay}
                    disabled={paying}
                    className="mt-2 w-full rounded-xl bg-blue-700 px-3 py-2.5 text-white font-bold hover:bg-blue-800 disabled:opacity-60"
                  >
                    {paying ? <Loader2 size={13} className="inline animate-spin" /> : "💡 Simulasikan Bukti Transfer Sudah Diverifikasi"}
                  </button>
                </div>
              )}
              {order.paymentMethod === "Cash" && !isPaid && (
                <div className="rounded-xl bg-amber-50 p-4 text-xs text-amber-700 space-y-1.5">
                  <p className="font-bold">💰 COD — Bayar saat barang sampai</p>
                  <p>Siapkan uang tunai pas: <span className="font-extrabold">{formatRupiah(Number(order.totalAmount))}</span> untuk serah terima dengan kurir.</p>
                  <button
                    onClick={simulatePay}
                    disabled={paying}
                    className="mt-2 w-full rounded-xl bg-amber-700 px-3 py-2.5 text-white font-bold hover:bg-amber-800 disabled:opacity-60"
                  >
                    {paying ? <Loader2 size={13} className="inline animate-spin" /> : "💡 Simulasikan: COD Sudah Dibayar"}
                  </button>
                </div>
              )}
              {isPaid && (
                <div className="rounded-xl bg-emerald-50 p-4 text-xs text-emerald-700">
                  <Check size={13} className="inline mr-1" /> Status Pembayaran: SUDAH BAYAR
                </div>
              )}
            </div>
          )}

          {/* ── Order Summary ── */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 text-left space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Ringkasan Pesanan</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Order Number</span>
              <span className="font-extrabold text-[#1e3a8a]">#{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status Order</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                order.orderStatus === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                order.orderStatus === "PROCESSING" ? "bg-blue-100 text-blue-700" :
                order.orderStatus === "CANCELLED" ? "bg-red-100 text-red-600" :
                "bg-amber-100 text-amber-700"
              }`}>
                {order.orderStatus}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status Pembayaran</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {isPaid ? "✓ SUDAH BAYAR" : "⏳ BELUM BAYAR"}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-sm">
              <span className="font-bold text-slate-700">Total Tagihan</span>
              <span className="text-lg font-extrabold text-[#1e3a8a]">{formatRupiah(Number(order.totalAmount))}</span>
            </div>
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle size={15} /> {error}
              </div>
            )}
          </div>

          {/* ── CTA Buttons ── */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/orders/${order.id}`}
              className="flex-1 rounded-xl border-2 border-[#1e3a8a] py-3.5 text-center text-sm font-bold text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition"
            >
              📋 Lihat Detail Order Lengkap
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-xl bg-[#1e3a8a] py-3.5 text-center text-sm font-bold text-white hover:bg-[#1e40af] transition"
            >
              🛍️ Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 hover:text-[#1e3a8a]"><Home size={11} /> Home</Link>
          <ChevronRight size={11} />
          <Link href="/cart" className="hover:text-[#1e3a8a]">Cart</Link>
          <ChevronRight size={11} />
          <span className="font-medium text-slate-700">Checkout</span>
        </nav>

        {/* Title + Steps */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Checkout</h1>
            <p className="mt-0.5 text-sm text-slate-500">Complete your order by providing your delivery and payment details.</p>
          </div>
          <StepProgress current={step} />
        </div>

        {/* Login warning */}
        {isLoggedIn === false && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              <span className="font-bold">Kamu belum login. </span>
              <Link href="/login?next=/checkout" className="underline">Login sekarang</Link> untuk melanjutkan checkout.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_380px]">
            {/* ── LEFT: Forms ── */}
            <div className="space-y-4">
              {/* 1. Contact Information */}
              <Section number={1} title="Contact Information" badge={isLoggedIn ? "Verified" : undefined}>
                <div className="space-y-3">
                  <Field label="Full Name" icon={User} placeholder="Sarah Kurniawan" value={form.recipientName} onChange={(v) => set("recipientName", v)} required />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Email Address" icon={Mail} placeholder="sarah@example.com" type="email" value={form.recipientEmail} onChange={(v) => set("recipientEmail", v)} required hint="Order receipt and invoice will be sent here" />
                    <Field label="Phone Number" icon={Phone} placeholder="+62 812 3456 7890" value={form.recipientPhone} onChange={(v) => set("recipientPhone", v)} required hint="For delivery SMS and WhatsApp notifications" />
                  </div>
                </div>
              </Section>

              {/* 2. Shipping Address */}
              <Section number={2} title="Shipping Address">
                <div className="space-y-3">
                  <Field label="Street Address" icon={MapPin} placeholder="Jl. Sudirman No. 45, Tower B, Apt 12A" value={form.streetAddress} onChange={(v) => set("streetAddress", v)} required />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City / District" placeholder="Jakarta Selatan" value={form.city} onChange={(v) => set("city", v)} required />
                    <Field label="Province" placeholder="DKI Jakarta" value={form.province} onChange={(v) => set("province", v)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Postal Code" placeholder="12190" value={form.postalCode} onChange={(v) => set("postalCode", v)} required />
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-700">Country</label>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                        <span>🇮🇩</span>
                        <span className="text-sm text-slate-700">Indonesia</span>
                        <span className="ml-auto text-xs text-slate-400">Domestic</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Delivery Instructions (Optional)</label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Leave with lobby reception if unavailable"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </Section>

              {/* 3. Shipping Method */}
              <Section number={3} title="Shipping Method">
                <div className="space-y-2">
                  {[
                    {
                      value: "standard" as ShippingMethod,
                      label: "Standard Delivery",
                      badge: "Recommended",
                      desc: "Estimated arrival in 2–4 business days (JNE / SiCepat)",
                      price: subtotal >= 500000 ? "FREE" : formatRupiah(shippingFee),
                      isFree: subtotal >= 500000,
                    },
                    {
                      value: "express" as ShippingMethod,
                      label: "Express Next-Day",
                      badge: "",
                      desc: "Estimated arrival in 1–2 business days",
                      price: formatRupiah(shippingFee + 25000),
                      isFree: false,
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        shippingMethod === opt.value
                          ? "border-[#1e3a8a] bg-blue-50"
                          : "border-transparent bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={opt.value}
                        checked={shippingMethod === opt.value}
                        onChange={() => setShippingMethod(opt.value)}
                        className="accent-[#1e3a8a]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{opt.label}</span>
                          {opt.badge && (
                            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-[#1e3a8a]">{opt.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{opt.desc}</p>
                      </div>
                      <span className={`text-sm font-extrabold ${opt.isFree ? "text-emerald-600" : "text-slate-800"}`}>
                        {opt.price}
                      </span>
                    </label>
                  ))}
                </div>
              </Section>

              {/* 4. Payment Method */}
              <Section number={4} title="Payment Method">
                <div className="space-y-3">
                  {PAYMENT_METHODS.map((pm) => (
                  <div key={pm.value}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                        paymentMethod === pm.value
                          ? "border-[#1e3a8a] bg-blue-50"
                          : "border-transparent bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={pm.value}
                        checked={paymentMethod === pm.value}
                        onChange={() => setPaymentMethod(pm.value)}
                        className="accent-[#1e3a8a]"
                      />
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <pm.icon size={16} className="text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{pm.label}</span>
                          {pm.badge && (
                            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">{pm.badge}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{pm.desc}</p>
                      </div>
                    </label>

                    {/* VA Bank Picker — hanya muncul jika Virtual Account dipilih */}
                    {pm.value === "Virtual Account" && paymentMethod === "Virtual Account" && (
                      <div className="mt-3 pl-14 md:pl-24 space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                        <p className="text-xs font-bold text-slate-700">Pilih Bank Virtual Account Anda:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {VA_BANK_LIST.map((bank) => (
                            <button
                              type="button"
                              key={bank.value}
                              onClick={() => setVaBank(bank.value)}
                              className={`rounded-xl border-2 py-3 text-sm font-extrabold transition-all ${
                                vaBank === bank.value
                                  ? `border-transparent ${bank.color} text-white shadow-md`
                                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              {bank.name}
                            </button>
                          ))}
                        </div>
                        <p className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Check size={10} className="text-emerald-500" /> Nomor Virtual Account dibuat otomatis saat order dibuat.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <ShieldCheck size={11} /> Payments are securely encrypted. Simulated demo environment — no actual card or funds are debited.
                </p>
              </Section>

              {/* Special Instructions */}
              <Section number={5} title="Special Instructions / Gift Message" badge="OPTIONAL">
                <textarea
                  rows={3}
                  placeholder="Any special packaging requests, eco-friendly preference, or gift note for recipient…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </Section>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
                </div>
              )}
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div>
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-extrabold text-slate-900">Order Summary</h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                      {items.length} items
                    </span>
                  </div>

                  {/* Mini item list */}
                  <div className="space-y-3 border-b border-slate-100 pb-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {item.fotoUrl ? (
                            <Image src={item.fotoUrl} alt={item.namaProduk} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package size={16} className="text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="line-clamp-1 text-xs font-semibold text-slate-800">{item.namaProduk}</p>
                          <p className="text-[10px] text-slate-400">Qty {item.quantity} · {formatRupiah(item.harga)} / ea</p>
                        </div>
                        <span className="shrink-0 text-xs font-bold text-slate-800">{formatRupiah(item.harga * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Promo */}
                  <div className="my-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo or Referral Code"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-blue-100"
                    />
                    <button type="button" className="rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
                      Apply
                    </button>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal ({items.length} items)</span>
                      <span>{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping (Standard Courier)</span>
                      <span className={shippingFee === 0 ? "font-bold text-emerald-600" : ""}>{shippingFee === 0 ? "FREE" : formatRupiah(shippingFee)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Estimated Tax (PPN 11%)</span>
                      <span>Rp 0 (Included)</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-baseline justify-between border-t border-slate-200 pt-3 mt-2">
                    <span className="text-sm font-bold text-slate-800">Total Amount</span>
                    <span className="text-2xl font-extrabold text-[#1e3a8a]">{formatRupiah(totalAmount)}</span>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading || isLoggedIn === false}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-4 text-sm font-extrabold text-white transition hover:bg-[#1e40af] disabled:opacity-60 active:scale-95"
                  >
                    {loading ? <Loader2 size={17} className="animate-spin" /> : <>Place Order <ChevronRight size={16} /></>}
                  </button>

                  <p className="mt-2 text-center text-[10px] text-slate-400">
                    By placing your order, you agree to MiniShop's{" "}
                    <span className="text-[#1e3a8a] hover:underline cursor-pointer">Terms of Service</span> and{" "}
                    <span className="text-[#1e3a8a] hover:underline cursor-pointer">Privacy Policy</span>
                  </p>

                  {/* SSL */}
                  <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-slate-400">
                    <ShieldCheck size={11} className="text-emerald-500" /> 256-bit Bank Grade SSL Encryption
                  </div>

                  {/* Payment icons */}
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                    {["BCA", "MANDIRI", "BNI", "QRIS", "VISA", "MC"].map((p) => (
                      <span key={p} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{p}</span>
                    ))}
                  </div>

                  {/* Guarantees */}
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <RotateCcw size={11} className="shrink-0 text-emerald-500" />
                      Free 30-Day Returns · 100% Genuine Guarantee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
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
          { href: "/cart", icon: "🛒", label: "Cart" },
          { href: "/checkout", icon: "💳", label: "Checkout" },
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
