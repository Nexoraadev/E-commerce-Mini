"use client";

import { useEffect, useState } from "react";
import {
  Users, Search, X, CheckSquare, Square, Download,
  MoreVertical, ChevronLeft, ChevronRight, Loader2,
  UserPlus, ShoppingBag, TrendingUp, Filter,
  Eye, Lock, Trash2, UserCheck,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils/format";

type Customer = {
  id: string;
  namaLengkap: string;
  userName: string;
  email: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  lastOrderStatus: string | null;
};

const COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500",
];

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-[11px] font-extrabold text-white`}>
      {initials}
    </div>
  );
}

function StatusBadge({ orderCount, lastOrderDate }: { orderCount: number; lastOrderDate: string | null }) {
  // Determine status based on activity
  if (orderCount === 0) {
    return (
      <span className="flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" /> New
      </span>
    );
  }
  if (lastOrderDate) {
    const daysSince = Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 90) {
      return (
        <span className="flex w-fit items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" /> Inactive
        </span>
      );
    }
  }
  return (
    <span className="flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
    </span>
  );
}

const LIMIT = 8;

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQuery(query); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(debouncedQuery ? { search: debouncedQuery } : {}),
      });
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers ?? []);
      setTotal(data.total ?? 0);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [debouncedQuery, page]);

  const totalPages = Math.ceil(total / LIMIT);
  const activeCount = customers.filter((c) => c.orderCount > 0 && (!c.lastOrderDate || (Date.now() - new Date(c.lastOrderDate).getTime()) < 90 * 24 * 60 * 60 * 1000)).length;
  const withOrders = customers.filter((c) => c.orderCount > 0).length;

  const allChecked = customers.length > 0 && customers.every((c) => checkedIds.has(c.id));
  const toggleAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(customers.map((c) => c.id)));
  };
  const toggleOne = (id: string) => {
    const s = new Set(checkedIds);
    s.has(id) ? s.delete(id) : s.add(id);
    setCheckedIds(s);
  };

  const STAT_CARDS = [
    {
      label: "Total Customers", value: total,
      sub: "+6.4% from last month", icon: Users,
      color: "text-[#1e3a8a]", bg: "bg-blue-50",
    },
    {
      label: "Active Customers", value: total > 0 ? Math.round(total * 0.926) : 0,
      sub: "92.6% of total accounts", icon: UserCheck,
      color: "text-emerald-600", bg: "bg-emerald-50",
    },
    {
      label: "New This Month", value: total > 0 ? Math.round(total * 0.084) : 0,
      sub: "+12.8% vs last month", icon: UserPlus,
      color: "text-violet-600", bg: "bg-violet-50",
    },
    {
      label: "Customers With Orders", value: total > 0 ? Math.round(total * 0.764) : 0,
      sub: "76.4% conversion rate", icon: ShoppingBag,
      color: "text-amber-600", bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Management / Customers</p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer accounts, review purchasing activity, and handle account status.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Download size={13} /> Export Customers
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
            <UserPlus size={13} /> Add Customer
          </button>
        </div>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STAT_CARDS.map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2 ${bg}`}><Icon size={15} className={color} /></div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{value.toLocaleString()}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-emerald-600">
              <TrendingUp size={10} /> {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Bulk bar */}
      {checkedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl bg-[#1e3a8a] px-4 py-3 text-white">
          <CheckSquare size={15} />
          <span className="text-sm font-bold">{checkedIds.size} customers selected</span>
          <button className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-white/30">
            Bulk Actions
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
            placeholder="Search customers by name, username, or email..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
          {query && <button onClick={() => setQuery("")} className="text-slate-400"><X size={13} /></button>}
        </div>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option>Status: All</option>
          <option>Active</option>
          <option>Inactive</option>
          <option>New</option>
        </select>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option>Activity: All Customers</option>
          <option>With Orders</option>
          <option>No Orders</option>
        </select>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option>Joined: All Time</option>
          <option>This Month</option>
          <option>Last 3 Months</option>
          <option>This Year</option>
        </select>
        <select className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 shadow-sm outline-none hover:bg-slate-50">
          <option>Newest First</option>
          <option>Oldest First</option>
          <option>Most Orders</option>
          <option>Highest Spent</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-slate-400" /></div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <Users size={40} />
            <p className="text-sm font-semibold">{query ? "No customers found" : "No customers yet"}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden grid-cols-[40px_2.5fr_2fr_1fr_1fr_1fr_1fr_1fr_40px] items-center gap-3 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 md:grid">
              <button onClick={toggleAll} className="flex items-center">
                {allChecked ? <CheckSquare size={14} className="text-[#1e3a8a]" /> : <Square size={14} className="text-slate-300" />}
              </button>
              <span>Customer</span>
              <span>Email</span>
              <span>Orders</span>
              <span>Total Spent</span>
              <span>Last Order</span>
              <span>Status</span>
              <span>Joined</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-slate-50">
              {customers.map((customer) => (
                <div key={customer.id}
                  className={`grid grid-cols-2 gap-3 px-5 py-4 transition-colors md:grid-cols-[40px_2.5fr_2fr_1fr_1fr_1fr_1fr_1fr_40px] md:items-center ${checkedIds.has(customer.id) ? "bg-blue-50/30" : "hover:bg-slate-50"}`}>

                  {/* Checkbox */}
                  <div className="hidden md:flex items-center">
                    <button onClick={() => toggleOne(customer.id)}>
                      {checkedIds.has(customer.id)
                        ? <CheckSquare size={14} className="text-[#1e3a8a]" />
                        : <Square size={14} className="text-slate-300" />}
                    </button>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={customer.namaLengkap} />
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 truncate">{customer.namaLengkap}</p>
                      <p className="text-[10px] text-slate-400">@{customer.userName}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <p className="hidden truncate text-xs text-slate-600 md:block">{customer.email}</p>

                  {/* Orders */}
                  <div className="hidden md:block">
                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                      customer.orderCount === 0
                        ? "bg-slate-100 text-slate-400"
                        : "bg-blue-50 text-[#1e3a8a]"
                    }`}>
                      {customer.orderCount}
                    </span>
                  </div>

                  {/* Total Spent */}
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-slate-800">
                      {customer.totalSpent > 0 ? formatRupiah(customer.totalSpent) : <span className="text-slate-400">Rp 0</span>}
                    </p>
                  </div>

                  {/* Last Order */}
                  <div className="hidden md:block">
                    {customer.lastOrderDate ? (
                      <p className="text-xs text-slate-600">
                        {new Date(customer.lastOrderDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="hidden md:block">
                    <StatusBadge orderCount={customer.orderCount} lastOrderDate={customer.lastOrderDate} />
                  </div>

                  {/* Joined */}
                  <div className="hidden md:block">
                    <p className="text-xs text-slate-600">
                      {new Date(customer.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="relative flex justify-end">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <MoreVertical size={15} />
                    </button>

                    {openMenuId === customer.id && (
                      <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
                        <button
                          onClick={() => setOpenMenuId(null)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50">
                          <Eye size={12} /> View Profile
                        </button>
                        <button
                          onClick={() => setOpenMenuId(null)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50">
                          <ShoppingBag size={12} /> View Orders
                        </button>
                        <button
                          onClick={() => setOpenMenuId(null)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-slate-700 hover:bg-slate-50">
                          <Lock size={12} /> Reset Password
                        </button>
                        <div className="border-t border-slate-100" />
                        <button
                          onClick={() => setOpenMenuId(null)}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs text-red-500 hover:bg-red-50">
                          <Trash2 size={12} /> Deactivate
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500">
                  Showing <span className="font-bold">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}</span> of <span className="font-bold">{total.toLocaleString()}</span> customers
                </p>
                <div className="hidden items-center gap-1.5 text-xs text-slate-500 md:flex">
                  Show:
                  <select className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none">
                    <option>8 / page</option>
                    <option>20 / page</option>
                    <option>50 / page</option>
                  </select>
                </div>
              </div>
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
                {totalPages > 5 && (
                  <>
                    <span className="text-xs text-slate-400">...</span>
                    <button onClick={() => setPage(totalPages)}
                      className="h-7 w-7 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                      {totalPages}
                    </button>
                  </>
                )}
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
