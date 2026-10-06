"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, AtSign, Lock, Shield, LogOut,
  Save, Check, Loader2, Eye, EyeOff, AlertCircle,
  Camera, Smartphone, Clock, ChevronRight,
} from "lucide-react";
import type { JwtPayload } from "@/lib/auth";

function Field({
  label, icon: Icon, value, onChange, type = "text", disabled = false, hint,
}: {
  label: string; icon?: React.ElementType; value: string;
  onChange?: (v: string) => void; type?: string;
  disabled?: boolean; hint?: string;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type={isPassword ? (show ? "text" : "password") : type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={`w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm outline-none transition disabled:cursor-default disabled:opacity-70 focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100 ${Icon ? "pl-9 pr-4" : "px-4"} ${isPassword ? "pr-10" : ""}`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [form, setForm] = useState({ namaLengkap: "", userName: "", email: "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => {
      if (!d.user) { router.push("/login"); return; }
      setUser(d.user);
      setForm({ namaLengkap: d.user.namaLengkap, userName: d.user.userName, email: d.user.email });
    }).finally(() => setLoading(false));
  }, [router]);

  const handleSave = async () => {
    setError(""); setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 size={22} className="animate-spin text-slate-400" /></div>
  );
  if (!user) return null;

  const initials = user.namaLengkap.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Admin / Profile</p>
        <h1 className="mt-0.5 text-2xl font-extrabold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your admin account information and security settings.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <Check size={15} /> Profile updated successfully!
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-extrabold text-slate-800">Account Information</h2>
          <p className="text-xs text-slate-500">Update your display name and contact details.</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e3a8a] text-xl font-extrabold text-white shadow-md">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-slate-100 hover:bg-slate-50">
                <Camera size={11} className="text-slate-500" />
              </button>
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900">{user.namaLengkap}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#1e3a8a]">
                  ADMIN
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Session
                </span>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full Name" icon={User} value={form.namaLengkap} onChange={(v) => set("namaLengkap", v)} />
            <Field label="Username" icon={AtSign} value={form.userName} onChange={(v) => set("userName", v)}
              hint="Public handle — only letters, numbers, underscores" />
          </div>
          <Field label="Email Address" icon={Mail} value={form.email} disabled
            hint="Contact support to change your email address" />

          <div className="flex justify-end pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af] disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
            <Lock size={14} className="text-[#1e3a8a]" /> Change Password
          </h2>
          <p className="text-xs text-slate-500">Choose a strong password with at least 8 characters.</p>
        </div>
        <div className="space-y-4 p-6">
          <Field label="Current Password" type="password" value={passwords.current}
            onChange={(v) => setPasswords({ ...passwords, current: v })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New Password" type="password" value={passwords.newPass}
              onChange={(v) => setPasswords({ ...passwords, newPass: v })}
              hint="Min. 8 characters" />
            <Field label="Confirm New Password" type="password" value={passwords.confirm}
              onChange={(v) => setPasswords({ ...passwords, confirm: v })} />
          </div>
          {passwords.confirm && passwords.confirm !== passwords.newPass && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
          {passwords.confirm && passwords.confirm === passwords.newPass && passwords.confirm.length > 0 && (
            <p className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Check size={12} /> Passwords match
            </p>
          )}
          <div className="flex justify-end">
            <button
              disabled={!passwords.current || !passwords.newPass || passwords.newPass !== passwords.confirm}
              className="rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#1e40af] disabled:opacity-40"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Security info */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-slate-800">
            <Shield size={14} className="text-[#1e3a8a]" /> Security
          </h2>
        </div>
        <div className="divide-y divide-slate-50 px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <Smartphone size={15} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Two-Factor Authentication</p>
                <p className="text-xs text-slate-400">Add an extra layer of security</p>
              </div>
            </div>
            <button disabled className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-400">
              Coming Soon
            </button>
          </div>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <Clock size={15} className="text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Session Management</p>
                <p className="text-xs text-slate-400">JWT session · Expires in 7 days</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
          </div>
        </div>
      </div>

      {/* Sign Out + Danger */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-extrabold text-slate-800">Account Actions</h2>
        </div>
        <div className="divide-y divide-slate-50 px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-bold text-slate-800">Sign Out</p>
              <p className="text-xs text-slate-400">End your current admin session</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {logoutLoading ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
