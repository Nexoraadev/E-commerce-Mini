"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Search, LogOut, User, Package, ShoppingBag, ChevronDown, X, Settings } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import type { JwtPayload } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/", label: "Products" },
  { href: "/?nav=categories", label: "Categories" },
  { href: "/orders", label: "Orders" },
];

export function HeaderClient({ user }: { user: JwtPayload | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 50);
  }, [showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = user?.namaLengkap
    ? user.namaLengkap.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="flex items-center gap-1">
      {/* Desktop nav — customer only */}
      {(!user || user.role === "CUSTOMER") && (
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={label}
                href={href}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  active
                    ? "text-[#1e3a8a] underline decoration-2 underline-offset-4"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Admin nav */}
      {user?.role === "ADMIN" && (
        <Link href="/admin" className="hidden rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 md:block">
          Dashboard
        </Link>
      )}

      <div className="flex items-center gap-1">
        {/* Search button */}
        <button
          onClick={() => setShowSearch(true)}
          className="rounded-full p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Search"
        >
          <Search size={19} />
        </button>

        {/* Cart */}
        {(!user || user.role === "CUSTOMER") && (
          <Link href="/cart" aria-label="Cart" className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
            <ShoppingCart size={19} />
            {mounted && cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e3a8a] text-[10px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        )}

        {/* User */}
        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 rounded-full p-1 hover:bg-slate-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-bold text-white shadow">
                {initials}
              </div>
              <ChevronDown size={14} className={`hidden text-slate-500 transition-transform md:block ${showUserMenu ? "rotate-180" : ""}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                {/* User info */}
                <div className="border-b bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.namaLengkap}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  <span className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    user.role === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                  }`}>
                    {user.role}
                  </span>
                </div>
                {/* Menu items */}
                <div className="p-1.5">
                  {/* Profile link — semua user */}
                  <Link href="/profile" onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <Settings size={15} /> Account Settings
                  </Link>
                  {user.role === "CUSTOMER" && (
                    <>
                      <Link href="/orders" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <ShoppingBag size={15} /> My Orders
                      </Link>
                      <Link href="/cart" onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        <ShoppingCart size={15} /> My Cart
                      </Link>
                    </>
                  )}
                  {user.role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <Package size={15} /> Admin Panel
                    </Link>
                  )}
                  <div className="my-1 border-t border-slate-100" />
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-50">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login"
            className="ml-1 rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-bold text-white hover:bg-[#1e40af]">
            Sign In
          </Link>
        )}
      </div>

      {/* Search overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20 px-4"
          onClick={() => setShowSearch(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 text-sm outline-none"
              />
              <button type="button" onClick={() => setShowSearch(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
