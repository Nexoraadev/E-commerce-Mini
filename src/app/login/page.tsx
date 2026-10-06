"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ShieldCheck, ShoppingCart, LayoutDashboard } from "lucide-react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";

type LoginForm = { identifier: string; password: string };

const DEMO_ACCOUNTS = [
  {
    label: "Customer Demo",
    tag: "Storefront",
    tagColor: "bg-emerald-600",
    email: "customer@minicommerce.test",
    password: "password",
    icon: ShoppingCart,
  },
  {
    label: "Admin Demo",
    tag: "Dashboard",
    tagColor: "bg-blue-600",
    email: "admin@minicommerce.test",
    password: "password",
    icon: LayoutDashboard,
  },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/";

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error ?? "Login gagal"); return; }
      router.push(result.user?.role === "ADMIN" ? "/admin" : nextUrl);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi.");
    }
  };

  const handleGoogleLogin = async () => {
    if (!hasSupabaseConfig || !supabase) { setError("Login Google belum dikonfigurasi."); return; }
    setGoogleLoading(true);
    setError("");
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${nextUrl}` },
      });
      if (e) setError(e.message);
    } catch { setError("Login Google gagal."); }
    finally { setGoogleLoading(false); }
  };

  const fillDemo = (email: string, password: string) => {
    setValue("identifier", email);
    setValue("password", password);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Email address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register("identifier", { required: "Wajib diisi" })}
              autoComplete="username"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Enter your email"
            />
          </div>
          {errors.identifier && <p className="mt-1 text-xs text-red-500">{errors.identifier.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              {...register("password", { required: "Wajib diisi" })}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded accent-[#1e3a8a]" />
            Remember me
          </label>
          <button type="button" className="text-sm font-semibold text-[#1e3a8a] hover:underline">
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
        )}

        {/* Submit */}
        <button type="submit" disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-3.5 text-sm font-bold text-white transition hover:bg-[#1e40af] disabled:opacity-60 active:scale-95">
          {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <>Sign In <ArrowRight size={17} /></>}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs font-medium text-slate-400">OR CONTINUE WITH</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Google */}
        <button type="button" onClick={handleGoogleLogin} disabled={googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 active:scale-95">
          {googleLoading ? <Loader2 size={17} className="animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>
      </form>

      {/* Create account */}
      <p className="mt-5 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link href="/register" className="font-bold text-[#1e3a8a] hover:underline">Create an account</Link>
      </p>

      {/* Quick Demo Sign In */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
          <span>⚡</span> Quick Demo Sign In
        </div>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button key={acc.email} onClick={() => fillDemo(acc.email, acc.password)}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-[#1e3a8a] hover:bg-blue-50">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <acc.icon size={15} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">{acc.label}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${acc.tagColor}`}>{acc.tag}</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{acc.email}</p>
              </div>
              <ArrowRight size={14} className="shrink-0 text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh bg-[#f0f2f8] px-4 py-10">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a] shadow">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <span className="text-xl font-extrabold text-[#1e3a8a]">MiniShop</span>
        </div>
      </div>

      {/* Card */}
      <div className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-md">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-500">Sign in to access your orders, saved cart, and account settings.</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">
            <ShieldCheck size={12} className="text-emerald-500" />
            SSL 256-bit
          </div>
        </div>

        <Suspense fallback={
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
          <ShieldCheck size={12} className="text-emerald-500" />
          Session secured with TLS 1.3 End-to-End
        </div>
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
          <button className="hover:text-slate-600">Privacy Policy</button>
          <span>•</span>
          <button className="hover:text-slate-600">Terms of Service</button>
          <span>•</span>
          <button className="hover:text-slate-600">Need Help?</button>
        </div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          🔒 256-bit encrypted authentication
        </p>
      </div>
    </div>
  );
}
