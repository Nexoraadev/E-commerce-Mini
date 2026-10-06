# Panduan Instalasi — MiniShop

## Kebutuhan Sistem

- **Node.js** 18 atau lebih baru — [nodejs.org](https://nodejs.org)
- **npm** 9+ (sudah termasuk dengan Node.js)
- **Akun Supabase** — [supabase.com](https://supabase.com) (gratis)
- **Git**

---

## Langkah Instalasi

### 1. Clone Repositori

```bash
git clone <url-repo>
cd e-commers
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Buat Project Supabase

1. Login ke [supabase.com](https://supabase.com)
2. Klik **New Project**, isi nama dan password database
3. Tunggu hingga project selesai dibuat (~1 menit)
4. Buka **Settings → API**, catat:
   - `Project URL` (bentuk: `https://xxxx.supabase.co`)
   - `anon/public key`
5. Buka **Settings → Database → Connection string**, pilih tab **URI**, catat dua URL:
   - **Transaction mode** (port 6543) — untuk runtime aplikasi
   - **Session mode** (port 5432) — untuk migrate/seed

### 4. Buat File `.env.local`

Buat file `.env.local` di root folder project (sejajar dengan `package.json`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

DATABASE_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

JWT_SECRET="isi-dengan-random-string-panjang-minimal-32-karakter"
```

Ganti `xxxx` dan `[PASSWORD]` dengan nilai dari project Supabase kamu.

### 5. Push Schema Database

```bash
npx prisma db push
```

Perintah ini akan membuat semua tabel di Supabase sesuai `prisma/schema.prisma`.

### 6. Isi Data Awal

```bash
npx prisma db seed
```

Data yang dibuat:
- 2 user (1 admin, 1 customer)
- 4 kategori (Electronics, Fashion, Food, Accessories)
- 10 produk

### 7. Setup Supabase Storage (untuk upload foto produk)

**Buat bucket:**
1. Supabase Dashboard → Storage → New bucket
2. Nama: `product-image`, aktifkan **Public bucket** → Save

**Tambah policy via SQL Editor (Supabase → SQL Editor → New query):**

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

Klik **Run**.

### 8. Jalankan Aplikasi

```bash
npm run dev
```

Buka browser ke [http://localhost:3000](http://localhost:3000).

---

## Akun Demo

| Role | Email | Username | Password |
|---|---|---|---|
| Admin | admin@minicommerce.test | admin | password |
| Customer | customer@minicommerce.test | customer | password |

---

## Perintah Berguna

```bash
# Jalankan development server
npm run dev

# Build production
npm run build

# Cek TypeScript
npm run typecheck

# Buka Prisma Studio (lihat data database via GUI)
npx prisma studio

# Reset dan seed ulang database
npx prisma db push --force-reset
npx prisma db seed
```

---

## Troubleshooting

**Error `DIRECT_URL not found` saat `prisma db push`**
→ Pastikan `.env.local` sudah berisi `DIRECT_URL`. Prisma CLI hanya baca dari `.env`, bukan `.env.local`. Jika perlu, copy nilai ke file `.env` juga.

**Upload foto gagal**
→ Pastikan bucket `product-image` sudah dibuat dan policy INSERT sudah ditambahkan di Supabase Storage.

**Login Google tidak bekerja**
→ Google OAuth bersifat opsional. Login dengan email/password tetap berfungsi tanpa konfigurasi OAuth.

**Port 3000 sudah dipakai**
→ Next.js otomatis pindah ke port 3001. Perhatikan output terminal untuk URL yang benar.
