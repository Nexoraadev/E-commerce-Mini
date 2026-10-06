import { z } from "zod";

export const checkoutSchema = z.object({
  recipientName: z.string().min(2, "Nama penerima wajib diisi"),
  recipientEmail: z.string().email("Format email tidak valid"),
  recipientPhone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  shippingAddress: z.string().min(10, "Alamat pengiriman minimal 10 karakter"),
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(["Virtual Account", "Bank Transfer", "Cash"], "Metode pembayaran wajib dipilih"),
  cartItems: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive("Jumlah harus lebih dari 0"),
    })
  ).min(1, "Keranjang belanja tidak boleh kosong"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
