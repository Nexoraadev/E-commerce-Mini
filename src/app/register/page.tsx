"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Eye, EyeOff, Mail, Lock, User, AtSign, ArrowRight,
  Loader2, ShieldCheck, Check, ShoppingCart,
} from "lucide-react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";

type RegisterForm = {
  namaLengkap: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

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

function StrengthBar({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", ok: password.length >= 8 },
    { label: "Lowercase (a-z)", ok: /[a-z]/.test(password) },
    { label: "Uppercase (A-Z)", ok: /[A-Z]/.test(password) },
    { label: "Number (0-9)", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const levels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-slate-200"}`} />
          ))}
        </div>
        <span className={`text-xs font-semibold ${score >= 3 ? "text-emerald-600" : score >= 2 ? "text-amber-600" : "text-red-500"}`}>
          {levels[score]}
        </span>
      </div>
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map((c) => (
          <div key={c.label} className={`flex items-center gap-1.5 text-xs ${c.ok ? "text-emerald-600" : "text-slate-400"}`}>
            <Check size={11} className={c.ok ? "opacity-100" : "opacity-30"} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    defaultValues: { agreeTerms: false },
  });

  const watchedPassword = watch("password", "");
  const watchedConfirm = watch("confirmPassword", "");

  useEffect(() => { setPasswordValue(watchedPassword); }, [watchedPassword]);
  useEffect(() => { setConfirmValue(watchedConfirm); }, [watchedConfirm]);

  const passwordsMatch = confirmValue.length > 0 && confirmValue === passwordValue;

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error ?? "Registrasi gagal"); return; }
      router.push("/");
      router.refresh();
    } catch { setError("Terjadi kesalahan koneksi."); }
  };

  const handleGoogleRegister = async () => {
    if (!hasSupabaseConfig || !supabase) { setError("Login Google belum dikonfigurasi."); return; }
    setGoogleLoading(true); setError("");
    try {
      const { error: e } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback?next=/` },
      });
      if (e) setError(e.message);
    } catch { setError("Daftar dengan Google gagal."); }
    finally { setGoogleLoading(false); }
  };

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
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">Join MiniShop to enjoy fast checkout, track orders, and save favorites.</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">
            <ShieldCheck size={12} className="text-emerald-500" />
            SSL 256-bit
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("namaLengkap", { required: "Wajib diisi", minLength: { value: 2, message: "Min 2 karakter" } })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Your full name"
              />
            </div>
            {errors.namaLengkap && <p className="mt-1 text-xs text-red-500">{errors.namaLengkap.message}</p>}
          </div>

          {/* Username */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Username <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-slate-400">3–30 characters</span>
            </div>
            <div className="relative">
              <AtSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("userName", {
                  required: "Wajib diisi",
                  minLength: { value: 3, message: "Min 3 karakter" },
                  maxLength: { value: 30, message: "Maks 30 karakter" },
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Hanya huruf, angka, underscore" },
                })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="your_username"
              />
            </div>
            {errors.userName
              ? <p className="mt-1 text-xs text-red-500">{errors.userName.message}</p>
              : <p className="mt-1 text-xs text-slate-400">Use 3–30 characters (letters, numbers, underscores).</p>
            }
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("email", {
                  required: "Wajib diisi",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Format email tidak valid" },
                })}
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("password", { required: "Wajib diisi", minLength: { value: 6, message: "Min 6 karakter" } })}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Create a password"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            <StrengthBar password={passwordValue} />
          </div>

          {/* Confirm Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              {passwordsMatch && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Check size={12} /> Passwords match
                </span>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                {...register("confirmPassword", {
                  required: "Wajib diisi",
                  validate: (v) => v === watch("password") || "Password tidak cocok",
                })}
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-blue-100"
                placeholder="Repeat your password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          {/* Agree Terms */}
          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              {...register("agreeTerms", { required: "Kamu harus menyetujui syarat & ketentuan" })}
              className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#1e3a8a]"
            />
            <span>
              I agree to the{" "}
              <span className="font-semibold text-[#1e3a8a] hover:underline cursor-pointer">Terms of Service</span>
              {" "}&amp;{" "}
              <span className="font-semibold text-[#1e3a8a] hover:underline cursor-pointer">Privacy Policy</span>
            </span>
          </label>
          {errors.agreeTerms && <p className="text-xs text-red-500">{errors.agreeTerms.message}</p>}

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
          )}

          {/* Submit */}
          <button type="submit" disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a8a] py-3.5 text-sm font-bold text-white transition hover:bg-[#1e40af] disabled:opacity-60 active:scale-95">
            {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <>Create Account <ArrowRight size={17} /></>}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs font-medium text-slate-400">OR CONTINUE WITH</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogleRegister} disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 active:scale-95">
            {googleLoading ? <Loader2 size={17} className="animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[#1e3a8a] hover:underline">Sign in</Link>
        </p>

        {/* Security info */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <ShieldCheck size={14} className="text-emerald-500" />
              Secure Account Creation
            </div>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">role = CUSTOMER</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">•</span>
              Password encrypted with <span className="font-semibold text-slate-700">bcrypt</span> (10 rounds)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">•</span>
              Session via <span className="font-semibold text-slate-700">HTTP-only JWT cookie</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-500">•</span>
              Unique email & username validated via <span className="font-semibold text-slate-700">Zod + Prisma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center space-y-2">
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
