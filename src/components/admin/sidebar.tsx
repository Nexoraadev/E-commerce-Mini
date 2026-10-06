"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  Store, LogOut, Settings, ChevronRight, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminSidebar({ adminName = "Admin", adminEmail = "" }: { adminName?: string; adminEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-full w-56 flex-col bg-[#0f1729] text-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a8a]">
          <Store size={16} className="text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-white">MiniShop</span>
          <span className="rounded bg-blue-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-300">
            Admin
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 p-3 pt-4">
        <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          Main Menu
        </p>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "bg-[#1e3a8a] text-white shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
            </Link>
          );
        })}

        <p className="mb-2 mt-5 px-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">
          Store
        </p>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white"
        >
          <Store size={16} />
          View Store
          <ExternalLink size={11} className="ml-auto opacity-50" />
        </Link>
        <Link
          href="/admin/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
            pathname.startsWith("/admin/settings")
              ? "bg-[#1e3a8a] text-white shadow-sm"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          )}
        >
          <Settings size={16} />
          Settings
          {pathname.startsWith("/admin/settings") && <ChevronRight size={13} className="ml-auto opacity-60" />}
        </Link>
      </nav>

      {/* User bottom */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <Link href="/admin/profile" className="flex flex-1 min-w-0 items-center gap-3 rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-white">{adminName}</p>
              <p className="truncate text-[10px] text-slate-500">{adminEmail || "admin@minicommerce.test"}</p>
            </div>
          </Link>
          <button onClick={handleLogout} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/10 hover:text-red-400" title="Sign Out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
