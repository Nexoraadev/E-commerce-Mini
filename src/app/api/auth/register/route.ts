import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { authService } from "@/services/auth.service";
import { setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await authService.register(body);
    await setAuthCookie(user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Register gagal" }, { status: 400 });
  }
}
