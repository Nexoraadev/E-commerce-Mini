# Manual Penggunaan — MiniShop

## Daftar Isi

1. [Akses Aplikasi](#1-akses-aplikasi)
2. [Daftar & Login](#2-daftar--login)
3. [Panel Admin](#3-panel-admin)
4. [Storefront Pelanggan](#4-storefront-pelanggan)

---

## 1. Akses Aplikasi

Setelah server berjalan, buka browser dan akses:

- **Storefront:** `http://localhost:3000`
- **Admin Panel:** `http://localhost:3000/admin`
- **Login:** `http://localhost:3000/login`

---

## 2. Daftar & Login

### Daftar Akun Baru
1. Buka `/register`
2. Isi nama lengkap, username, email, dan password (minimal 6 karakter)
3. Klik **Daftar Sekarang** — langsung masuk ke storefront
4. Atau klik **Continue with Google** jika Google OAuth sudah dikonfigurasi

### Login
1. Buka `/login`
2. Masukkan email atau username + password
3. Klik **Sign In**
4. Admin diarahkan ke `/admin`, customer ke halaman utama

---

## 3. Panel Admin

> Login dengan akun admin terlebih dahulu.

### Dashboard (`/admin`)

Halaman pertama setelah login admin. Menampilkan:
- Ringkasan total order, revenue, jumlah produk, dan customer
- Grafik revenue 30 hari terakhir
- 5 pesanan terbaru
- Produk dengan stok hampir habis

---

### Produk (`/admin/products`)

**Melihat produk:**
- Tabel menampilkan foto, nama, kode SKU, kategori, harga, dan status stok
- Gunakan search bar untuk cari berdasarkan nama atau kode
- Klik header kolom untuk sort

**Tambah produk:**
1. Klik tombol **Add Product** di kanan atas
2. Isi form: nama, kode SKU, kategori, harga, stok, deskripsi
3. Upload foto (JPG/PNG/WebP, maks 2MB) — klik area gambar atau drag file
4. Pilih status: Active / Draft
5. Klik **Add Product**

**Edit produk:**
1. Klik ikon pensil di baris produk
2. Halaman edit terbuka di `/admin/products/[id]`
3. Ubah field yang diperlukan
4. Klik **Save Changes**

**Hapus produk:**
1. Klik ikon tempat sampah di baris produk
2. Klik **Confirm** untuk konfirmasi
3. Produk yang masih ada di order aktif tidak bisa dihapus

---

### Kategori (`/admin/categories`)

**Tambah kategori:**
1. Klik **Add Category**
2. Isi nama — slug otomatis terbentuk dari nama
3. Klik **Add Category**

**Edit kategori:**
- Klik ikon pensil → ubah nama/slug → Save

**Hapus kategori:**
- Hanya bisa dihapus jika tidak ada produk yang menggunakan kategori tersebut
- Ikon hapus akan disabled (abu-abu) jika masih ada produk

---

### Pesanan (`/admin/orders`)

**Melihat semua pesanan:**
- Gunakan filter tab (All, Pending, Processing, Completed, Cancelled)
- Search berdasarkan nomor order atau nama customer
- Filter tambahan: metode bayar, tanggal

**Expand detail pesanan:**
- Klik baris order untuk melihat detail item, info pengiriman, dan pembayaran
- Klik **View Full Details** untuk halaman detail lengkap

**Update status pesanan:**
- Di baris tabel: klik dropdown status di kolom Status
- Di halaman detail: klik **Update Status** → pilih status baru

**Alur status:**
```
PENDING → PROCESSING → COMPLETED
       → CANCELLED
```

**Halaman detail order** (`/admin/orders/[id]`):
- Fullfillment workflow dengan progress visual
- Tabel item beserta foto, SKU, dan subtotal
- Info pengiriman dengan kode tracking simulasi
- Info pembayaran (metode, referensi, timestamp)
- Profil customer
- Audit trail aktivitas order
- Field catatan internal staff

---

### Customers (`/admin/customers`)

- List semua akun pelanggan (bukan admin)
- Kolom: nama, email, jumlah order, total belanja, status aktif/tidak
- Search berdasarkan nama, username, atau email
- Klik ⋮ di baris untuk aksi: View Profile, View Orders, Reset Password, Deactivate

---

### Settings (`/admin/settings`)

Tab **General** — nama toko, email, telepon, alamat, mata uang, timezone.

Tab **Notifications** — toggle notifikasi email per event (order baru, stok rendah, dll).

Tab **Payments** — aktif/nonaktifkan metode pembayaran.

Tab **Shipping** — atur biaya ongkir, threshold gratis ongkir, hari estimasi.

Tab **Security** — API key, durasi session, log login.

---

### Profil Admin (`/admin/profile`)

Akses via klik nama/avatar di bagian bawah sidebar.

- Edit nama dan username
- Ganti password (butuh password lama)
- Info session aktif
- Tombol Sign Out

---

## 4. Storefront Pelanggan

### Katalog Produk (halaman utama `/`)

- Scroll atau search untuk menemukan produk
- Filter kategori dengan tombol pill di bawah search bar
- Ubah urutan tampilan via dropdown Sort
- Klik **Add to Cart** langsung dari kartu produk, atau klik produk untuk detail lebih dulu

### Detail Produk (`/products/[slug]`)

- Lihat foto, deskripsi lengkap, stok tersedia
- Atur jumlah (tidak bisa melebihi stok)
- Klik **Add to Cart** atau **Buy Now with 1-Click** untuk langsung ke checkout
- Tab: Deskripsi, Spesifikasi, Ulasan
- Produk serupa ditampilkan di bagian bawah

### Keranjang (`/cart`)

- Ubah jumlah item dengan tombol +/−
- Hapus item dengan tombol Remove
- Order summary dengan kalkulasi ongkir otomatis
- Gratis ongkir untuk pesanan di atas Rp 500.000
- Klik **Proceed to Checkout**

### Checkout (`/checkout`)

> Login diperlukan. Jika belum login, akan diarahkan ke halaman login terlebih dahulu.

1. Isi **Contact Information**: nama, email, telepon
2. Isi **Shipping Address**: alamat lengkap (jalan, kota, provinsi, kode pos)
3. Pilih **Shipping Method**: Standard (2-4 hari) atau Express (1-2 hari, +Rp 25.000)
4. Pilih **Payment Method**:
   - Virtual Account — simulasi BCA/Mandiri/BNI/BRI
   - Bank Transfer — simulasi transfer manual
   - Cash on Delivery — bayar di tempat
5. Tambahkan catatan khusus jika ada (opsional)
6. Klik **Place Order** — pesanan tersimpan ke database
7. Halaman konfirmasi menampilkan nomor order

### Riwayat Pesanan (`/orders`)

- List semua pesanan milik akun yang login
- Filter berdasarkan status
- Klik kartu pesanan untuk expand detail
- Klik **View Details** untuk halaman detail lengkap dengan tracking status
- Tombol **Buy Again** tersedia untuk pesanan yang sudah Completed

### Profil (`/profile`)

- Edit nama, username
- Lihat statistik pesanan (total, selesai, proses)
- Ganti password
- Kelola alamat tersimpan
- Pilihan notifikasi

---

## Catatan Penting

- Semua pembayaran bersifat **simulasi** — tidak ada transaksi keuangan nyata
- Nomor Virtual Account dibuat secara acak dan tidak terhubung ke sistem bank manapun
- Upload foto produk hanya berfungsi jika Supabase Storage sudah dikonfigurasi (lihat INSTALL.md)
