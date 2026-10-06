import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "minicommerce_super_secret_jwt_key_2026");

async function getPayload(request: NextRequest) {
  const token = request.cookies.get("minicommerce_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedCustomer = pathname.startsWith("/checkout") || pathname.startsWith("/orders");
  const protectedAdmin = pathname.startsWith("/admin");
  if (!protectedCustomer && !protectedAdmin) return NextResponse.next();

  const payload = await getPayload(request);
  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (protectedAdmin && payload.role !== "ADMIN") return NextResponse.redirect(new URL("/", request.url));
  if (protectedCustomer && payload.role !== "CUSTOMER") return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/orders/:path*"],
};
