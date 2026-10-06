import { NextResponse } from "next/server";
import { orderRepository } from "@/repositories/order.repository";
import { getAuthSession } from "@/lib/auth";

// GET /api/orders/my  (Customer — order milik sendiri)
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orders = await orderRepository.findByUserId(session.id);
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil order" }, { status: 500 });
  }
}
