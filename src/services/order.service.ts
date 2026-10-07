import { OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";

function createOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
}

const VA_PREFIX: Record<string, string> = {
  BCA:     "8808",
  MANDIRI: "8810",
  BNI:     "8811",
  BRI:     "8812",
};

function generateVirtualAccount(bank: string): string {
  const prefix = VA_PREFIX[bank.toUpperCase()] ?? "8800";
  const suffix1 = Date.now().toString().slice(-6);
  const suffix2 = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
  return `${prefix}${suffix1}${suffix2}`;
}

export const orderService = {
  async checkout(userId: string, input: CheckoutInput) {
    const data = checkoutSchema.parse(input);

    return prisma.$transaction(async (tx) => {
      const productIds = data.cartItems.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: productIds } } });

      if (products.length !== data.cartItems.length) throw new Error("Sebagian produk tidak ditemukan");

      let totalAmount = 0;
      const orderItemsData = data.cartItems.map((cartItem) => {
        const product = products.find((item) => item.id === cartItem.productId);
        if (!product) throw new Error("Produk tidak ditemukan");
        if (product.stok < cartItem.quantity) throw new Error(`Stok ${product.namaProduk} tidak cukup`);
        const price = Number(product.harga);
        const subtotal = price * cartItem.quantity;
        totalAmount += subtotal;
        return {
          productId: product.id,
          quantity: cartItem.quantity,
          price,
          subtotal,
        };
      });

      const isVA = data.paymentMethod === "Virtual Account";
      const selectedBank: string | null = isVA ? data.bank ?? "BCA" : null;
      const vaNumber = isVA && selectedBank ? generateVirtualAccount(selectedBank) : null;

      const order = await tx.order.create({
        data: {
          orderNumber: createOrderNumber(),
          userId,
          recipientName: data.recipientName,
          recipientEmail: data.recipientEmail,
          recipientPhone: data.recipientPhone,
          shippingAddress: data.shippingAddress,
          notes: data.notes,
          paymentMethod: data.paymentMethod,
          totalAmount,
          bank: selectedBank ?? undefined,
          virtualAccount: vaNumber,
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: true },
      });

      for (const item of data.cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stok: { decrement: item.quantity } },
        });
      }

      return order;
    });
  },

  async markPaid(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order tidak ditemukan");
    if (order.paymentStatus === PaymentStatus.PAID) return order;

    const nextOrderStatus =
      order.orderStatus === OrderStatus.PENDING ? OrderStatus.PROCESSING : order.orderStatus;

    return prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        paidAt: new Date(),
        orderStatus: nextOrderStatus,
      },
    });
  },
};
