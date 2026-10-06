# MiniShop — Test Coding Programmer
### PT. Assist Software Indonesia Pratama

Aplikasi e-commerce berbasis web dengan dua sisi: **storefront pelanggan** dan **panel admin**. Dibangun dengan Next.js 16 App Router, PostgreSQL via Supabase, dan Prisma ORM.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma 6 |
| Auth | JWT custom (jose + bcryptjs) |
| OAuth | Supabase Auth (Google) |
| Storage | Supabase Storage (foto produk) |
| State | Zustand (keranjang belanja) |
| Validation | Zod |

---

## Fitur

### Pelanggan
- Katalog produk dengan pencarian realtime dan filter kategori
- Detail produk dengan galeri gambar
- Keranjang belanja (persist di localStorage)
- Checkout dengan form pengiriman lengkap — tersimpan ke database
- Pilihan metode pembayaran: Virtual Account, Bank Transfer, COD
- Riwayat pesanan dan detail tracking status
- Daftar/login akun, login dengan Google OAuth
- Halaman profil dengan edit data dan keamanan akun

### Admin
- Dashboard dengan stats (order, revenue, katalog, customer) dan grafik
- CRUD produk lengkap — nama, SKU, harga, stok, deskripsi, upload foto ke Supabase Storage
- CRUD kategori dengan proteksi hapus (tidak bisa hapus jika masih ada produk)
- Manajemen order — update status, detail lengkap per order, audit trail
- Manajemen customer — list dengan stats pembelian per customer
- Halaman settings toko dan profil admin

---

## Struktur Database

Database di-host di **Supabase (PostgreSQL)**. Nama logical database sesuai requirement adalah **`ecommerce_mini`** — di Supabase, nama ini ada di `project name` saat pembuatan project. Schema lengkap ada di `database/schema.sql` dan `prisma/schema.prisma`.

**Tabel utama (sesuai requirement):**

| Tabel di DB | Nama Requirement | Kolom Utama |
|---|---|---|
| `users` | Tabel Login | ID, UserName, Password, Nama_Lengkap |
| `products` | Tabel Produk | ID, KodeProduk, NamaProduk, Kategori*, Harga, Stok |

*Kolom Kategori diimplementasikan sebagai relasi ke tabel `categories` (foreign key `KategoriID`) untuk integritas data.

**Tabel tambahan:**

| Tabel | Fungsi |
|---|---|
| `categories` | Master data kategori produk |
| `orders` | Merekam pesanan (Tabel Transaksi) |
| `order_items` | Detail item per pesanan |

---

## Cara Install & Menjalankan

### Kebutuhan
- Node.js 18+
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

### 1. Clone & Install

```bash
git clone <repo-url>
cd e-commers
npm install
```

### 2. Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → New Project
2. Catat **Project URL** dan **Anon Key** dari Settings → API
3. Catat **Database URL** dari Settings → Database → Connection string (URI mode)

### 3. Konfigurasi Environment

Buat file `.env.local` di root project:

```env
# Supabase (database + storage)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Prisma — gunakan transaction pooler untuk runtime, direct untuk migrate
DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

# JWT secret untuk session cookie
JWT_SECRET="ganti-dengan-string-rahasia-minimal-32-karakter"
```

### 4. Push Schema & Seed Database

```bash
# Push schema ke Supabase
npx prisma db push

# Isi data awal (users, categories, 10 produk)
npx prisma db seed
```

Setelah seed, akun yang tersedia:

| Role | Email | Password |
|---|---|---|
| Admin | admin@minicommerce.test | password |
| Customer | customer@minicommerce.test | password |

### 5. Setup Supabase Storage (untuk upload foto produk)

1. Buka Supabase → Storage → New bucket
2. Nama bucket: `product-image`, centang **Public**
3. Buka tab **Policies** → tambahkan policy berikut via SQL Editor:

```sql
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'product-image');

CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-image');

CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'product-image');
```

### 6. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Login Google OAuth (opsional)

1. Buka [Google Cloud Console](https://console.cloud.google.com) → Credentials → Create OAuth Client ID
2. Authorized redirect URI: `https://[PROJECT_REF].supabase.co/auth/v1/callback`
3. Copy Client ID & Secret → Supabase Dashboard → Authentication → Providers → Google → Enable
4. Supabase → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/**`

---

## Cara Penggunaan

### Sebagai Admin

1. Buka `http://localhost:3000/login`
2. Login dengan `admin@minicommerce.test` / `password`
3. Otomatis diarahkan ke `/admin`

**Dashboard** — lihat ringkasan order, revenue, low stock alert, dan 5 pesanan terbaru.

**Produk** (`/admin/products`)
- Klik **Add Product** untuk tambah produk baru
- Isi nama, kode SKU, kategori, harga, stok, dan upload foto
- Klik ikon pensil untuk edit produk lewat halaman detail
- Klik ikon tempat sampah untuk hapus (konfirmasi diperlukan)

**Kategori** (`/admin/categories`)
- Tambah/edit/hapus kategori
- Kategori yang masih memiliki produk tidak bisa dihapus

**Pesanan** (`/admin/orders`)
- Lihat semua order dari pelanggan
- Klik baris untuk expand detail, atau klik "View Full Details"
- Update status order: Pending → Processing → Completed / Cancelled

**Customers** (`/admin/customers`)
- List semua akun pelanggan beserta statistik pembelian

**Settings** (`/admin/settings`)
- Konfigurasi toko, notifikasi, metode pembayaran, pengiriman

---

### Sebagai Pelanggan

1. Buka `http://localhost:3000`
2. Daftar akun baru di `/register` atau login di `/login`
3. Gunakan `customer@minicommerce.test` / `password` untuk demo

**Katalog** — cari produk via search bar, filter berdasarkan kategori, sort berdasarkan harga atau stok.

**Keranjang** — tambah produk dari katalog atau detail produk, ubah jumlah, hapus item. Keranjang tersimpan otomatis meski halaman di-refresh.

**Checkout** — isi nama, email, telepon, alamat pengiriman. Pilih metode bayar dan klik "Place Order". Pesanan tersimpan ke database.

**Riwayat Pesanan** (`/orders`) — lihat semua pesanan, expand untuk detail item dan info pengiriman.

---

## Struktur Folder

```
src/
├── app/
│   ├── admin/          → halaman panel admin
│   ├── api/            → API routes (auth, products, orders, dll)
│   ├── cart/           → halaman keranjang
│   ├── checkout/       → halaman checkout
│   ├── orders/         → riwayat & detail pesanan
│   ├── products/       → detail produk
│   ├── profile/        → profil pelanggan
│   ├── login/          → halaman login
│   └── register/       → halaman daftar
├── components/
│   ├── admin/          → komponen sidebar, mobile nav
│   ├── layouts/        → header
│   └── product/        → catalog, product card
├── repositories/       → layer akses database (Prisma)
├── services/           → business logic
├── lib/                → auth, prisma client, validations
└── store/              → Zustand cart store
```

---

## Catatan

- Pembayaran bersifat simulasi — tidak ada transaksi keuangan nyata
- Upload foto produk memerlukan bucket Supabase Storage dikonfigurasi terlebih dahulu
- Login Google OAuth opsional, login email/password berfungsi tanpa konfigurasi tambahan

---

**Dikerjakan untuk:** PT. Assist Software Indonesia Pratama — Test Coding Programmer
