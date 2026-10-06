import Link from "next/link";
import {
  Package, Tag, ShoppingBag, Users, TrendingUp, ArrowRight,
  Plus, AlertTriangle, ChevronRight, BarChart3,
} from "lucide-react";
import { productRepository } from "@/repositories/product.repository";
import { categoryRepository } from "@/repositories/category.repository";
import { orderRepository } from "@/repositories/order.repository";
import { userRepository } from "@/repositories/user.repository";
import { formatRupiah, formatDate, orderStatusLabel, orderStatusColor, paymentStatusLabel } from "@/lib/utils/format";
import { getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  const session = await getAuthSession();
  const firstName = session?.namaLengkap?.split(" ")[0] ?? "Admin";

  const [totalProducts, totalCategories, totalOrders, totalCustomers, recentOrders, allOrders] =
    await Promise.all([
      productRepository.countAll(),
      categoryRepository.count(),
      orderRepository.count(),
      userRepository.countCustomers(),
      orderRepository.recent(5),
      orderRepository.findMany(),
    ]);

  const revenue = allOrders
    .filter((o) => o.orderStatus === "COMPLETED")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const activeCatalog = totalProducts;

  // Low stock products (stok <= 8)
  const { products: allProds } = await import("@/services/product.service").then((m) =>
    m.productService.list({ limit: 100 })
  );
  const lowStockProds = allProds.filter((p) => p.stok > 0 && p.stok <= 8).slice(0, 3);
  const outOfStock = allProds.filter((p) => p.stok === 0).length;

  // Top products by order frequency
  const productOrderCount: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const order of allOrders) {
    for (const item of order.orderItems) {
      const id = item.productId;
      if (!productOrderCount[id]) {
        productOrderCount[id] = { name: item.product.namaProduk, count: 0, revenue: 0 };
      }
      productOrderCount[id].count += item.quantity;
      productOrderCount[id].revenue += Number(item.subtotal);
    }
  }
  const topProducts = Object.entries(productOrderCount)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([, v]) => v);

  const STATS = [
    {
      label: "Total Orders", value: totalOrders, sub: "+12.5% vs last month",
      icon: ShoppingBag, color: "text-[#1e3a8a]", bg: "bg-blue-50", href: "/admin/orders",
    },
    {
      label: "Revenue", value: formatRupiah(revenue), sub: "+8.2% vs last month",
      icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/orders",
    },
    {
      label: "Active Catalog", value: activeCatalog, sub: `${outOfStock} out of stock`,
      icon: Package, color: "text-violet-600", bg: "bg-violet-50", href: "/admin/products",
    },
    {
      label: "Customers", value: totalCustomers, sub: "+6.4% verified buyers",
      icon: Users, color: "text-amber-600", bg: "bg-amber-50", href: "#",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Store Overview · Q3 FY2026
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-slate-900 md:text-3xl">
            {getGreeting()}, {firstName}. ☀️
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Here's what's happening with your store today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/categories"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <Tag size={13} /> Add Category
          </Link>
          <Link href="/admin/orders"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            <ShoppingBag size={13} /> Manage Orders
          </Link>
          <Link href="/admin/products"
            className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
            <Plus size={13} /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-[#1e3a8a]/20">
            <div className="flex items-start justify-between">
              <div className={`rounded-xl p-2.5 ${bg}`}>
                <Icon size={18} className={color} />
              </div>
              <BarChart3 size={14} className="text-slate-300 group-hover:text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-[10px] text-emerald-600">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Revenue chart + Top Products */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* Revenue chart placeholder */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">Revenue Overview</h2>
              <p className="text-xs text-slate-500">Revenue performance over the last 30 days.</p>
            </div>
            <div className="flex gap-1.5">
              {["7 days", "30 days", "90 days"].map((t) => (
                <button key={t}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${t === "30 days" ? "bg-[#1e3a8a] text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Chart placeholder */}
          <div className="relative h-44 w-full">
            <svg viewBox="0 0 400 120" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,100 C30,90 60,70 90,60 C120,50 150,80 180,55 C210,30 240,40 270,25 C300,10 330,30 360,15 L400,10 L400,120 L0,120 Z"
                fill="url(#chartGrad)" />
              <path d="M0,100 C30,90 60,70 90,60 C120,50 150,80 180,55 C210,30 240,40 270,25 C300,10 330,30 360,15 L400,10"
                fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            {/* X axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-slate-400">
              {["Sep 1","Sep 7","Sep 14","Sep 21","Sep 30"].map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-[#1e3a8a]" />
              Net Sales Volume
            </div>
            <span className="text-xs text-slate-500">Average Ticket: {formatRupiah(revenue / Math.max(totalOrders, 1))}</span>
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-800">Top Products</h2>
            <Link href="/admin/products" className="text-[10px] font-semibold text-[#1e3a8a] hover:underline">
              View All
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No sales data yet</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-4 shrink-0 text-xs font-bold text-slate-400">{i + 1}</span>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <Package size={14} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">{p.name}</p>
                    <p className="text-[10px] text-slate-400">{p.count} sold</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-slate-700">{formatRupiah(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Target Realization</span>
              <span className="font-bold text-emerald-600">84% achieved</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[84%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        {/* Recent orders */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800">Recent Orders</h2>
              <p className="text-xs text-slate-500">Real-time incoming customer transactions</p>
            </div>
            <Link href="/admin/orders"
              className="flex items-center gap-1 text-xs font-bold text-[#1e3a8a] hover:underline">
              View All Orders ({totalOrders}) <ArrowRight size={12} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-400">No orders yet.</p>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden grid-cols-[2fr_2fr_1fr_1fr_1fr_80px] gap-3 border-b border-slate-50 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 md:grid">
                <span>Order ID</span><span>Customer</span>
                <span>Date</span><span>Total</span>
                <span>Payment</span><span>Status</span>
              </div>
              <div className="divide-y divide-slate-50">
                {recentOrders.map((order) => (
                  <div key={order.id}
                    className="grid grid-cols-2 gap-2 px-5 py-3.5 hover:bg-slate-50 md:grid-cols-[2fr_2fr_1fr_1fr_1fr_80px] md:items-center md:gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-[#1e3a8a]">#{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{order.user.namaLengkap}</p>
                      <p className="text-[10px] text-slate-400 truncate">{order.user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">{formatDate(order.createdAt).split(",")[0]}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{formatRupiah(Number(order.totalAmount))}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        order.paymentStatus === "PAID" ? "bg-emerald-100 text-emerald-700" :
                        order.paymentStatus === "FAILED" ? "bg-red-100 text-red-600" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {paymentStatusLabel(order.paymentStatus)}
                      </span>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${orderStatusColor(order.orderStatus)}`}>
                        {orderStatusLabel(order.orderStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Low stock alert */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
              Low Stock Alert
              {lowStockProds.length > 0 && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                  {lowStockProds.length} items
                </span>
              )}
            </h2>
            <AlertTriangle size={14} className="text-amber-500" />
          </div>

          {lowStockProds.length === 0 ? (
            <p className="p-6 text-center text-xs text-slate-400">All products well stocked ✓</p>
          ) : (
            <div className="divide-y divide-slate-50 px-5">
              {lowStockProds.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                      <Package size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.namaProduk}</p>
                      <p className="text-[10px] text-slate-400">{p.category.name}</p>
                      <span className={`text-[10px] font-bold ${p.stok <= 4 ? "text-red-500" : "text-amber-600"}`}>
                        ● {p.stok} left in stock
                      </span>
                    </div>
                  </div>
                  <Link href="/admin/products"
                    className="shrink-0 rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#1e40af]">
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 px-5 py-3">
            <Link href="/admin/products"
              className="flex items-center justify-center gap-1 text-xs font-bold text-[#1e3a8a] hover:underline">
              Manage Inventory <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
