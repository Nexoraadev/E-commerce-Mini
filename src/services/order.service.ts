import { prisma } from "@/lib/prisma";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";

function createOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
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
};
