# Design System & UI/UX Guidelines

## Project: Ecommerce Mini
Dokumentasi desain untuk aplikasi e-commerce mini berbasis web mobile-first yang sederhana, modern, dan user-friendly.

---

## 1. Design Principles
1. **Mobile-First:** Semua tampilan utama didesain optimal untuk layar smartphone terlebih dahulu.
2. **Clean & Clear:** Fokus pada produk, harga, stok, dan aksi pembelian tanpa distraksi visual berlebihan.
3. **Fast Interaction:** Search, filter kategori, keranjang, dan checkout harus terasa cepat dan mudah dipahami.
4. **Admin Friendly:** CRUD produk harus sederhana, rapi, dan mudah digunakan untuk simulasi admin/penjual.

---

## 2. Visual Identity

### 2.1. Color Palette
| Token | Warna | Hex | Penggunaan |
| :--- | :--- | :--- | :--- |
| `primary` | Emerald Green | `#059669` | Tombol utama, CTA, indikator sukses |
| `primary-dark` | Emerald Dark | `#047857` | Hover tombol utama |
| `secondary` | Slate Navy | `#0F172A` | Heading, teks utama |
| `accent` | Amber Gold | `#F59E0B` | Rating star, promo badge, highlight harga |
| `background` | Slate Light | `#F8FAFC` | Background halaman |
| `surface` | White | `#FFFFFF` | Card, modal, form |
| `muted` | Slate Gray | `#64748B` | Teks pendukung |
| `danger` | Red | `#DC2626` | Tombol hapus, error, validasi gagal |

### 2.2. Typography
- **Font:** Inter / System Sans Serif
- **Heading H1:** 28px / 700
- **Heading H2:** 22px / 700
- **Heading H3:** 18px / 600
- **Body:** 14px - 16px / 400
- **Caption:** 12px / 400
- **Button Text:** 14px / 600

---

## 3. Layout System

### 3.1. Mobile Layout
- Max content width: `430px` untuk simulasi mobile preview.
- Padding horizontal utama: `16px`.
- Gap antar card: `12px - 16px`.
- Bottom navigation fixed untuk menu utama pembeli:
  - Home
  - Search / Catalog
  - Cart
  - Wishlist
  - Profile

### 3.2. Desktop Layout
- Container max-width: `1200px`.
- Katalog produk menggunakan grid 4 kolom.
- Admin panel menggunakan sidebar kiri dan tabel data produk di area utama.

---

## 4. Core Components

### 4.1. Product Card
**Elemen:**
- Foto produk rasio 1:1.
- Badge kategori di pojok atas.
- Nama produk maksimal 2 baris.
- Harga format rupiah (`Rp 150.000`).
- Badge stok:
  - `Tersedia` jika stok > 10
  - `Stok Menipis` jika stok 1-10
  - `Habis` jika stok 0
- Tombol kecil `+ Keranjang`.

### 4.2. Product Detail Page
**Elemen:**
- Hero image produk.
- Nama, harga, kategori, stok.
- Deskripsi produk.
- Stepper jumlah produk.
- CTA utama: `Tambah ke Keranjang`.
- CTA sekunder: `Wishlist`.

### 4.3. Admin Product Form
**Field:**
- Kode Produk
- Nama Produk
- Kategori
- Harga
- Stok
- Deskripsi
- Upload Foto Produk

**Validasi:**
- Kode produk wajib dan unik.
- Nama produk wajib minimal 3 karakter.
- Harga wajib > 0.
- Stok wajib >= 0.
- Foto hanya `jpg`, `png`, `webp`.

### 4.4. Checkout / Virtual Account
**Step UI:**
1. Review Keranjang
2. Pilih Bank VA
3. Generate Nomor Virtual Account
4. Simulasi Bayar
5. Status Berhasil

**Komponen penting:**
- Card ringkasan order.
- Daftar pilihan bank.
- Nomor Virtual Account dengan tombol copy.
- Status badge: `Pending`, `Paid`, `Expired`.

---

## 5. Page Design Specs

### 5.1. Login Page
- Centered auth card.
- Logo / nama aplikasi di atas.
- Form username/email + password.
- Tombol login Google.
- Link register.

### 5.2. Buyer Home / Catalog Page
- Top bar berisi greeting user dan icon cart.
- Search bar sticky di atas.
- Horizontal category chips.
- Product grid 2 kolom di mobile.
- Empty state saat tidak ada produk.

### 5.3. Admin Dashboard Page
- Summary cards:
  - Total Produk
  - Total Stok
  - Produk Habis
  - Total Transaksi
- Table produk dengan aksi edit/hapus.
- Floating action button / button `Tambah Produk`.

### 5.4. Cart Page
- List produk dalam keranjang.
- Quantity stepper.
- Subtotal per item.
- Total order sticky di bawah.
- CTA `Checkout`.

---

## 6. Interaction Guidelines
- Gunakan toast untuk feedback aksi sukses/gagal.
- Gunakan confirm dialog sebelum hapus produk.
- Disable tombol beli jika stok habis.
- Gunakan skeleton loading saat data produk sedang dimuat.
- Gunakan empty state jelas untuk katalog kosong, keranjang kosong, dan wishlist kosong.

---

## 7. Accessibility
- Kontras warna minimal memenuhi WCAG AA.
- Semua tombol memiliki label yang jelas.
- Form input memiliki label dan pesan error.
- Ukuran area klik minimal 44px pada mobile.

---

## 8. Design References
Tampilan mengikuti pendekatan e-commerce modern seperti marketplace mobile Indonesia: kartu produk ringkas, harga jelas, pencarian mudah, dan checkout singkat.
