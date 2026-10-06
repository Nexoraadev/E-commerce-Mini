# Arsitektur Aplikasi — MiniShop

## Overview

MiniShop menggunakan pola **Clean Architecture** dengan Next.js App Router. Setiap layer punya tanggung jawab yang terpisah sehingga mudah diuji dan diperluas.

```
Request → API Route → Service → Repository → Prisma → Supabase (PostgreSQL)
```

---

## Layer

### 1. Presentation Layer (`src/app/`)

Semua halaman dan API routes. Next.js App Router membedakan Server Component (dapat akses database langsung) dan Client Component (interaktif di browser).

- **Server Components** — halaman admin yang butuh data saat render (dashboard, dll)
- **Client Components** — halaman dengan interaksi user (form, keranjang, dll)
- **API Routes** — endpoint REST di `src/app/api/`

### 2. Service Layer (`src/services/`)

Business logic. Service tidak tahu soal HTTP atau database — hanya aturan bisnis.

```
auth.service.ts     → register, login, validasi kredensial
product.service.ts  → CRUD produk, auto-generate slug
category.service.ts → CRUD kategori, cek produk sebelum hapus
order.service.ts    → checkout dengan DB transaction (atomic)
```

### 3. Repository Layer (`src/repositories/`)

Abstraksi akses database. Semua query Prisma ada di sini.

```
user.repository.ts      → findByEmail, findByUserName, create
product.repository.ts   → findMany (search/filter/paginasi), findBySlug, CRUD
category.repository.ts  → findMany, findBySlug, CRUD
order.repository.ts     → findMany, findByUserId, recent, updateStatus
```

### 4. Domain Layer (`src/core/domain/`)

Type definitions dan interfaces untuk entitas utama.

---

## Authentication

Menggunakan **JWT custom** (bukan NextAuth atau Supabase Auth untuk login biasa).

**Alur login:**
1. User submit email/password
2. `authService.login()` verifikasi hash bcrypt
3. `signToken()` buat JWT dengan payload `{id, userName, email, role}`
4. Cookie `minicommerce_session` di-set sebagai HttpOnly
5. Setiap request ke halaman/API protected, `getAuthSession()` verifikasi token

**Middleware** (`middleware.ts`) mengamankan:
- `/admin/*` — hanya role ADMIN
- `/checkout/*`, `/orders/*` — hanya role CUSTOMER

**Google OAuth** (opsional):
- Supabase Auth menangani redirect ke Google
- Callback di `/api/auth/callback` exchange code → session
- User baru otomatis dibuat di tabel `users` dengan role CUSTOMER

---

## Database

PostgreSQL di Supabase, dikelola via Prisma ORM.

**Tabel:**

```
users
├── id (UUID, PK)
├── UserName (unique)
├── email (unique)
├── Password (bcrypt hash)
├── Nama_Lengkap
└── role (ADMIN | CUSTOMER)

categories
├── id (UUID, PK)
├── name (unique)
└── slug (unique)

products
├── id (UUID, PK)
├── KodeProduk (unique)
├── NamaProduk
├── slug (unique)
├── Harga (Decimal)
├── Stok (Int)
├── deskripsi
├── image (URL ke Supabase Storage)
└── KategoriID (FK → categories)

orders
├── id (UUID, PK)
├── orderNumber (unique, format: ORD-timestamp-xxx)
├── userId (FK → users)
├── recipientName, recipientEmail, recipientPhone
├── shippingAddress
├── paymentMethod, paymentStatus (PENDING|PAID|FAILED)
└── orderStatus (PENDING|PROCESSING|COMPLETED|CANCELLED)

order_items
├── id (UUID, PK)
├── orderId (FK → orders)
├── productId (FK → products)
├── quantity, price, subtotal
```

**Checkout Transaction:**

`orderService.checkout()` menggunakan `prisma.$transaction()` untuk memastikan:
1. Semua produk ditemukan dan stok mencukupi
2. Order dan order_items dibuat
3. Stok setiap produk dikurangi

Jika satu langkah gagal, seluruh transaksi di-rollback.

---

## State Management

**Zustand** digunakan hanya untuk keranjang belanja (client-side).

Cart store (`src/store/cart-store.ts`) menggunakan `persist` middleware — data tersimpan di `localStorage` sehingga tidak hilang saat halaman di-refresh.

Data order yang sudah checkout disimpan ke database, bukan di Zustand.

---

## File Storage

Foto produk di-upload ke **Supabase Storage** bucket `product-image`.

Alur upload:
1. Admin pilih file di form produk
2. POST ke `/api/products/[id]/upload`
3. Server validasi tipe dan ukuran file
4. File di-upload ke Supabase Storage
5. Public URL disimpan ke kolom `image` di tabel `products`

URL gambar disimpan sebagai string lengkap (bukan path relatif), sehingga langsung bisa digunakan oleh `next/image`.

---

## API Routes

Semua endpoint ada di `src/app/api/`:

```
POST /api/auth/login          → login
POST /api/auth/register       → daftar akun baru
POST /api/auth/logout         → hapus session cookie
GET  /api/auth/callback       → OAuth callback (Google)
GET  /api/me                  → info user dari session aktif

GET    /api/products           → list produk (search, filter, paginasi)
GET    /api/products/[id]      → detail produk (by id atau slug)
POST   /api/products           → tambah produk (Admin)
PUT    /api/products/[id]      → edit produk (Admin)
DELETE /api/products/[id]      → hapus produk (Admin)
POST   /api/products/[id]/upload → upload foto (Admin)

GET    /api/categories         → list kategori
POST   /api/categories         → tambah kategori (Admin)
PUT    /api/categories/[id]    → edit kategori (Admin)
DELETE /api/categories/[id]    → hapus kategori (Admin)

GET    /api/orders             → semua order (Admin)
GET    /api/orders/my          → order milik user (Customer)
GET    /api/orders/[id]        → detail order
PATCH  /api/orders/[id]        → update status (Admin)
POST   /api/checkout           → buat order baru (Customer)

GET    /api/admin/customers    → list customer dengan stats (Admin)
```
