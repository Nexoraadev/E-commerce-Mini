import { NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { getAuthSession } from "@/lib/auth";
import { orderRepository } from "@/repositories/order.repository";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const order = await orderRepository.findById(id);
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });

    if (session.role !== "ADMIN" && order.userId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const cancelled = await orderService.cancelOrder(id);
    return NextResponse.json({ order: cancelled, message: "Order berhasil dibatalkan" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal membatalkan order" },
      { status: 400 }
    );
  }
}
