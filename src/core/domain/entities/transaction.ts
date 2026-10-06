export interface TransactionItem {
  produkId: string;
  namaProduk: string;
  jumlah: number;
  hargaSatuan: number;
}

export interface Transaction {
  id: string;
  kodeTransaksi: string;
  userId: string;
  totalHarga: number;
  bank: "BCA" | "BRI" | "BNI" | "MANDIRI";
  virtualAccount: string;
  status: "PENDING" | "PAID" | "EXPIRED";
  items: TransactionItem[];
  createdAt?: string;
}
