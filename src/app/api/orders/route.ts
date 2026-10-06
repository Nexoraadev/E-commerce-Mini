import { NextResponse } from "next/server";
import { orderRepository } from "@/repositories/order.repository";
import { getAuthSession } from "@/lib/auth";

// GET /api/orders  (Admin only — semua order)
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orders = await orderRepository.findMany();
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data order" }, { status: 500 });
  }
}
