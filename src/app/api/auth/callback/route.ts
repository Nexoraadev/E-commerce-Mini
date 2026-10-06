import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { userRepository } from "@/repositories/user.repository";
import { setAuthCookie } from "@/lib/auth";
import { Role } from "@prisma/client";

// GET /api/auth/callback — dipanggil Supabase setelah Google OAuth
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    console.error("[callback] No code in URL");
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/login?error=no_supabase_config`);
  }

  // Buat supabase client khusus untuk server (tanpa cookie)
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  // Exchange code → session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    console.error("[callback] Exchange error:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  const googleUser = data.user;
  const email = googleUser.email!;
  const namaLengkap =
    googleUser.user_metadata?.full_name ??
    googleUser.user_metadata?.name ??
    email.split("@")[0];

  // Cari atau buat user di Prisma DB
  let appUser = await userRepository.findByEmail(email);

  if (!appUser) {
    const baseUserName = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");
    const userName = `${baseUserName}_${Math.floor(Math.random() * 9000 + 1000)}`;
    appUser = await userRepository.create({
      email,
      userName,
      namaLengkap,
      password: `oauth_google_${googleUser.id}`,
      role: Role.CUSTOMER,
    });
  }

  // Set JWT session cookie
  await setAuthCookie({
    id: appUser.id,
    userName: appUser.userName,
    email: appUser.email,
    namaLengkap: appUser.namaLengkap,
    role: appUser.role,
  });

  const redirectTo = appUser.role === "ADMIN" ? "/admin" : next;
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
