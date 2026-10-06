export interface Product {
  id: string;
  kodeProduk: string;
  namaProduk: string;
  kategori: string;
  harga: number;
  stok: number;
  fotoUrl?: string | null;
  deskripsi?: string | null;
  createdAt?: string;
}

export type CreateProductInput = Omit<Product, "id" | "createdAt">;
export type UpdateProductInput = Partial<CreateProductInput>;
