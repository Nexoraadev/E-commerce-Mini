import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  findByUserName(userName: string) {
    return prisma.user.findUnique({ where: { userName } });
  },
  findByEmailOrUserName(identifier: string) {
    return prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { userName: identifier }] },
    });
  },
  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data });
  },
  countCustomers() {
    return prisma.user.count({ where: { role: "CUSTOMER" } });
  },
};
