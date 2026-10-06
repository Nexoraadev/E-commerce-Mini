import { z } from "zod";

export const productSchema = z.object({
  kodeProduk: z.string().min(2, "Kode produk wajib diisi"),
  namaProduk: z.string().min(3, "Nama produk minimal 3 karakter"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  harga: z.number().min(0, "Harga harus lebih besar atau sama dengan 0"),
  stok: z.number().int().min(0, "Stok harus integer non-negatif"),
  deskripsi: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
