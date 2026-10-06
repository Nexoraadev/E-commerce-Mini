import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { Search, Bell } from "lucide-react";

export const metadata = { title: "Admin — MiniShop" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex h-dvh flex-col bg-[#f0f2f8] lg:flex-row">
      {/* Sidebar — desktop */}
      <div className="hidden lg:flex lg:shrink-0">
        <AdminSidebar adminName={session.namaLengkap} adminEmail={session.email} />
      </div>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
          {/* Breadcrumb / title area (filled by pages via context — placeholder) */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">Admin</span>
            <span>/</span>
            <span>Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
              <Search size={14} className="text-slate-400" />
              <input
                placeholder="Search store, orders, items..."
                className="w-48 bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>
            {/* Bell */}
            <button className="relative rounded-xl border border-slate-200 bg-white p-2 hover:bg-slate-50">
              <Bell size={16} className="text-slate-600" />
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                3
              </span>
            </button>
            {/* Avatar */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-bold text-white">
              {session.namaLengkap.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b bg-[#0f1729] px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-white">MiniShop</span>
            <span className="rounded bg-blue-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-300">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-lg bg-white/10 p-1.5">
              <Bell size={16} className="text-white" />
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-red-500 text-[7px] font-bold text-white flex items-center justify-center">3</span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-bold text-white">
              {session.namaLengkap.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="shrink-0 lg:hidden">
        <AdminMobileNav />
      </div>
    </div>
  );
}
