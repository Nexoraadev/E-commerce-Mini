import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const categoryRepository = {
  findMany() {
    return prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } });
  },
  findById(id: string) {
    return prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
  },
  findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },
  create(data: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data });
  },
  update(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  },
  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
  count() {
    return prisma.category.count();
  },
};
