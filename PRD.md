# Product Requirement Document (PRD)

## Project: Ecommerce Mini
Aplikasi e-commerce sederhana multi-peran (Admin & Pembeli) sesuai spesifikasi tes coding PT. Assist Software Indonesia Pratama.

---

## 1. Tujuan & Latar Belakang
Menyediakan sistem e-commerce berbasis web responsif (mobile-first) dengan arsitektur terstruktur (Clean Architecture), database relasional SQL (`ecommerce_mini`), autentikasi multi-provider (kredensial & Google OAuth), manajemen produk dengan upload foto, katalog produk interaktif, dan simulasi transaksi checkout Virtual Account.

---

## 2. Struktur Database (`ecommerce_mini`)

### 2.1. Tabel `Login`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `ID` | UUID / INT PRIMARY KEY | Identitas unik user |
| `UserName` | VARCHAR(100) UNIQUE | Username atau email user |
| `Password` | TEXT | Password hash (bcrypt) |
| `Nama_Lengkap` | VARCHAR(150) | Nama lengkap pengguna |
| `Role` | VARCHAR(20) | Peran: `admin` atau `buyer` |
| `Avatar_Url` | TEXT NULL | URL avatar profil (Google / Upload) |
| `Created_At` | TIMESTAMP DEFAULT NOW() | Waktu pendaftaran |

### 2.2. Tabel `Produk`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `ID` | UUID / INT PRIMARY KEY | Identitas unik produk |
| `KodeProduk` | VARCHAR(50) UNIQUE | Kode unik SKU produk (e.g. `PRD-001`) |
| `NamaProduk` | VARCHAR(200) | Nama produk |
| `Kategori` | VARCHAR(100) | Kategori (Elektronik, Fashion, dll.) |
| `Harga` | NUMERIC(12,2) | Harga satuan produk |
| `Stok` | INT | Sisa stok barang |
| `Foto_Url` | TEXT NULL | URL gambar produk dari storage |
| `Deskripsi` | TEXT NULL | Rincian deskripsi produk |
| `Created_At` | TIMESTAMP DEFAULT NOW() | Waktu penambahan |

### 2.3. Tabel `Transaksi` (Nilai Tambah)
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `ID` | UUID / INT PRIMARY KEY | Identitas transaksi |
| `KodeTransaksi` | VARCHAR(50) UNIQUE | Kode nomor invoice |
| `UserID` | UUID / INT (FK Login.ID) | Pemilik transaksi |
| `TotalHarga` | NUMERIC(12,2) | Total tagihan |
| `Bank` | VARCHAR(50) | Bank tujuan (BCA, BRI, Mandiri, BNI) |
| `VirtualAccount` | VARCHAR(50) | Nomor VA yang digenerate |
| `Status` | VARCHAR(20) | `PENDING`, `PAID`, `EXPIRED` |
| `Created_At` | TIMESTAMP DEFAULT NOW() | Waktu checkout |

### 2.4. Tabel `Detail_Transaksi`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `ID` | UUID / INT PRIMARY KEY | Identitas baris detail |
| `TransaksiID` | UUID / INT (FK Transaksi.ID)| Relasi ke transaksi utama |
| `ProdukID` | UUID / INT (FK Produk.ID) | Produk yang dibeli |
| `Jumlah` | INT | Kuantitas item |
| `HargaSatuan` | NUMERIC(12,2) | Harga saat transaksi dibuat |

---

## 3. Fitur Utama & Kebutuhan Fungsional

### 3.1. Autentikasi & Akun
- **Login Standar:** Validasi kredensial (UserName / Password) dari tabel `Login`.
- **OAuth Login:** Login/Register instan via Google OAuth (Supabase Auth).
- **Role-based Redirection:** Admin diarahkan ke dashboard pengelolaan produk, Pembeli diarahkan ke katalog belanja.

### 3.2. Panel Admin (CRUD Produk)
- **Katalog Manajemen:** Menampilkan seluruh produk dengan indikator status stok (tersedia, menipis, habis).
- **Tambah Produk:** Form input `KodeProduk`, `NamaProduk`, `Kategori`, `Harga`, `Stok`, `Deskripsi`, serta upload gambar ke bucket storage.
- **Edit Produk:** Update seluruh informasi produk termasuk penggantian gambar.
- **Hapus Produk:** Hapus data produk dengan konfirmasi proteksi data.

### 3.3. Halaman Pembeli (Katalog & Interaksi)
- **Katalog Produk:** Grid responsif produk dilengkapi foto, nama, badge kategori, harga terformat rupiah, dan sisa stok.
- **Pencarian Real-Time:** Filter berdasarkan `NamaProduk` atau `KodeProduk`.
- **Filter Kategori:** Tab / pill filter kategori (Semua, Elektronik, Pakaian, Aksesoris, dll.).
- **Detail Produk:** Modal atau halaman detail yang menampilkan spesifikasi lengkap dan opsi kuantitas beli.

### 3.4. Keranjang Belanja & Checkout (Simulasi VA)
- **Shopping Cart:** Tambah produk, ubah jumlah pesanan, dan kalkulasi total belanja.
- **Simulasi Checkout:**
  - Pemilihan bank transfer (BCA, Mandiri, BRI, BNI).
  - Generate nomor Virtual Account acak terformat (contoh: `8808123456789012`).
  - Halaman invoice status pembayaran dengan tombol simulasi "Bayar Sekarang" untuk memicu status `PAID` dan pengurangan stok produk otomatis.

---

## 4. Kebutuhan Non-Fungsional
- **Arsitektur:** Clean Architecture dengan pemisahan layer:
  - `Domain / Entities`
  - `Use Cases / Business Logic`
  - `Repositories / Data Access`
  - `Presentation / UI Components`
- **Responsivitas:** Mobile-first design, fluid transition, ramah layar smartphone hingga desktop monitor.
- **Performa:** Fast load menggunakan Server Side Rendering / Next.js Server Components dan image optimization.
- **Keamanan:** Row-Level Security (RLS) pada database PostgreSQL / Supabase, validasi skema form menggunakan Zod.
