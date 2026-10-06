"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Home, User, ShoppingBag, Shield,
  MapPin, Bell, Edit3, LogOut, Trash2, Check,
  Lock, Smartphone, Plus, CheckCircle2, AlertCircle,
  TrendingUp, Package, RotateCcw, CreditCard,
  HelpCircle, ExternalLink, Camera, Loader2,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils/format";
import type { JwtPayload } from "@/lib/auth";

type OrderStats = {
  total: number;
  completed: number;
  inProgress: number;
  cancelled: number;
  totalSpent: number;
};

const TABS = [
  { key: "profile", label: "Profile", icon: User },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "security", label: "Security & 2FA", icon: Shield },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "notifications", label: "Notifications & Preferences", icon: Bell },
];

function Avatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const sizeClass = size === "lg" ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm";
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-2xl bg-[#1e3a8a] font-extrabold text-white ${sizeClass}`}>
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [stats, setStats] = useState<OrderStats>({ total: 0, completed: 0, inProgress: 0, cancelled: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Form state
  const [form, setForm] = useState({ namaLengkap: "", userName: "", email: "", phone: "", dob: "", gender: "Male", language: "Bahasa Indonesia" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) { router.push("/login?next=/profile"); return; }
        setUser(d.user);
        setForm((f) => ({ ...f, namaLengkap: d.user.namaLengkap, userName: d.user.userName, email: d.user.email }));
      });

    // load order stats
    fetch("/api/orders/my")
      .then((r) => r.json())
      .then((d) => {
        const orders = d.orders ?? [];
        const completed = orders.filter((o: { orderStatus: string }) => o.orderStatus === "COMPLETED").length;
        const inProgress = orders.filter((o: { orderStatus: string }) => o.orderStatus === "PROCESSING" || o.orderStatus === "PENDING").length;
        const cancelled = orders.filter((o: { orderStatus: string }) => o.orderStatus === "CANCELLED").length;
        const totalSpent = orders
          .filter((o: { orderStatus: string }) => o.orderStatus === "COMPLETED")
          .reduce((s: number, o: { totalAmount: number }) => s + Number(o.totalAmount), 0);
        setStats({ total: orders.length, completed, inProgress, cancelled, totalSpent });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleSave = () => {
    setSavedMsg(true);
    setEditMode(false);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f8f9fc]">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;

  const memberSince = "September 2026";

  return (
    <div className="min-h-dvh bg-[#f8f9fc] pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/" className="flex items-center gap-1 hover:text-[#1e3a8a]"><Home size={11} /> Home</Link>
          <ChevronRight size={11} />
          <span className="text-slate-500">Account</span>
          <ChevronRight size={11} />
          <span className="font-medium text-slate-700">Settings</span>
        </nav>

        {/* Profile header card */}
        <div className="mb-5 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar with camera overlay */}
              <div className="relative">
                <Avatar name={user.namaLengkap} size="lg" />
                <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-200 hover:bg-slate-50">
                  <Camera size={11} className="text-slate-500" />
                </button>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-slate-900">{user.namaLengkap}</h1>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <CheckCircle2 size={10} /> Email Verified
                  </span>
                </div>
                <p className="text-sm text-slate-500">{user.email}</p>
                <p className="text-xs text-slate-400">Member since {memberSince} · Verified Customer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditMode(true); setActiveTab("profile"); }}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Edit3 size={13} /> Edit Profile
              </button>
              <button
                onClick={handleLogout}
                disabled={logoutLoading}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {logoutLoading ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                Sign Out
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-1 overflow-x-auto border-b border-slate-100 pb-0">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex shrink-0 items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === key
                    ? "border-[#1e3a8a] text-[#1e3a8a]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={13} />
                {label}
                {key === "orders" && stats.total > 0 && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold text-slate-500">
                    {stats.total}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-5 md:grid-cols-[1fr_320px]">
          {/* ── LEFT: Tab content ── */}
          <div className="space-y-5">

            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <>
                {savedMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    <Check size={16} /> Profile updated successfully!
                  </div>
                )}

                <div className="rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">Personal Information</h2>
                      <p className="text-xs text-slate-500">Manage the personal information associated with your account.</p>
                    </div>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Edit3 size={12} /> {editMode ? "Cancel" : "Toggle Edit"}
                    </button>
                  </div>

                  <div className="p-6">
                    {/* Profile photo */}
                    <div className="mb-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                      <Avatar name={user.namaLengkap} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Profile Photo</p>
                        <p className="text-[10px] text-slate-400">JPG, GIF or PNG. Maximum size 2 MB.</p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <button className="rounded-lg bg-[#1e3a8a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e40af]">
                          Change Photo
                        </button>
                        <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Form fields */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {[
                        { label: "Full Name", key: "namaLengkap", placeholder: "Your full name" },
                        { label: "Username", key: "userName", placeholder: "your_username" },
                      ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
                          <input
                            value={form[key as keyof typeof form]}
                            onChange={(e) => set(key, e.target.value)}
                            disabled={!editMode}
                            placeholder={placeholder}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition disabled:cursor-default disabled:opacity-75 focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      ))}

                      {/* Email with verified badge */}
                      <div className="sm:col-span-2">
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-600">Email Address</label>
                          <button className="text-[10px] font-semibold text-[#1e3a8a] hover:underline">Change</button>
                        </div>
                        <div className="relative">
                          <input
                            value={form.email}
                            disabled
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-28 text-sm text-slate-800 outline-none opacity-75"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <CheckCircle2 size={10} /> Verified
                          </span>
                        </div>
                      </div>

                      {[
                        { label: "Phone Number", key: "phone", placeholder: "+62 812-3456-7890" },
                        { label: "Date of Birth", key: "dob", placeholder: "01 January 2000" },
                        { label: "Gender", key: "gender", isSelect: true, options: ["Male", "Female", "Prefer not to say"] },
                        { label: "Language Preference", key: "language", isSelect: true, options: ["Bahasa Indonesia", "English"] },
                      ].map(({ label, key, placeholder, isSelect, options }) => (
                        <div key={key}>
                          <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
                          {isSelect ? (
                            <select
                              value={form[key as keyof typeof form]}
                              onChange={(e) => set(key, e.target.value)}
                              disabled={!editMode}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none disabled:cursor-default disabled:opacity-75 focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                            >
                              {options?.map((o) => <option key={o}>{o}</option>)}
                            </select>
                          ) : (
                            <input
                              value={form[key as keyof typeof form]}
                              onChange={(e) => set(key, e.target.value)}
                              disabled={!editMode}
                              placeholder={placeholder}
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition disabled:cursor-default disabled:opacity-75 focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {editMode && (
                      <div className="mt-5 flex gap-2">
                        <button onClick={handleSave} className="rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af]">
                          Save Changes
                        </button>
                        <button onClick={() => setEditMode(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security & Login section */}
                <div className="rounded-2xl bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-4">
                    <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <Shield size={15} className="text-[#1e3a8a]" /> Security & Login
                    </h2>
                    <p className="text-xs text-slate-500">Manage your password, login sessions, and authentication security.</p>
                  </div>
                  <div className="divide-y divide-slate-50 px-6">
                    {/* Password */}
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                          <Lock size={16} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Account Password</p>
                          <p className="text-xs text-slate-400">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                        Change Password
                      </button>
                    </div>
                    {/* 2FA */}
                    <div className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                          <Smartphone size={16} className="text-slate-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800">Two-Factor Authentication (2FA)</p>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">Not Enabled</span>
                          </div>
                          <p className="text-xs text-slate-400">Add an extra layer of security to your purchases and account data.</p>
                        </div>
                      </div>
                      <button disabled className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-400">
                        Set Up (Coming Soon)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Saved Addresses */}
                <div className="rounded-2xl bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                      <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                        <MapPin size={15} className="text-[#1e3a8a]" /> Saved Addresses
                      </h2>
                      <p className="text-xs text-slate-500">Manage default shipping and billing destinations for rapid checkout.</p>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-3 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
                      <Plus size={13} /> Add New Address
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="rounded-xl border border-[#1e3a8a]/20 bg-blue-50 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="mb-1 flex items-center gap-2">
                            <span className="rounded-md bg-[#1e3a8a] px-2 py-0.5 text-[10px] font-bold text-white">DEFAULT ADDRESS</span>
                            <span className="text-xs font-semibold text-slate-600">Home</span>
                          </div>
                          <p className="text-sm font-bold text-slate-900">{user.namaLengkap}</p>
                          <p className="mt-0.5 text-xs text-slate-500">Jl. Sudirman No. 45, Tower B, Lt. 18, Unit 1802, SCBD, Jakarta Selatan, DKI Jakarta 12190</p>
                        </div>
                        <div className="flex gap-1">
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600">
                            <Edit3 size={14} />
                          </button>
                          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-500">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Management */}
                <div className="rounded-2xl border border-red-100 bg-white shadow-sm">
                  <div className="border-b border-red-100 px-6 py-4">
                    <h2 className="flex items-center gap-2 text-sm font-extrabold text-red-600">
                      <AlertCircle size={15} /> Account Management
                    </h2>
                    <p className="text-xs text-slate-500">Control active sessions or permanently retire this customer profile.</p>
                  </div>
                  <div className="divide-y divide-slate-50 px-6">
                    {/* Sign out */}
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Sign Out from Device</p>
                        <p className="text-xs text-slate-400">Sign out of your current session on this browser.</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        {logoutLoading ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
                        Sign Out
                      </button>
                    </div>
                    {/* Delete account */}
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-bold text-red-600">Delete Account</p>
                        <p className="text-xs text-slate-400">Permanently remove your account, personal data, and order history.</p>
                      </div>
                      {showDeleteConfirm ? (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-red-500 font-semibold">Are you sure?</p>
                          <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="rounded-xl border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
                            Confirm Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                        >
                          <Trash2 size={13} /> Delete Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── ORDERS TAB ── */}
            {activeTab === "orders" && (
              <div className="rounded-2xl bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h2 className="text-sm font-extrabold text-slate-900">Order History</h2>
                  <Link href="/orders" className="flex items-center gap-1 text-xs font-bold text-[#1e3a8a] hover:underline">
                    View all orders <ExternalLink size={12} />
                  </Link>
                </div>
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <Package size={40} className="text-slate-300" />
                  <p className="text-sm text-slate-500">View your full order history on the Orders page.</p>
                  <Link href="/orders" className="rounded-xl bg-[#1e3a8a] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af]">
                    Go to My Orders
                  </Link>
                </div>
              </div>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div className="rounded-2xl bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-4">
                  <h2 className="text-sm font-extrabold text-slate-900">Security & 2FA</h2>
                  <p className="text-xs text-slate-500">Manage your security settings and authentication methods.</p>
                </div>
                <div className="divide-y divide-slate-50 px-6">
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Lock size={16} className="text-slate-500" /></div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Account Password</p>
                        <p className="text-xs text-slate-400">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Change Password</button>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"><Smartphone size={16} className="text-slate-500" /></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800">2-Step Verification</p>
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">Not Enabled</span>
                        </div>
                        <p className="text-xs text-slate-400">Extra layer of protection</p>
                      </div>
                    </div>
                    <button disabled className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-400">Coming Soon</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── ADDRESSES TAB ── */}
            {activeTab === "addresses" && (
              <div className="rounded-2xl bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h2 className="text-sm font-extrabold text-slate-900">Saved Addresses</h2>
                  <button className="flex items-center gap-1.5 rounded-xl bg-[#1e3a8a] px-3 py-2 text-xs font-bold text-white hover:bg-[#1e40af]">
                    <Plus size={13} /> Add New Address
                  </button>
                </div>
                <div className="p-6">
                  <div className="rounded-xl border-2 border-[#1e3a8a] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-md bg-[#1e3a8a] px-2 py-0.5 text-[10px] font-bold text-white">DEFAULT</span>
                          <span className="text-xs font-semibold text-slate-600">Primary Residence</span>
                        </div>
                        <p className="text-sm font-bold">{user.namaLengkap}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Jl. Sudirman No. 45, Tower B, Jakarta Selatan, DKI Jakarta, 12190</p>
                      </div>
                      <div className="flex gap-1">
                        <button className="rounded-lg border p-2 text-slate-500 hover:bg-slate-50"><Edit3 size={14} /></button>
                        <button className="rounded-lg border p-2 text-red-400 hover:bg-red-50"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === "notifications" && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-extrabold text-slate-900">Notification Preferences</h2>
                <div className="space-y-3">
                  {[
                    { label: "Order Updates", desc: "Shipping, delivery, and status changes", enabled: true },
                    { label: "Promotions & Offers", desc: "Deals, discounts, and new arrivals", enabled: false },
                    { label: "Security Alerts", desc: "Login attempts and account changes", enabled: true },
                    { label: "Newsletter", desc: "Weekly product highlights and tips", enabled: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-500">{item.desc}</p>
                      </div>
                      <div className={`h-5 w-9 cursor-pointer rounded-full transition-colors ${item.enabled ? "bg-[#1e3a8a]" : "bg-slate-200"}`}>
                        <div className={`mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${item.enabled ? "ml-4" : "ml-0.5"}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Sidebar ── */}
          <div className="space-y-4">
            {/* Account Overview */}
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-extrabold text-slate-800">Account Overview</h2>
                <CreditCard size={15} className="text-slate-400" />
              </div>
              <div className="p-5">
                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: "Total Orders", value: stats.total, color: "text-[#1e3a8a]", bg: "bg-blue-50" },
                    { label: "Completed", value: stats.completed, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "In Progress", value: stats.inProgress, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Returned / Other", value: stats.cancelled, color: "text-red-500", bg: "bg-red-50" },
                  ].map(({ label, value, color, bg }) => (
                    <div key={label} className={`rounded-xl ${bg} p-3`}>
                      <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
                      <p className="text-[10px] font-semibold text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Total spent */}
                <div className="rounded-xl bg-gradient-to-br from-[#1e3a8a] to-blue-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold opacity-80">TOTAL SPENT</p>
                    <TrendingUp size={16} className="opacity-60" />
                  </div>
                  <p className="mt-1 text-xl font-extrabold">{formatRupiah(stats.totalSpent)}</p>
                  <p className="mt-0.5 text-[10px] opacity-70">Lifetime purchase value</p>
                  {/* Mini chart */}
                  <div className="mt-3 flex items-end gap-0.5 h-6">
                    {[2, 4, 3, 6, 5, 8, 7].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-white/30" style={{ height: `${h * 8}%` }} />
                    ))}
                  </div>
                </div>

                <Link
                  href="/orders"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-[#1e3a8a] hover:bg-slate-50"
                >
                  View full order history <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            {/* Help & Support */}
            <div className="rounded-2xl bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
                  <HelpCircle size={15} className="text-[#1e3a8a]" /> Help & Support
                </h2>
                <p className="text-xs text-slate-500">Need assistance with an active delivery, billing clarification, or return authorization?</p>
              </div>
              <div className="divide-y divide-slate-50 px-5">
                {[
                  { label: "Frequently Asked Questions", icon: HelpCircle },
                  { label: "Warranty Inquiries", icon: Shield },
                  { label: "24/7 Live Care Chat", icon: Smartphone },
                ].map(({ label, icon: Icon }) => (
                  <button key={label} className="flex w-full items-center justify-between py-3 text-xs font-semibold text-slate-700 hover:text-[#1e3a8a]">
                    <div className="flex items-center gap-2">
                      <Icon size={13} className="text-slate-400" />
                      {label}
                    </div>
                    <ExternalLink size={11} className="text-slate-400" />
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 px-5 py-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Customer Code:</span>
                  <span className="font-mono font-bold text-slate-700">MC-{user.id.slice(0, 5).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-white px-4 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-xs text-slate-400">© 2025 MiniShop, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button className="hover:text-slate-600">Privacy Policy</button>
            <button className="hover:text-slate-600">Terms</button>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white md:hidden">
        {[
          { href: "/", icon: "🏠", label: "Home" },
          { href: "/", icon: "📦", label: "Products" },
          { href: "/cart", icon: "🛒", label: "Cart" },
          { href: "/orders", icon: "📋", label: "Orders" },
          { href: "/profile", icon: "👤", label: "Account" },
        ].map(({ href, icon, label }) => (
          <Link key={label} href={href} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold ${href === "/profile" ? "text-[#1e3a8a]" : "text-slate-500 hover:text-[#1e3a8a]"}`}>
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
