export function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

// alias
export const formatCurrency = formatRupiah;

export function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDateShort(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export function orderStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "Menunggu",
    PROCESSING: "Diproses",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
  };
  return map[status] ?? status;
}

export function orderStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-600",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

export function paymentStatusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "Belum Bayar",
    PAID: "Sudah Bayar",
    FAILED: "Gagal",
  };
  return map[status] ?? status;
}

export function paymentStatusColor(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    PAID: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-red-100 text-red-600",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}
