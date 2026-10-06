"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, Save, Trash2, Package, Loader2, Check,
  Upload, X, Eye, ChevronRight, RefreshCw, Camera,
  ShieldCheck, Archive, AlertCircle,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";

type Category = { id: string; name: string; slug: string };
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

type ProductStatus = "active" | "draft" | "archived";

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    namaProduk: "",
    kodeProduk: "",
    slug: "",
    categoryId: "",
    deskripsi: "",
    harga: 0,
    stok: 0,
    image: "",
  });
  const [status, setStatus] = useState<ProductStatus>("active");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [charCount, setCharCount] = useState(0);

  const set = (k: string, v: string | number) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "deskripsi") setCharCount(String(v).length);
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([pData, cData]) => {
      const p = pData.product;
      if (!p) { router.push("/admin/products"); return; }
      setProduct(p);
      setForm({
        namaProduk: p.namaProduk,
        kodeProduk: p.kodeProduk,
        slug: p.slug,
        categoryId: p.category.id,
        deskripsi: p.deskripsi ?? "",
        harga: Number(p.harga),
        stok: p.stok,
        image: p.image ?? "",
      });
      setCharCount((p.deskripsi ?? "").length);
      setImagePreview(p.image ?? "");
      setCategories(cData.categories ?? []);
    }).finally(() => setLoading(false));
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return form.image || null;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", imageFile);
      const res = await fetch(`/api/products/${id}/upload`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return null; }
      return data.imageUrl;
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    setError(""); setSaving(true);
    try {
      // Upload image first if changed
      let imageUrl = form.image;
      if (imageFile) {
        const url = await uploadImage();
        if (url) imageUrl = url;
      }

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image: imageUrl || null,
          deskripsi: form.deskripsi || null,
          harga: Number(form.harga),
          stok: Number(form.stok),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      setProduct(data.product);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/admin/products");
      else {
        const data = await res.json();
        setError(data.error ?? "Failed to delete");
        setShowDeleteConfirm(false);
      }
    } finally { setDeleting(false); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
  );

  if (!product) return null;

  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const taxAmount = Math.round(Number(form.harga) * 0.11);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/admin/products" className="flex items-center gap-1 hover:text-[#1e3a8a]">
            <ArrowLeft size={13} /> Products
          </Link>
          <ChevronRight size={11} />
          <span className="text-slate-500">Edit Product</span>
          <ChevronRight size={11} />
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
            {form.kodeProduk}
          </span>
        </div>
        <Link href="/admin/products"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
          ← Back to Products
        </Link>
      </div>

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">{form.namaProduk || "Edit Product"}</h1>
        <p className="text-sm text-slate-500">Manage SKU attributes, photography, pricing, and live inventory counts.</p>
      </div>

      {/* Saved banner */}
      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Check size={16} /> Changes saved successfully!
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Main 2-col grid */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* ── LEFT ── */}
        <div className="space-y-5">
          {/* Basic Information */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Basic Information</h2>
                <p className="text-xs text-slate-500">Enter the main information customers will see about this product in the catalog.</p>
              </div>
              <span className="text-[10px] text-slate-400">* Required fields</span>
            </div>
            <div className="space-y-4 p-6">
              {/* Product Name */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Product Name *</label>
                  <span className="text-[10px] text-slate-400">Max 120 chars</span>
                </div>
                <input
                  value={form.namaProduk}
                  onChange={(e) => set("namaProduk", e.target.value)}
                  maxLength={120}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Wireless Headphones"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Product Code */}
                <div>
                  <div className="mb-1.5 flex items-center gap-1">
                    <label className="text-xs font-semibold text-slate-700">Product Code (SKU) *</label>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">▦</span>
                    <input
                      value={form.kodeProduk}
                      onChange={(e) => set("kodeProduk", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-4 font-mono text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                      placeholder="WH-001"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">Unique inventory identifier</p>
                </div>

                {/* Slug */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">Store URL Slug</label>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#1e3a8a] focus-within:ring-2 focus-within:ring-blue-100">
                    <span className="whitespace-nowrap pl-3 text-[10px] text-slate-400">/products/</span>
                    <input
                      value={form.slug}
                      onChange={(e) => set("slug", e.target.value)}
                      className="flex-1 bg-transparent py-2.5 pr-3 font-mono text-xs outline-none"
                      placeholder="wireless-headphones"
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">Permanent canonical web link</p>
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Category *</label>
                  <button className="flex items-center gap-1 text-[10px] font-semibold text-[#1e3a8a] hover:underline">
                    + Add Category
                  </button>
                </div>
                <select
                  value={form.categoryId}
                  onChange={(e) => set("categoryId", e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Product Description</h2>
                <p className="text-xs text-slate-500">Describe the product clearly for customers, detailing materials, audio specs, and warranty.</p>
              </div>
            </div>
            <div className="p-6">
              {/* Fake toolbar */}
              <div className="mb-2 flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5">
                {["B", "I", "≡", "⋮", "🔗"].map((t) => (
                  <button key={t} type="button"
                    className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-slate-500 hover:bg-white hover:shadow-sm">
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                value={form.deskripsi}
                onChange={(e) => set("deskripsi", e.target.value)}
                rows={5}
                maxLength={2000}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                placeholder="Experience clear, immersive sound with a comfortable wireless design..."
              />
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Markdown styling supported</span>
                <span className={charCount > 1800 ? "text-amber-500 font-semibold" : ""}>{charCount} / 2,000 characters</span>
              </div>
            </div>
          </div>

          {/* Product Image */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Product Image</h2>
                <p className="text-xs text-slate-500">Upload a studio-grade product photograph in JPG, PNG, or WebP format (up to 2 MB).</p>
              </div>
              <Camera size={15} className="text-slate-400" />
            </div>
            <div className="p-6">
              {imagePreview ? (
                <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <Loader2 size={16} className="animate-spin text-[#1e3a8a]" />
                      </div>
                    )}
                    <span className="absolute bottom-1 left-1 rounded bg-[#1e3a8a] px-1 py-0.5 text-[8px] font-bold text-white">
                      MAIN
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-800">
                      {imageFile ? imageFile.name : "product-image.jpg"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">✓ Optimized</span>
                      <span className="text-[10px] text-slate-400">Aspect 1:1</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => fileRef.current?.click()}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        Change Image
                      </button>
                      <button onClick={() => { setImagePreview(""); setImageFile(null); set("image", ""); }}
                        className="rounded-lg border border-red-200 p-1.5 text-red-400 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-[#1e3a8a] hover:bg-blue-50/30"
                >
                  <Upload size={24} className="text-slate-400" />
                  <p className="text-xs font-semibold text-slate-500">Click to upload product image</p>
                  <p className="text-[10px] text-slate-400">JPG, PNG, WebP · Max 2MB · Recommended 1:1 ratio</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
            </div>
          </div>
        </div>

        {/* ── RIGHT sidebar ── */}
        <div className="space-y-4">
          {/* Pricing & Inventory */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-800">Pricing & Inventory</h2>
              <span className="text-[10px] text-slate-400">Control retail pricing and live inventory counts.</span>
            </div>
            <div className="space-y-4 p-5">
              {/* Price */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Price (IDR) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                  <input
                    type="number" min={0}
                    value={form.harga}
                    onChange={(e) => set("harga", Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-bold outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Includes 11% PPN sales tax · <span className="font-semibold">+{formatRupiah(taxAmount)}</span>
                </p>
              </div>

              {/* Stock */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Stock Units *</label>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    form.stok > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                  }`}>
                    {form.stok > 0 ? "● In Stock" : "● Out of Stock"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button"
                    onClick={() => set("stok", Math.max(0, Number(form.stok) - 1))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-600 hover:bg-slate-50">
                    −
                  </button>
                  <input
                    type="number" min={0}
                    value={form.stok}
                    onChange={(e) => set("stok", Number(e.target.value))}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-bold outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                  />
                  <button type="button"
                    onClick={() => set("stok", Number(form.stok) + 1)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg font-bold text-slate-600 hover:bg-slate-50">
                    +
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">Available physical units ready for shipment</p>
              </div>
            </div>
          </div>

          {/* Product Status */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-800">Product Status</h2>
              <Eye size={14} className="text-slate-400" />
            </div>
            <div className="space-y-2 p-5">
              <p className="mb-3 text-[10px] text-slate-500">Set visibility across the customer shopping journey.</p>
              {[
                {
                  value: "active" as ProductStatus,
                  label: "Active",
                  desc: "Visible and available in storefront catalog",
                  icon: ShieldCheck,
                  color: "border-emerald-400 bg-emerald-50",
                },
                {
                  value: "draft" as ProductStatus,
                  label: "Draft",
                  desc: "Saved but hidden from customers and search engines",
                  icon: RefreshCw,
                  color: "border-slate-200 bg-white",
                },
                {
                  value: "archived" as ProductStatus,
                  label: "Archived",
                  desc: "Retired from active stock, preserving order history",
                  icon: Archive,
                  color: "border-slate-200 bg-white",
                },
              ].map(({ value, label, desc, icon: Icon }) => (
                <label key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition-all ${
                    status === value
                      ? value === "active" ? "border-emerald-400 bg-emerald-50" : "border-[#1e3a8a] bg-blue-50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}>
                  <input type="radio" name="status" value={value}
                    checked={status === value}
                    onChange={() => setStatus(value)}
                    className="mt-0.5 accent-[#1e3a8a]" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-slate-800">{label}</p>
                      {status === value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Store Preview */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-extrabold text-slate-800">Store Preview</h2>
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live Catalog Render
              </span>
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-xl border border-slate-100">
                {/* Preview card */}
                <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
                  {imagePreview ? (
                    <Image src={imagePreview} alt={form.namaProduk} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package size={36} className="text-slate-300" />
                    </div>
                  )}
                  <span className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[9px] font-bold text-white ${
                    form.stok > 0 ? "bg-emerald-500" : "bg-red-500"
                  }`}>
                    {form.stok > 0 ? "IN STOCK" : "OUT OF STOCK"}
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    {selectedCategory?.name ?? "Category"}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs font-extrabold text-slate-900">
                    {form.namaProduk || "Product Name"}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-[#1e3a8a]">
                    {form.harga > 0 ? formatRupiah(Number(form.harga)) : "Rp 0"}
                  </p>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <span key={s} className="text-[10px] text-amber-400">★</span>
                    ))}
                    <span className="ml-1 text-[9px] text-slate-400">4.9 (42)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save & Delete */}
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-3.5 text-sm font-bold text-white transition hover:bg-[#1e40af] disabled:opacity-60 active:scale-95"
          >
            {(saving || uploading) ? (
              <><Loader2 size={16} className="animate-spin" /> {uploading ? "Uploading..." : "Saving..."}</>
            ) : saved ? (
              <><Check size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Changes</>
            )}
          </button>

          <button
            onClick={() => router.push("/admin/products")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          {/* Delete */}
          <div className="border-t border-slate-100 pt-3">
            {showDeleteConfirm ? (
              <div className="space-y-2 rounded-xl bg-red-50 p-3">
                <p className="text-xs font-bold text-red-700">Are you sure? This action cannot be undone.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white">
                    Cancel
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-600 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50">
                    {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="flex w-full items-center justify-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700">
                <Trash2 size={13} /> Delete Product
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
