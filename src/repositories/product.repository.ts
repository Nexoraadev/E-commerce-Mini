import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const productRepository = {
  findMany(params?: { search?: string; category?: string; page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 12;
    const where: Prisma.ProductWhereInput = {
      AND: [
        params?.search
          ? {
              OR: [
                { namaProduk: { contains: params.search } },
                { kodeProduk: { contains: params.search } },
              ],
            }
          : {},
        params?.category ? { category: { slug: params.category } } : {},
      ],
    };
    return prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  },
  count(params?: { search?: string; category?: string }) {
    const where: Prisma.ProductWhereInput = {
      AND: [
        params?.search
          ? {
              OR: [
                { namaProduk: { contains: params.search } },
                { kodeProduk: { contains: params.search } },
              ],
            }
          : {},
        params?.category ? { category: { slug: params.category } } : {},
      ],
    };
    return prisma.product.count({ where });
  },
  findById(id: string) {
    return prisma.product.findUnique({ where: { id }, include: { category: true } });
  },
  findBySlug(slug: string) {
    return prisma.product.findUnique({ where: { slug }, include: { category: true } });
  },
  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  },
  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },
  countAll() {
    return prisma.product.count();
  },
};
