import { NextResponse } from "next/server";
import { orderRepository } from "@/repositories/order.repository";
import { getAuthSession } from "@/lib/auth";
import type { OrderStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

// GET /api/orders/:id
// Admin: akses semua order. Customer: hanya order miliknya.
export async function GET(_req: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const order = await orderRepository.findById(id);
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });

    // Customer hanya boleh lihat order miliknya
    if (session.role !== "ADMIN" && order.userId !== session.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil order" }, { status: 500 });
  }
}

// PATCH /api/orders/:id  (Admin only — update status)
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { orderStatus } = body as { orderStatus: OrderStatus };

    const validStatuses: OrderStatus[] = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const order = await orderRepository.updateStatus(id, orderStatus);
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal update status" }, { status: 400 });
  }
}
