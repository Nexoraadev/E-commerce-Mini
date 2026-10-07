-- ============================================================
-- MiniShop — Database Schema
-- Nama database: ecommerce_mini (PostgreSQL via Supabase)
-- ============================================================
-- File ini bisa dijalankan di Supabase SQL Editor atau
-- psql client untuk membuat ulang seluruh struktur database.
-- ============================================================

-- Hapus tabel lama jika ada (urutan terbalik karena foreign key)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Hapus enum lama jika ada
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentStatus" CASCADE;


-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');


-- ============================================================
-- TABEL LOGIN (requirement: ID, UserName, Password, Nama_Lengkap)
-- Nama tabel di DB: users
-- ============================================================

CREATE TABLE users (
    id          VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "UserName"  VARCHAR(100) NOT NULL UNIQUE,
    "Password"  TEXT         NOT NULL,
    "Nama_Lengkap" VARCHAR(200) NOT NULL,
    email       VARCHAR(200) NOT NULL UNIQUE,
    role        "Role"       NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Tabel Login — menyimpan akun admin dan customer';


-- ============================================================
-- TABEL KATEGORI
-- ============================================================

CREATE TABLE categories (
    id          VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABEL PRODUK (requirement: ID, KodeProduk, NamaProduk, Kategori, Harga, Stok)
-- Nama tabel di DB: products
-- ============================================================

CREATE TABLE products (
    id           VARCHAR(36)    PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "KodeProduk" VARCHAR(50)    NOT NULL UNIQUE,
    "NamaProduk" VARCHAR(200)   NOT NULL,
    slug         VARCHAR(200)   NOT NULL UNIQUE,
    "Harga"      DECIMAL(12, 2) NOT NULL CHECK ("Harga" >= 0),
    "Stok"       INTEGER        NOT NULL DEFAULT 0 CHECK ("Stok" >= 0),
    deskripsi    TEXT,
    image        TEXT,                         -- URL foto produk (Supabase Storage)
    "KategoriID" VARCHAR(36)    NOT NULL,
    "createdAt"  TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_category
        FOREIGN KEY ("KategoriID")
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

COMMENT ON TABLE products IS 'Tabel Produk — kolom Kategori direlasikan ke tabel categories via KategoriID';
COMMENT ON COLUMN products."KodeProduk" IS 'Kode unik produk, contoh: PRD-ELEC-001';
COMMENT ON COLUMN products."NamaProduk" IS 'Nama tampil produk di katalog';
COMMENT ON COLUMN products."Harga"      IS 'Harga satuan dalam Rupiah';
COMMENT ON COLUMN products."Stok"       IS 'Jumlah stok fisik tersedia';


-- ============================================================
-- TABEL TRANSAKSI / ORDERS
-- ============================================================

CREATE TABLE orders (
    id               VARCHAR(36)     PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderNumber"    VARCHAR(100)    NOT NULL UNIQUE,  -- format: ORD-{timestamp}-{random}
    "userId"         VARCHAR(36)     NOT NULL,
    "recipientName"  VARCHAR(200)    NOT NULL,
    "recipientEmail" VARCHAR(200)    NOT NULL,
    "recipientPhone" VARCHAR(50)     NOT NULL,
    "shippingAddress" TEXT           NOT NULL,
    notes            TEXT,
    "paymentMethod"  VARCHAR(100)    NOT NULL,         -- Virtual Account / Bank Transfer / Cash
    "paymentStatus"  "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "orderStatus"    "OrderStatus"   NOT NULL DEFAULT 'PENDING',
    "totalAmount"    DECIMAL(12, 2)  NOT NULL,
    bank             VARCHAR(50),                       -- BCA / MANDIRI / BNI / BRI
    "virtualAccount" VARCHAR(50),                       -- Nomor VA (contoh: 8808123456789012)
    "paidAt"         TIMESTAMP(3),                      -- Waktu bayar terverifikasi
    "createdAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_user
        FOREIGN KEY ("userId")
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- TABEL DETAIL TRANSAKSI / ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
    id          VARCHAR(36)    PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId"   VARCHAR(36)    NOT NULL,
    "productId" VARCHAR(36)    NOT NULL,
    quantity    INTEGER        NOT NULL CHECK (quantity > 0),
    price       DECIMAL(12, 2) NOT NULL,     -- harga saat transaksi (snapshot)
    subtotal    DECIMAL(12, 2) NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY ("orderId")
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY ("productId")
        REFERENCES products(id)
        ON DELETE RESTRICT
);


-- ============================================================
-- INDEX — mempercepat query yang sering dipakai
-- ============================================================

CREATE INDEX idx_products_kategori  ON products("KategoriID");
CREATE INDEX idx_products_slug      ON products(slug);
CREATE INDEX idx_orders_user        ON orders("userId");
CREATE INDEX idx_orders_status      ON orders("orderStatus");
CREATE INDEX idx_order_items_order  ON order_items("orderId");


-- ============================================================
-- DATA AWAL (SEED)
-- ============================================================

-- Kategori
INSERT INTO categories (id, name, slug) VALUES
    ('cat-elec-001', 'Electronics',  'electronics'),
    ('cat-fash-001', 'Fashion',      'fashion'),
    ('cat-food-001', 'Food',         'food'),
    ('cat-accs-001', 'Accessories',  'accessories')
ON CONFLICT (slug) DO NOTHING;

-- Admin & Customer (password: "password", di-hash dengan bcrypt 10 rounds)
-- Hash di bawah adalah nilai bcrypt dari string "password"
INSERT INTO users (id, "UserName", "Password", "Nama_Lengkap", email, role) VALUES
    (
        'usr-admin-001',
        'admin',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Administrator',
        'admin@minicommerce.test',
        'ADMIN'
    ),
    (
        'usr-cust-001',
        'customer',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'Customer Tester',
        'customer@minicommerce.test',
        'CUSTOMER'
    )
ON CONFLICT (email) DO NOTHING;

-- Produk
INSERT INTO products (id, "KodeProduk", "NamaProduk", slug, "Harga", "Stok", deskripsi, "KategoriID") VALUES
    ('prd-001', 'PRD-ELEC-001', 'Laptop Gaming Pro 15 inch',    'laptop-gaming-pro-15-inch',    14999000, 10, 'Laptop gaming performa tinggi dengan prosesor generasi terbaru.', 'cat-elec-001'),
    ('prd-002', 'PRD-ELEC-002', 'Smartphone Flagship 5G',        'smartphone-flagship-5g',        8499000, 15, 'Smartphone dengan kamera 108MP dan layar AMOLED 120Hz.',          'cat-elec-001'),
    ('prd-003', 'PRD-ELEC-003', 'Headphone Wireless ANC',        'headphone-wireless-anc',        1299000, 20, 'Headphone nirkabel dengan Active Noise Cancellation.',            'cat-elec-001'),
    ('prd-004', 'PRD-FASH-001', 'Jaket Hoodie Premium',          'jaket-hoodie-premium',           349000, 30, 'Jaket hoodie berbahan fleecy hangat untuk sehari-hari.',           'cat-fash-001'),
    ('prd-005', 'PRD-FASH-002', 'Sepatu Sneakers Casual',        'sepatu-sneakers-casual',         599000, 25, 'Sneakers minimalis dengan insole empuk dan sol karet tahan lama.', 'cat-fash-001'),
    ('prd-006', 'PRD-FASH-003', 'Kemeja Denim Slim Fit',         'kemeja-denim-slim-fit',          279000, 18, 'Kemeja denim kasual dengan potongan slim fit modern.',             'cat-fash-001'),
    ('prd-007', 'PRD-FOOD-001', 'Kopi Arabika Gayo 500g',        'kopi-arabika-gayo-500g',          85000, 50, 'Biji kopi sangrai asli Aceh Gayo dengan cita rasa fruity.',        'cat-food-001'),
    ('prd-008', 'PRD-FOOD-002', 'Cokelat Artisan Dark 70%',      'cokelat-artisan-dark-70percent',  45000, 60, 'Cokelat hitam organik buatan tangan tanpa bahan pengawet.',        'cat-food-001'),
    ('prd-009', 'PRD-ACCS-001', 'Jam Tangan Minimalis Classic',  'jam-tangan-minimalis-classic',   899000, 12, 'Jam tangan bermesin kuarsa dengan tali kulit asli.',               'cat-accs-001'),
    ('prd-010', 'PRD-ACCS-002', 'Tas Ransel Waterproof',         'tas-ransel-waterproof',           399000, 22, 'Tas ransel multifungsi tahan air dengan slot laptop 15.6 inch.',   'cat-accs-001')
ON CONFLICT ("KodeProduk") DO NOTHING;


-- ============================================================
-- CATATAN PENGGUNAAN
-- ============================================================
-- 1. File ini untuk referensi struktur dan seed data awal.
-- 2. Dalam proyek ini, migrasi dikelola oleh Prisma ORM.
--    Untuk setup via Prisma: jalankan `npx prisma db push`
--    kemudian `npx prisma db seed`.
-- 3. Untuk menjalankan file ini langsung di Supabase:
--    Buka Supabase Dashboard → SQL Editor → New query → paste → Run.
-- ============================================================
