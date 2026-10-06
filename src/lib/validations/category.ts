import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  slug: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
