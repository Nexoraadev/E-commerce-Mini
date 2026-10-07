import { z } from "zod";

const VA_BANKS = ["BCA", "MANDIRI", "BNI", "BRI"] as const;

export const checkoutSchema = z.object({
  recipientName: z.string().min(2, "Nama penerima wajib diisi"),
  recipientEmail: z.string().email("Format email tidak valid"),
  recipientPhone: z.string().min(8, "Nomor telepon minimal 8 digit"),
  shippingAddress: z.string().min(10, "Alamat pengiriman minimal 10 karakter"),
  notes: z.string().optional().nullable(),
  paymentMethod: z.enum(["Virtual Account", "Bank Transfer", "Cash"], "Metode pembayaran wajib dipilih"),
  bank: z.enum(VA_BANKS).optional().nullable(),
  cartItems: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive("Jumlah harus lebih dari 0"),
    })
  ).min(1, "Keranjang belanja tidak boleh kosong"),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "Virtual Account" && !data.bank) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bank Virtual Account wajib dipilih (BCA/Mandiri/BNI/BRI)",
      path: ["bank"],
    });
  }
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
