import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";

// GET /api/me — return current session user (no password)
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ user: null }, { status: 200 });
    return NextResponse.json({ user: session });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
