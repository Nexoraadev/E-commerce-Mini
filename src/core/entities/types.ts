export type Product = {
  id: string;
  kode_produk: string;
  nama_produk: string;
  kategori: string;
  harga: number;
  stok: number;
  foto_url: string | null;
  deskripsi: string | null;
};

export type UserRole = "admin" | "buyer";
