"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, Truck, ShieldCheck, HeadphonesIcon } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/product/product-card";

type Category = { id: string; name: string; slug: string };

const SORT_OPTIONS = [
  { value: "newest", label: "Featured" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "stock", label: "In Stock First" },
];

const FEATURES = [
  { icon: Truck, title: "Fast Domestic Shipping", desc: "Free deliveries on orders over Rp 500.000" },
  { icon: ShieldCheck, title: "Authenticity Guaranteed", desc: "Carefully inspected merchandise with 30-day warranty" },
  { icon: HeadphonesIcon, title: "Direct Support", desc: "Friendly service team available 7 days a week" },
];

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
        <div className="skeleton mt-2 h-5 w-24 rounded" />
        <div className="skeleton mt-2 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function Catalog() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get("search") ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const LIMIT = 12;

  // Close sort menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(query); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // Load categories once
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
  }, []);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        page: String(page),
        ...(debouncedQuery && { search: debouncedQuery }),
        ...(categorySlug && { category: categorySlug }),
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      let prods: ProductCardData[] = data.products ?? [];

      // Client-side sort
      if (sort === "price_asc") prods = [...prods].sort((a, b) => Number(a.harga) - Number(b.harga));
      else if (sort === "price_desc") prods = [...prods].sort((a, b) => Number(b.harga) - Number(a.harga));
      else if (sort === "stock") prods = [...prods].sort((a, b) => b.stok - a.stok);

      setProducts(prods);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, categorySlug, page, sort]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const totalPages = Math.ceil(total / LIMIT);
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Featured";

  return (
    <div className="min-h-dvh bg-white">
      {/* Hero */}
      <div className="border-b border-slate-100 bg-[#f8f9fc] px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Collection</p>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
            Find something you'll love.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Browse our curated collection of quality everyday goods at honest prices.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        {/* Filter bar */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Left: search + categories */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search input */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm w-full md:w-48">
              <Search size={14} className="shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">✕</button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setCategorySlug(""); setPage(1); }}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  categorySlug === ""
                    ? "bg-[#1e3a8a] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setCategorySlug(cat.slug); setPage(1); }}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    categorySlug === cat.slug
                      ? "bg-[#1e3a8a] text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: count + sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {loading ? "Loading…" : `Showing ${total} products`}
            </span>

            {/* Sort dropdown */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:border-slate-300"
              >
                <SlidersHorizontal size={13} />
                Sort: {currentSortLabel}
                <ChevronDown size={13} className={`transition-transform ${showSortMenu ? "rotate-180" : ""}`} />
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSort(opt.value); setShowSortMenu(false); setPage(1); }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                        sort === opt.value ? "font-bold text-[#1e3a8a]" : "text-slate-700"
                      }`}
                    >
                      {opt.label}
                      {sort === opt.value && <span className="text-[#1e3a8a]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
            <p className="text-4xl">🔍</p>
            <div>
              <p className="font-bold text-slate-700">No products found</p>
              <p className="mt-1 text-sm text-slate-500">Try a different search or category</p>
            </div>
            <button
              onClick={() => { setQuery(""); setCategorySlug(""); }}
              className="rounded-xl border border-[#1e3a8a] px-5 py-2 text-sm font-bold text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm disabled:opacity-40 hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
            >
              ← Previous
            </button>
            <span className="text-sm text-slate-500">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm disabled:opacity-40 hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Feature strip */}
      <div className="border-t border-slate-100 bg-[#f8f9fc]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 md:grid-cols-3 md:px-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <Icon size={20} className="text-[#1e3a8a]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-xs text-slate-400">© 2025 MiniShop, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button className="hover:text-slate-600">Privacy Policy</button>
            <button className="hover:text-slate-600">Terms</button>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const items = [
    { href: "/", icon: "🏠", label: "Home" },
    { href: "/?nav=products", icon: "📦", label: "Products" },
    { href: "/cart", icon: "🛒", label: "Cart" },
    { href: "/orders", icon: "📋", label: "Orders" },
    { href: "/login", icon: "👤", label: "Account" },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white md:hidden">
      {items.map(({ href, icon, label }) => (
        <a
          key={label}
          href={href}
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-slate-500 hover:text-[#1e3a8a]"
        >
          <span className="text-lg leading-none">{icon}</span>
          {label}
        </a>
      ))}
    </nav>
  );
}
