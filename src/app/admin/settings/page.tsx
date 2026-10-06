"use client";

import { useState } from "react";
import {
  Store, Globe, Mail, Phone, MapPin, Shield, Bell,
  CreditCard, Palette, Save, Check, Loader2, ChevronRight,
  Package, Truck, AlertTriangle, Eye, EyeOff,
} from "lucide-react";

const TABS = [
  { key: "general", label: "General", icon: Store },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "security", label: "Security", icon: Shield },
];

function SettingRow({
  label, desc, children,
}: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 py-5 md:grid-cols-[1fr_2fr]">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {desc && <p className="mt-0.5 text-xs text-slate-500">{desc}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <div
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-[#1e3a8a]" : "bg-slate-200"}`}
      >
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // General
  const [store, setStore] = useState({
    name: "MiniShop",
    email: "admin@minicommerce.test",
    phone: "+62 812-3456-7890",
    address: "Jl. Sudirman No. 45, Jakarta Selatan",
    website: "https://minishop.id",
    currency: "IDR",
    timezone: "Asia/Jakarta",
    language: "Bahasa Indonesia",
  });

  // Notifications
  const [notifs, setNotifs] = useState({
    newOrder: true,
    lowStock: true,
    newCustomer: false,
    paymentFailed: true,
    orderCompleted: false,
    emailDigest: true,
  });

  // Shipping
  const [shipping, setShipping] = useState({
    freeThreshold: 500000,
    standardFee: 25000,
    expressFee: 50000,
    codEnabled: true,
    estimatedDays: "2-4",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin / Settings</p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Manage your store configuration, integrations, and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af] disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <Check size={15} /> : <Save size={15} />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-100">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === key
                ? "bg-[#1e3a8a] text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ── */}
      {activeTab === "general" && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-extrabold text-slate-800">Store Information</h2>
            <p className="text-xs text-slate-500">Basic details about your store that appear publicly.</p>
          </div>
          <div className="divide-y divide-slate-50 px-6">
            <SettingRow label="Store Name" desc="Appears in emails and storefront header">
              <input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100" />
            </SettingRow>
            <SettingRow label="Contact Email" desc="Used for order notifications and customer support">
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={store.email} onChange={(e) => setStore({ ...store, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </div>
            </SettingRow>
            <SettingRow label="Phone Number">
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </div>
            </SettingRow>
            <SettingRow label="Store Address">
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-3 text-slate-400" />
                <textarea value={store.address} onChange={(e) => setStore({ ...store, address: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </div>
            </SettingRow>
            <SettingRow label="Website URL">
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={store.website} onChange={(e) => setStore({ ...store, website: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100" />
              </div>
            </SettingRow>
          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <h3 className="mb-4 text-sm font-extrabold text-slate-800">Regional Settings</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Currency", key: "currency", options: ["IDR", "USD", "SGD"] },
                { label: "Timezone", key: "timezone", options: ["Asia/Jakarta", "Asia/Singapore", "UTC"] },
                { label: "Language", key: "language", options: ["Bahasa Indonesia", "English"] },
              ].map(({ label, key, options }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
                  <select
                    value={store[key as keyof typeof store]}
                    onChange={(e) => setStore({ ...store, [key]: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                  >
                    {options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {activeTab === "notifications" && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-extrabold text-slate-800">Email Notifications</h2>
            <p className="text-xs text-slate-500">Choose which events trigger email alerts to your admin inbox.</p>
          </div>
          <div className="divide-y divide-slate-50 px-6">
            {[
              { key: "newOrder", label: "New Order Received", desc: "Alert when a customer places a new order" },
              { key: "lowStock", label: "Low Stock Alert", desc: "Alert when product stock drops below 8 units" },
              { key: "newCustomer", label: "New Customer Registered", desc: "Alert when a new account is created" },
              { key: "paymentFailed", label: "Payment Failed", desc: "Alert when a payment fails or is rejected" },
              { key: "orderCompleted", label: "Order Completed", desc: "Alert when an order status is set to Completed" },
              { key: "emailDigest", label: "Daily Email Digest", desc: "Summary of store activity sent every morning" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <Toggle
                  checked={notifs[key as keyof typeof notifs]}
                  onChange={(v) => setNotifs({ ...notifs, [key]: v })}
                  label=""
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PAYMENTS TAB ── */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-extrabold text-slate-800">Payment Methods</h2>
              <p className="text-xs text-slate-500">Configure which payment methods are available at checkout.</p>
            </div>
            <div className="divide-y divide-slate-50 px-6">
              {[
                { label: "Virtual Account (BCA, Mandiri, BNI, BRI)", desc: "Instant automated verification via BI-FAST", enabled: true, badge: "Recommended" },
                { label: "Bank Transfer (Manual)", desc: "Manual receipt upload, verified within 15 minutes", enabled: true, badge: "" },
                { label: "Cash on Delivery (COD)", desc: "Pay in cash directly to the courier upon arrival", enabled: true, badge: "" },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">{m.label}</p>
                      {m.badge && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">{m.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                  </div>
                  <Toggle checked={m.enabled} onChange={() => {}} label="" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold text-amber-800">Simulated Payment Environment</p>
                <p className="text-xs text-amber-700 mt-0.5">This is a demo store. No actual card data or funds are processed. All transactions are simulated.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SHIPPING TAB ── */}
      {activeTab === "shipping" && (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-extrabold text-slate-800">Shipping Configuration</h2>
            <p className="text-xs text-slate-500">Set delivery rates, thresholds, and courier preferences.</p>
          </div>
          <div className="divide-y divide-slate-50 px-6">
            <SettingRow label="Free Shipping Threshold" desc="Orders above this amount qualify for free shipping (Rp)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                <input
                  type="number" value={shipping.freeThreshold}
                  onChange={(e) => setShipping({ ...shipping, freeThreshold: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </SettingRow>
            <SettingRow label="Standard Delivery Fee" desc="Default shipping cost when threshold not met">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                <input
                  type="number" value={shipping.standardFee}
                  onChange={(e) => setShipping({ ...shipping, standardFee: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </SettingRow>
            <SettingRow label="Express Delivery Fee">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                <input
                  type="number" value={shipping.expressFee}
                  onChange={(e) => setShipping({ ...shipping, expressFee: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </SettingRow>
            <SettingRow label="Estimated Delivery Days" desc="Shown to customers at checkout">
              <input
                value={shipping.estimatedDays}
                onChange={(e) => setShipping({ ...shipping, estimatedDays: e.target.value })}
                placeholder="e.g. 2-4"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100"
              />
            </SettingRow>
            <div className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Cash on Delivery (COD)</p>
                <p className="text-xs text-slate-500">Allow customers to pay upon delivery</p>
              </div>
              <Toggle checked={shipping.codEnabled} onChange={(v) => setShipping({ ...shipping, codEnabled: v })} label="" />
            </div>
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {activeTab === "security" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-extrabold text-slate-800">Security Settings</h2>
              <p className="text-xs text-slate-500">Manage authentication, session, and API security configuration.</p>
            </div>
            <div className="divide-y divide-slate-50 px-6">
              <SettingRow label="API Key" desc="Used for external integrations. Keep this secret.">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? "text" : "password"}
                      readOnly
                      value="sk_live_minicommerce_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-xs outline-none"
                    />
                  </div>
                  <button onClick={() => setShowApiKey(!showApiKey)}
                    className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50">
                    {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button className="rounded-xl bg-[#1e3a8a] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#1e40af]">
                    Regenerate
                  </button>
                </div>
              </SettingRow>

              <SettingRow label="Session Duration" desc="How long admin sessions remain active">
                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-blue-100">
                  <option>7 days (Current)</option>
                  <option>24 hours</option>
                  <option>30 days</option>
                </select>
              </SettingRow>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Require 2FA for all admin logins</p>
                </div>
                <button disabled className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-400">
                  Coming Soon
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Login Activity Log</p>
                  <p className="text-xs text-slate-500">Track all admin login attempts</p>
                </div>
                <Toggle checked={true} onChange={() => {}} label="" />
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-100 bg-white shadow-sm">
            <div className="border-b border-red-100 px-6 py-4">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-red-600">
                <AlertTriangle size={14} /> Danger Zone
              </h2>
            </div>
            <div className="divide-y divide-red-50 px-6">
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Clear All Cache</p>
                  <p className="text-xs text-slate-500">Flush application cache and rebuild data indexes</p>
                </div>
                <button className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  Clear Cache
                </button>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-bold text-red-600">Reset Store Data</p>
                  <p className="text-xs text-slate-500">Delete all orders, products, and customer data (irreversible)</p>
                </div>
                <button className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700">
                  Reset Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
