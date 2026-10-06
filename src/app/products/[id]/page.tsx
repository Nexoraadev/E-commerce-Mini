"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart, Package, Check, Minus, Plus, Star,
  ChevronRight, Loader2, Heart, Truck, Clock, ShieldCheck,
  Zap, Home,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import { useCartStore } from "@/store/cart-store";

type Product = {
  id: string;
  kodeProduk: string;
  namaProduk: string;
  slug: string;
  harga: number;
  stok: number;
  image?: string | null;
  deskripsi?: string | null;
  category: { id: string; name: string; slug: string };
};

const SPECS_MAP: Record<string, { icon: string; label: string; value: string }[]> = {};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= Math.round(rating) ? "text-amber-400" : "text-slate-200"}
          fill={i <= Math.round(rating) ? "#fbbf24" : "#e2e8f0"}
        />
      ))}
      <span className="text-sm font-bold text-slate-700">{rating}</span>
      <span className="text-sm text-slate-400">({count} reviews)</span>
      <span className="ml-1 text-xs font-semibold text-emerald-600">✓ Verified Purchase</span>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-h-dvh bg-white pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="skeleton mb-6 h-4 w-64 rounded" />
        <div className="grid gap-10 md:grid-cols-2">
          <div className="skeleton aspect-square w-full rounded-2xl" />
          <div className="space-y-4">
            {[40, 70, 100, 60, 80].map((w, i) => (
              <div key={i} className="skeleton h-6 rounded" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then(async (d) => {
        const p = d.product ?? null;
        setProduct(p);
        if (p) {
          // load related products same category
          const res = await fetch(`/api/products?category=${p.category.slug}&limit=4`);
          const data = await res.json();
          setRelated((data.products ?? []).filter((r: Product) => r.id !== p.id).slice(0, 4));
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
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
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-slate-50">
        <Package size={56} className="text-slate-300" />
        <p className="text-lg font-bold text-slate-600">Product not found</p>
        <Link href="/" className="rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af]">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const outOfStock = product.stok === 0;
  const lowStock = product.stok > 0 && product.stok <= 8;
  // Simulate original price (15% higher)
  const originalPrice = Math.round(Number(product.harga) * 1.15);
  const discount = 15;

  const DELIVERY_FEATURES = [
    { icon: Truck, title: "Free domestic shipping", desc: "Eligible for all orders over Rp 500.000 throughout Indonesia." },
    { icon: Clock, title: "Estimated delivery", desc: "2–4 business days to Jakarta/Bekasi, 3–5 days regional" },
    { icon: ShieldCheck, title: "Authenticity Guaranteed", desc: "100% genuine product with 30-day no-hassle return policy." },
  ];

  return (
    <div className="min-h-dvh bg-white pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 hover:text-[#1e3a8a]">
            <Home size={11} /> Home
          </Link>
          <ChevronRight size={11} />
          <Link href="/" className="hover:text-[#1e3a8a]">Products</Link>
          <ChevronRight size={11} />
          <Link href={`/?category=${product.category.slug}`} className="hover:text-[#1e3a8a]">
            {product.category.name}
          </Link>
          <ChevronRight size={11} />
          <span className="line-clamp-1 font-medium text-slate-700">{product.namaProduk}</span>
        </nav>

        {/* Main grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {/* ── LEFT: Images ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl bg-slate-100">
              {/* Badges */}
              <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                {!outOfStock && (
                  <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    FREE EXPRESS DELIVERY
                  </span>
                )}
              </div>
              {/* Wishlist */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
              >
                <Heart
                  size={18}
                  className={wishlisted ? "text-red-500" : "text-slate-400"}
                  fill={wishlisted ? "#ef4444" : "none"}
                />
              </button>

              <div className="relative aspect-square w-full">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.namaProduk}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package size={80} className="text-slate-300" />
                  </div>
                )}
                {outOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <span className="rounded-full bg-red-500 px-5 py-2 text-sm font-bold text-white">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail strip — placeholder repeats for demo */}
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <button
                  key={i}
                  className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 bg-slate-100 transition ${
                    i === 0 ? "border-[#1e3a8a]" : "border-transparent hover:border-slate-300"
                  }`}
                >
                  {product.image && i === 0 ? (
                    <Image src={product.image} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package size={18} className="text-slate-300" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="space-y-5">
            {/* Category + stock */}
            <div className="flex items-center justify-between">
              <Link
                href={`/?category=${product.category.slug}`}
                className="rounded-md bg-[#e8edf7] px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-[#1e3a8a] hover:bg-[#d0d9f0]"
              >
                {product.category.name}
              </Link>
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${outOfStock ? "text-red-500" : "text-emerald-600"}`}>
                <span className={`h-2 w-2 rounded-full ${outOfStock ? "bg-red-500" : "bg-emerald-500"}`} />
                {outOfStock ? "Out of stock" : lowStock ? `Only ${product.stok} left` : `${product.stok} in stock`}
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl font-extrabold leading-snug text-slate-900 md:text-3xl">
                {product.namaProduk}
              </h1>
              <div className="mt-2">
                <StarRating rating={4.8} count={128} />
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatRupiah(Number(product.harga))}
              </span>
              <span className="text-base text-slate-400 line-through">{formatRupiah(originalPrice)}</span>
              <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                Save {discount}%
              </span>
            </div>

            {/* Description */}
            {product.deskripsi && (
              <p className="text-sm leading-relaxed text-slate-600">{product.deskripsi}</p>
            )}

            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              {[
                { icon: "🔋", label: "Battery", value: "Up to 30 hours" },
                { icon: "📶", label: "Connectivity", value: "Bluetooth 5.3" },
                { icon: "⚖️", label: "Weight", value: "250g Ultralight" },
                { icon: "🛡️", label: "Warranty", value: "1 Year Official" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5 rounded-xl bg-white p-3 shadow-sm">
                  <span className="text-lg leading-none">{icon}</span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="text-xs font-bold text-slate-700">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Quantity</p>
                <p className="text-xs text-slate-400">Max {product.stok} units per order</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={outOfStock || qty <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-l-xl hover:bg-slate-50 disabled:opacity-40"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm font-bold">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stok, q + 1))}
                    disabled={outOfStock || qty >= product.stok}
                    className="flex h-10 w-10 items-center justify-center rounded-r-xl hover:bg-slate-50 disabled:opacity-40"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={() => setWishlisted(!wishlisted)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50"
                >
                  <Heart
                    size={18}
                    className={wishlisted ? "text-red-500" : "text-slate-400"}
                    fill={wishlisted ? "#ef4444" : "none"}
                  />
                </button>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-all ${
                  added
                    ? "bg-emerald-600 text-white"
                    : outOfStock
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-[#1e3a8a] text-white hover:bg-[#1e40af] active:scale-95"
                }`}
              >
                {added ? (
                  <><Check size={17} /> Added to Cart!</>
                ) : outOfStock ? (
                  "Out of Stock"
                ) : (
                  <><ShoppingCart size={17} /> Add to Cart</>
                )}
              </button>

              <Link
                href="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1e3a8a] py-3.5 text-sm font-bold text-[#1e3a8a] transition hover:bg-[#1e3a8a] hover:text-white"
              >
                <Zap size={16} /> Buy Now with 1-Click
              </Link>
            </div>

            {/* Delivery info */}
            <div className="space-y-3 rounded-2xl border border-slate-100 p-4">
              {DELIVERY_FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <Icon size={14} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-slate-200">
            {(["description", "specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-bold capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-[#1e3a8a] text-[#1e3a8a]"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "reviews" ? "Customer Reviews (128)" : tab}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "description" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">About this product</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {product.deskripsi ?? "No description available for this product."}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      { icon: "🎵", title: "Signature Tuning", desc: "Engineered with studio-grade clarity and low-distortion acoustic chambers." },
                      { icon: "🛋️", title: "Memory Foam Cushions", desc: "Breathable protein leather ear cushions adapt to unique ear contours." },
                    ].map((f) => (
                      <div key={f.title} className="rounded-xl bg-slate-50 p-4">
                        <p className="text-lg">{f.icon}</p>
                        <p className="mt-1 text-xs font-bold text-slate-800">{f.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {product.image && (
                  <div className="relative hidden aspect-square overflow-hidden rounded-2xl bg-slate-100 md:block">
                    <Image src={product.image} alt={product.namaProduk} fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-lg">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Product Code", product.kodeProduk],
                      ["Category", product.category.name],
                      ["Stock", `${product.stok} units`],
                      ["Price", formatRupiah(Number(product.harga))],
                    ].map(([key, val]) => (
                      <tr key={key}>
                        <td className="py-3 pr-6 font-semibold text-slate-500">{key}</td>
                        <td className="py-3 text-slate-800">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {[
                  { name: "Sarah K.", rating: 5, comment: "Amazing product, exactly as described. Fast delivery too!" },
                  { name: "Budi P.", rating: 4, comment: "Good quality for the price. Would recommend to friends." },
                ].map((r) => (
                  <div key={r.name} className="rounded-2xl border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-bold text-white">
                        {r.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{r.name}</p>
                        <StarRating rating={r.rating} count={0} />
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">You may also like</p>
                <h2 className="text-xl font-extrabold text-slate-900">Complete your setup</h2>
              </div>
              <Link href="/" className="flex items-center gap-1 text-sm font-bold text-[#1e3a8a] hover:underline">
                View catalog <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {related.map((rel) => (
                <Link key={rel.id} href={`/products/${rel.slug}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                    {rel.image ? (
                      <Image src={rel.image} alt={rel.namaProduk} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package size={28} className="text-slate-300" />
                      </div>
                    )}
                    <span className="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                      {rel.stok > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="mt-2 px-1">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{rel.category.name}</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-[#1e3a8a]">
                      {rel.namaProduk}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">{formatRupiah(Number(rel.harga))}</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            id: rel.id,
                            kodeProduk: rel.kodeProduk,
                            namaProduk: rel.namaProduk,
                            kategori: rel.category.name,
                            harga: Number(rel.harga),
                            stok: rel.stok,
                            fotoUrl: rel.image ?? null,
                            deskripsi: rel.deskripsi ?? null,
                          });
                        }}
                        disabled={rel.stok === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a8a] text-white hover:bg-[#1e40af] disabled:bg-slate-200"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

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
