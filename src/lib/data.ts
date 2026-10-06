import type { Product } from "@/core/domain/entities/product";

export const sampleProducts: Product[] = [
  {
    id: "1",
    kodeProduk: "PRD-001",
    namaProduk: "Headphone Wireless Premium",
    kategori: "Elektronik",
    harga: 350000,
    stok: 15,
    fotoUrl: null,
    deskripsi: "Headphone bluetooth dengan kualitas suara jernih dan baterai tahan lama.",
  },
  {
    id: "2",
    kodeProduk: "PRD-002",
    namaProduk: "Sneakers Casual Putih",
    kategori: "Fashion",
    harga: 425000,
    stok: 8,
    fotoUrl: null,
    deskripsi: "Sepatu casual nyaman untuk kegiatan harian.",
  },
  {
    id: "3",
    kodeProduk: "PRD-003",
    namaProduk: "Tas Ransel Laptop",
    kategori: "Aksesoris",
    harga: 275000,
    stok: 12,
    fotoUrl: null,
    deskripsi: "Tas laptop anti air dengan banyak kompartemen.",
  },
];

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
