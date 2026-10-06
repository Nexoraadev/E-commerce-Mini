create extension if not exists "pgcrypto";

create table if not exists public.login (
  id uuid primary key default gen_random_uuid(),
  username varchar(100) not null unique,
  password text,
  nama_lengkap varchar(150) not null,
  role varchar(20) not null default 'buyer' check (role in ('admin', 'buyer')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.produk (
  id uuid primary key default gen_random_uuid(),
  kode_produk varchar(50) not null unique,
  nama_produk varchar(200) not null,
  kategori varchar(100) not null,
  harga numeric(12,2) not null check (harga >= 0),
  stok integer not null default 0 check (stok >= 0),
  foto_url text,
  deskripsi text,
  created_at timestamptz not null default now()
);

create table if not exists public.transaksi (
  id uuid primary key default gen_random_uuid(),
  kode_transaksi varchar(50) not null unique,
  user_id uuid references public.login(id) on delete set null,
  total_harga numeric(12,2) not null check (total_harga >= 0),
  bank varchar(50) not null check (bank in ('BCA', 'BRI', 'BNI', 'MANDIRI')),
  virtual_account varchar(50) not null,
  status varchar(20) not null default 'PENDING' check (status in ('PENDING', 'PAID', 'EXPIRED')),
  created_at timestamptz not null default now()
);

create table if not exists public.detail_transaksi (
  id uuid primary key default gen_random_uuid(),
  transaksi_id uuid not null references public.transaksi(id) on delete cascade,
  produk_id uuid not null references public.produk(id) on delete restrict,
  jumlah integer not null check (jumlah > 0),
  harga_satuan numeric(12,2) not null check (harga_satuan >= 0)
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.login(id) on delete cascade,
  produk_id uuid not null references public.produk(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, produk_id)
);

create table if not exists public.review (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.login(id) on delete cascade,
  produk_id uuid not null references public.produk(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  komentar text,
  created_at timestamptz not null default now()
);

create index if not exists idx_produk_kategori on public.produk(kategori);
create index if not exists idx_produk_nama_produk on public.produk using gin (to_tsvector('simple', nama_produk));
create index if not exists idx_transaksi_user_id on public.transaksi(user_id);
create index if not exists idx_detail_transaksi_transaksi_id on public.detail_transaksi(transaksi_id);

alter table public.login enable row level security;
alter table public.produk enable row level security;
alter table public.transaksi enable row level security;
alter table public.detail_transaksi enable row level security;
alter table public.wishlist enable row level security;
alter table public.review enable row level security;

create policy "Produk readable by everyone" on public.produk for select using (true);
create policy "Login readable by authenticated users" on public.login for select to authenticated using (true);
create policy "Transaksi readable by authenticated users" on public.transaksi for select to authenticated using (true);
create policy "Detail transaksi readable by authenticated users" on public.detail_transaksi for select to authenticated using (true);

insert into public.produk (kode_produk, nama_produk, kategori, harga, stok, foto_url, deskripsi) values
('PRD-001', 'Headphone Wireless Premium', 'Elektronik', 350000, 15, null, 'Headphone bluetooth dengan kualitas suara jernih.'),
('PRD-002', 'Sneakers Casual Putih', 'Fashion', 425000, 8, null, 'Sepatu casual nyaman untuk kegiatan harian.'),
('PRD-003', 'Tas Ransel Laptop', 'Aksesoris', 275000, 12, null, 'Tas laptop anti air dengan banyak kompartemen.')
on conflict (kode_produk) do nothing;
