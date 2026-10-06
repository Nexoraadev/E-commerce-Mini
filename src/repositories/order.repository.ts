import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@prisma/client";

export const orderRepository = {
  findMany() {
    return prisma.order.findMany({
      include: { user: true, orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { user: true, orderItems: { include: { product: true } } },
    });
  },
  findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
  create(data: Prisma.OrderCreateInput, tx: Prisma.TransactionClient = prisma) {
    return tx.order.create({ data, include: { orderItems: true } });
  },
  updateStatus(id: string, orderStatus: OrderStatus) {
    return prisma.order.update({ where: { id }, data: { orderStatus } });
  },
  count() {
    return prisma.order.count();
  },
  recent(limit = 5) {
    return prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },
};
