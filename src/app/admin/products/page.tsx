"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Package, X, Loader2, Search,
  Upload, ImageIcon, CheckSquare, Square, Filter,
  AlertTriangle, CheckCircle, XCircle, Download,
  ChevronLeft, ChevronRight, MoreVertical,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";

type Category = { id: string; name: string };
type Product = {
  id: string;
  kodeProduk: string;
  namaProduk: string;
  slug: string;
  harga: number;
  stok: number;
  deskripsi?: string | null;
  image?: string | null;
  category: Category;
};

const LIMIT = 8;

/* ── Product Form Modal ── */
function ProductModal({
  product, categories, onClose, onSaved,
}: {
  product?: Product; categories: Category[];
  onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    kodeProduk: product?.kodeProduk ?? "",
    namaProduk: product?.namaProduk ?? "",
    categoryId: product?.category.id ?? "",
    harga: product?.harga ?? 0,
    stok: product?.stok ?? 0,
    deskripsi: product?.deskripsi ?? "",
    image: product?.image ?? "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (productId: string): Promise<string | null> => {
    if (!imageFile) return form.image || null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      const res = await fetch(`/api/products/${productId}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload gagal"); return null; }
      return data.imageUrl;
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, harga: Number(form.harga), stok: Number(form.stok), deskripsi: form.deskripsi || null, image: form.image || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal menyimpan"); return; }
      const savedId = product?.id ?? data.product?.id;
      if (savedId && imageFile) await uploadImage(savedId);
      onSaved();
    } catch { setError("Terjadi kesalahan koneksi"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">{product ? "Edit Product" : "Add New Product"}</h2>
            <p className="text-xs text-slate-500">Fill in the product information below</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-slate-100"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-5 md:grid-cols-[1fr_220px]">
            {/* LEFT */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="rounded-xl border border-slate-100 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Product Name *</label>
                    <input required value={form.namaProduk} onChange={(e) => set("namaProduk", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                      placeholder="e.g. Wireless Headphones" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Product Code (SKU) *</label>
                      <input required value={form.kodeProduk} onChange={(e) => set("kodeProduk", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                        placeholder="WH-001" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Category *</label>
                      <select required value={form.categoryId} onChange={(e) => set("categoryId", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100">
                        <option value="">Select category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Description</label>
                    <textarea rows={3} value={form.deskripsi ?? ""} onChange={(e) => set("deskripsi", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                      placeholder="Describe the product clearly for customers..." />
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="rounded-xl border border-slate-100 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Product Image</h3>
                <div onClick={() => fileRef.current?.click()}
                  className="relative flex h-36 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-[#1e3a8a]">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-400">
                      <Upload size={24} />
                      <span className="text-xs font-semibold">Upload product image</span>
                      <span className="text-[10px]">JPG, PNG, WebP · Max 2MB</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Loader2 size={20} className="animate-spin text-[#1e3a8a]" />
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                {imagePreview && (
                  <button type="button" onClick={() => { setImagePreview(""); setImageFile(null); set("image", ""); }}
                    className="mt-1.5 flex items-center gap-1 text-xs text-red-500 hover:underline">
                    <X size={11} /> Remove image
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-4">
              {/* Pricing */}
              <div className="rounded-xl border border-slate-100 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Pricing & Inventory</h3>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Price (IDR) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                      <input required type="number" min={0} value={form.harga} onChange={(e) => set("harga", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">Includes 11% PPN sales tax</p>
                  </div>
                  <div>
                    <label className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                      Stock Units *
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${form.stok > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {form.stok > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => set("stok", Math.max(0, Number(form.stok) - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold">−</button>
                      <input type="number" min={0} value={form.stok} onChange={(e) => set("stok", e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 text-center text-sm font-bold outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100" />
                      <button type="button" onClick={() => set("stok", Number(form.stok) + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="rounded-xl border border-slate-100 p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Product Status</h3>
                <div className="space-y-2">
                  {[
                    { value: "active", label: "Active", desc: "Visible in storefront catalog", color: "border-emerald-400 bg-emerald-50" },
                    { value: "draft", label: "Draft", desc: "Saved but hidden from customers", color: "border-slate-200 bg-white" },
                  ].map((s) => (
                    <label key={s.value} className={`flex cursor-pointer items-start gap-2.5 rounded-xl border-2 p-3 transition-all ${s.value === "active" ? s.color : "border-slate-100 bg-white"}`}>
                      <input type="radio" name="status" value={s.value} defaultChecked={s.value === "active"} className="mt-0.5 accent-[#1e3a8a]" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{s.label}</p>
                        <p className="text-[10px] text-slate-500">{s.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{error}</p>}

          <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || uploading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-2.5 text-sm font-bold text-white hover:bg-[#1e40af] disabled:opacity-60">
              {(loading || uploading) && <Loader2 size={14} className="animate-spin" />}
              {uploading ? "Uploading..." : loading ? "Saving..." : product ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Product | undefined>();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(query); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`/api/products?limit=${LIMIT}&page=${page}${debouncedQuery ? `&search=${encodeURIComponent(debouncedQuery)}` : ""}`),
        fetch("/api/categories"),
      ]);
      const pData = await pRes.json();
      const cData = await cRes.json();
      setProducts(pData.products ?? []);
      setTotal(pData.total ?? 0);
      setCategories(cData.categories ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [debouncedQuery, page]);

  const totalPages = Math.ceil(total / LIMIT);
  const inStock = products.filter((p) => p.stok > 0).length;
  const lowStock = products.filter((p) => p.stok > 0 && p.stok <= 8).length;
  const outOfStock = products.filter((p) => p.stok === 0).length;

  const allChecked = products.length > 0 && products.every((p) => checkedIds.has(p.id));
  const toggleAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(products.map((p) => p.id)));
  };
  const toggleOne = (id: string) => {
    const s = new Set(checkedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setCheckedIds(s);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true); setError("");
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Gagal menghapus"); return; }
      setDeleteId(null); load();
    } catch { setError("Terjadi kesalahan koneksi"); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin / Products</p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Manage your product catalog, real-time inventory, pricing, and category assignments.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Download size={13} /> Export
          </button>
          <button onClick={() => { setSelected(undefined); setModal("add"); }}
            className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
            <Plus size={13} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Products", value: total, sub: "+4 this month", icon: Package, color: "text-[#1e3a8a]", bg: "bg-blue-50" },
          { label: "In Stock", value: inStock, sub: `${total > 0 ? Math.round(inStock / Math.max(total, 1) * 100) : 0}% of total catalog`, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Low Stock", value: lowStock, sub: "Needs attention", icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Out of Stock", value: outOfStock, sub: "Currently unavailable", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2 ${bg}`}><Icon size={16} className={color} /></div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-600">{label}</p>
            <p className="text-[10px] text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      {/* Bulk action bar */}
      {checkedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-[#1e3a8a] px-4 py-3 text-white">
          <span className="text-sm font-bold">{checkedIds.size} products selected</span>
          <button className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30">
            <Trash2 size={13} /> Delete Selected
          </button>
          <button onClick={() => setCheckedIds(new Set())} className="rounded-lg p-1.5 hover:bg-white/20">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or code..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          {query && <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>}
        </div>
        <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <Filter size={13} /> Filters
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Package size={40} />
            <p className="text-sm font-semibold">{query ? "No products found" : "No products yet"}</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_80px] items-center gap-3 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <button onClick={toggleAll} className="flex items-center">
                {allChecked ? <CheckSquare size={16} className="text-[#1e3a8a]" /> : <Square size={16} className="text-slate-300" />}
              </button>
              <span>Product</span><span>Category</span>
              <span>SKU / Code</span><span>Price</span>
              <span>Stock</span><span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-slate-50">
              {products.map((product) => (
                <div key={product.id}
                  className={`grid grid-cols-[40px_2fr_1fr_1fr_1fr_1fr_80px] items-center gap-3 px-5 py-3.5 transition-colors ${checkedIds.has(product.id) ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                  {/* Checkbox */}
                  <button onClick={() => toggleOne(product.id)} className="flex items-center">
                    {checkedIds.has(product.id)
                      ? <CheckSquare size={16} className="text-[#1e3a8a]" />
                      : <Square size={16} className="text-slate-300" />}
                  </button>

                  {/* Product */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {product.image
                        ? <Image src={product.image} alt={product.namaProduk} fill className="object-cover" unoptimized />
                        : <div className="flex h-full w-full items-center justify-center"><Package size={14} className="text-slate-300" /></div>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{product.namaProduk}</p>
                      {product.deskripsi && <p className="truncate text-[10px] text-slate-400 line-clamp-1">{product.deskripsi}</p>}
                    </div>
                  </div>

                  {/* Category */}
                  <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                    {product.category.name}
                  </span>

                  {/* SKU */}
                  <span className="rounded-lg bg-slate-50 px-2 py-1 font-mono text-[10px] font-bold text-slate-600">
                    {product.kodeProduk}
                  </span>

                  {/* Price */}
                  <span className="text-sm font-bold text-slate-800">{formatRupiah(Number(product.harga))}</span>

                  {/* Stock */}
                  <div>
                    {product.stok === 0 ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> 0 Out of stock
                      </span>
                    ) : product.stok <= 8 ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {product.stok} Low stock
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {product.stok} units
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil size={14} />
                    </Link>
                    {deleteId === product.id ? (
                      <button onClick={() => handleDelete(product.id)} disabled={deleteLoading}
                        className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50">
                        {deleteLoading ? "..." : "Confirm"}
                      </button>
                    ) : (
                      <button onClick={() => { setError(""); setDeleteId(product.id); }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
              <p className="text-xs text-slate-500">
                Showing <span className="font-bold">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}</span> of <span className="font-bold">{total}</span> products
              </p>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition-colors ${page === n ? "bg-[#1e3a8a] text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                    {n}
                  </button>
                ))}
                {totalPages > 5 && <span className="text-xs text-slate-400">...</span>}
                <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => p + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {(modal === "add" || modal === "edit") && (
        <ProductModal
          product={modal === "edit" ? selected : undefined}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
