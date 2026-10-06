"use client";

import { useEffect, useState } from "react";
import {
  Plus, Pencil, Trash2, Tag, X, Loader2, Search,
  Download, Filter, FolderOpen, Package, CheckSquare,
  Square, ChevronLeft, ChevronRight, Link2, Shield, RefreshCw,
  MoreVertical,
} from "lucide-react";
import { formatDate } from "@/lib/utils/format";

type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  _count: { products: number };
};

const CATEGORY_ICONS: Record<string, string> = {
  electronics: "🖥️",
  fashion: "👕",
  food: "☕",
  accessories: "💡",
  default: "📦",
};

const CATEGORY_DESC: Record<string, string> = {
  electronics: "Devices, gadgets, and electronic accessories",
  fashion: "Apparel, footwear, and wearable style",
  food: "Gourmet, coffee beans, and packaged delicacies",
  accessories: "Stands, cables, desk organizers, and add-ons",
  default: "Product category",
};

function CategoryModal({
  category, onClose, onSaved,
}: {
  category?: Category; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const url = category ? `/api/categories/${category.id}` : "/api/categories";
      const method = category ? "PUT" : "POST";
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      onSaved();
    } catch { setError("Connection error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              {category ? "Edit Category" : "Add New Category"}
            </h2>
            <p className="text-xs text-slate-500">Category will appear in storefront filters</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 hover:bg-slate-100"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Category Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. Electronics" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Slug (optional)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="auto-generated if empty" />
            <p className="mt-1 text-[10px] text-slate-400">
              URL: /category/<strong>{slug || (name ? name.toLowerCase().replace(/\s+/g, "-") : "slug")}</strong>
            </p>
          </div>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-2.5 text-sm font-bold text-white hover:bg-[#1e40af] disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              {category ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Category | undefined>();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories ?? []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.slug.toLowerCase().includes(query.toLowerCase())
  );

  const totalProducts = categories.reduce((s, c) => s + c._count.products, 0);
  const emptyCats = categories.filter((c) => c._count.products === 0).length;
  const allChecked = filtered.length > 0 && filtered.every((c) => checkedIds.has(c.id));

  const toggleAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(filtered.map((c) => c.id)));
  };
  const toggleOne = (id: string) => {
    const s = new Set(checkedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setCheckedIds(s);
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(true); setError("");
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to delete"); return; }
      setDeleteId(null); load();
    } catch { setError("Connection error"); }
    finally { setDeleteLoading(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dashboard / Categories</p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">Organize your product catalog into clear and manageable categories.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Download size={13} /> Export
          </button>
          <button onClick={() => { setSelected(undefined); setModal("add"); }}
            className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
            <Plus size={13} /> Add Category
          </button>
        </div>
      </div>

      {/* 4 Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Categories", value: categories.length,
            sub: "All catalog categories", icon: FolderOpen,
            color: "text-[#1e3a8a]", bg: "bg-blue-50",
          },
          {
            label: "Active Categories", value: categories.length,
            sub: <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">100% active</span>,
            extra: "Published & visible in store", icon: Tag,
            color: "text-emerald-600", bg: "bg-emerald-50",
          },
          {
            label: "Products Assigned", value: totalProducts,
            sub: "Across all categories", icon: Package,
            color: "text-violet-600", bg: "bg-violet-50",
          },
          {
            label: "Empty Categories", value: emptyCats,
            sub: emptyCats === 0
              ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">Optimal</span>
              : <span className="text-[10px] text-amber-500">Needs attention</span>,
            extra: "All categories in use", icon: FolderOpen,
            color: "text-slate-500", bg: "bg-slate-100",
          },
        ].map(({ label, value, sub, extra, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2 ${bg}`}><Icon size={15} className={color} /></div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <div className="mt-1 text-[10px] text-slate-500">{sub}</div>
            {extra && <p className="text-[10px] text-slate-400">{extra}</p>}
          </div>
        ))}
      </div>

      {/* Bulk action bar */}
      {checkedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-[#1e3a8a] px-4 py-3 text-white">
          <span className="text-sm font-bold">{checkedIds.size} selected</span>
          <button className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30">
            <Trash2 size={12} /> Delete Selected
          </button>
          <button onClick={() => setCheckedIds(new Set())} className="rounded-lg p-1.5 hover:bg-white/20">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <Search size={14} className="shrink-0 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          {query && <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>}
        </div>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option>All Status</option>
          <option>Active</option>
          <option>Empty</option>
        </select>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Most Products</option>
        </select>
        <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <Filter size={13} /> Filters
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <div className="flex justify-center py-14"><Loader2 size={22} className="animate-spin text-slate-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-slate-400">
            <Tag size={36} /><p className="text-sm font-semibold">No categories found</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[40px_3fr_1.5fr_1.5fr_1fr_1fr_60px] items-center gap-4 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              <button onClick={toggleAll} className="flex items-center">
                {allChecked
                  ? <CheckSquare size={15} className="text-[#1e3a8a]" />
                  : <Square size={15} className="text-slate-300" />}
              </button>
              <span>Category</span>
              <span>Slug</span>
              <span>Products</span>
              <span>Status</span>
              <span>Created</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-slate-50">
              {filtered.map((cat) => {
                const icon = CATEGORY_ICONS[cat.slug] ?? CATEGORY_ICONS.default;
                const desc = CATEGORY_DESC[cat.slug] ?? CATEGORY_DESC.default;
                const pct = totalProducts > 0 ? Math.round((cat._count.products / totalProducts) * 100) : 0;

                return (
                  <div key={cat.id}
                    className={`grid grid-cols-[40px_3fr_1.5fr_1.5fr_1fr_1fr_60px] items-center gap-4 px-5 py-4 transition-colors ${checkedIds.has(cat.id) ? "bg-blue-50/40" : "hover:bg-slate-50"}`}>
                    {/* Checkbox */}
                    <button onClick={() => toggleOne(cat.id)} className="flex items-center">
                      {checkedIds.has(cat.id)
                        ? <CheckSquare size={15} className="text-[#1e3a8a]" />
                        : <Square size={15} className="text-slate-300" />}
                    </button>

                    {/* Category name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-extrabold text-slate-900">{cat.name}</p>
                        </div>
                        <p className="truncate text-[11px] text-slate-400">{desc}</p>
                      </div>
                    </div>

                    {/* Slug */}
                    <span className="rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-500 truncate">
                      {cat.slug}
                    </span>

                    {/* Products with progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">{cat._count.products} products</span>
                        <span className="text-slate-400">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#1e3a8a] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                    </span>

                    {/* Created date */}
                    <div>
                      <p className="text-[11px] text-slate-600">
                        {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelected(cat); setModal("edit"); }}
                        className="rounded-lg p-1.5 text-[#1e3a8a] hover:bg-blue-50 text-xs font-semibold flex items-center gap-1">
                        <Pencil size={13} /> <span className="hidden md:inline">Edit</span>
                      </button>
                      {deleteId === cat.id ? (
                        <button onClick={() => handleDelete(cat.id)} disabled={deleteLoading}
                          className="rounded-lg bg-red-500 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50">
                          {deleteLoading ? "..." : "Confirm"}
                        </button>
                      ) : (
                        <button
                          onClick={() => { setError(""); setDeleteId(cat.id); }}
                          disabled={cat._count.products > 0}
                          title={cat._count.products > 0 ? "Remove products first" : "Delete"}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-25">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
              <p className="text-xs text-slate-500">
                Showing <span className="font-bold">1–{filtered.length}</span> of <span className="font-bold">{categories.length}</span> categories
              </p>
              <div className="flex items-center gap-1">
                <button disabled className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40">
                  <ChevronLeft size={13} />
                </button>
                <button className="h-7 w-7 rounded-lg bg-[#1e3a8a] text-xs font-bold text-white">1</button>
                <button disabled className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:opacity-40">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Info cards footer */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Link2, color: "bg-blue-50 text-[#1e3a8a]",
            title: "SEO Permalinks",
            desc: "Slugs auto-generate clean canonical routes like /category/electronics for indexing.",
          },
          {
            icon: Shield, color: "bg-emerald-50 text-emerald-600",
            title: "Safe Deletion Lock",
            desc: "Categories with assigned inventory cannot be deleted accidentally to prevent orphan items.",
          },
          {
            icon: RefreshCw, color: "bg-violet-50 text-violet-600",
            title: "Real-Time Inventory",
            desc: "Category product counts dynamically recompute whenever merchandise status updates.",
          },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
              <Icon size={15} />
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-800">{title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {(modal === "add" || modal === "edit") && (
        <CategoryModal
          category={modal === "edit" ? selected : undefined}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
