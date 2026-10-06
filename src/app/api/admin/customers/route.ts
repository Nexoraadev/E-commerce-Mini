import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/customers — Admin only
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 20);

    const where = {
      role: "CUSTOMER" as const,
      ...(search ? {
        OR: [
          { namaLengkap: { contains: search } },
          { userName: { contains: search } },
          { email: { contains: search } },
        ],
      } : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              createdAt: true,
              orderStatus: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Enrich with stats
    const enriched = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.orderStatus === "COMPLETED")
        .reduce((s, o) => s + Number(o.totalAmount), 0);
      const lastOrder = c.orders[0] ?? null;
      return {
        id: c.id,
        namaLengkap: c.namaLengkap,
        userName: c.userName,
        email: c.email,
        createdAt: c.createdAt,
        orderCount: c.orders.length,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt ?? null,
        lastOrderStatus: lastOrder?.orderStatus ?? null,
      };
    });

    return NextResponse.json({ customers: enriched, total });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
