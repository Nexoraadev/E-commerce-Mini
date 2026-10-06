import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { orderService } from "@/services/order.service";
import { getAuthSession } from "@/lib/auth";

// POST /api/checkout  (Customer only)
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
    }
    if (session.role !== "CUSTOMER") {
      return NextResponse.json({ error: "Hanya customer yang dapat checkout" }, { status: 403 });
    }

    const body = await request.json();
    const order = await orderService.checkout(session.id, body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout gagal" }, { status: 400 });
  }
}
