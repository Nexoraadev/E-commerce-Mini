import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const hashedPassword = await bcrypt.hash("password", 10);

  const admin = await prisma.user.create({
    data: {
      userName: "admin",
      email: "admin@minicommerce.test",
      password: hashedPassword,
      namaLengkap: "Administrator",
      role: Role.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      userName: "customer",
      email: "customer@minicommerce.test",
      password: hashedPassword,
      namaLengkap: "Customer Tester",
      role: Role.CUSTOMER,
    },
  });

  console.log("Users created:", { admin: admin.email, customer: customer.email });

  // Create Categories
  const categoryData = [
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Food", slug: "food" },
    { name: "Accessories", slug: "accessories" },
  ];

  const categoriesMap: Record<string, string> = {};

  for (const cat of categoryData) {
    const created = await prisma.category.create({
      data: cat,
    });
    categoriesMap[cat.name] = created.id;
  }

  console.log("Categories created:", Object.keys(categoriesMap));

  // Create 10 Products
  const productsData = [
    {
      kodeProduk: "PRD-ELEC-001",
      namaProduk: "Laptop Gaming Pro 15 inch",
      slug: slugify("Laptop Gaming Pro 15 inch", { lower: true }),
      harga: 14999000,
      stok: 10,
      deskripsi: "Laptop gaming performa tinggi dengan prosesor generasi terbaru dan grafis RTX.",
      categoryName: "Electronics",
    },
    {
      kodeProduk: "PRD-ELEC-002",
      namaProduk: "Smartphone Flagship 5G",
      slug: slugify("Smartphone Flagship 5G", { lower: true }),
      harga: 8499000,
      stok: 15,
      deskripsi: "Smartphone dengan kamera 108MP, layar AMOLED 120Hz, dan pengisian daya super cepat.",
      categoryName: "Electronics",
    },
    {
      kodeProduk: "PRD-ELEC-003",
      namaProduk: "Headphone Wireless ANC",
      slug: slugify("Headphone Wireless ANC", { lower: true }),
      harga: 1299000,
      stok: 20,
      deskripsi: "Headphone nirkabel dengan fitur Active Noise Cancellation dan baterai tahan hingga 30 jam.",
      categoryName: "Electronics",
    },
    {
      kodeProduk: "PRD-FASH-001",
      namaProduk: "Jaket Hoodie Premium",
      slug: slugify("Jaket Hoodie Premium", { lower: true }),
      harga: 349000,
      stok: 30,
      deskripsi: "Jaket hoodie berbahan fleecy hangat, nyaman dipakai sehari-hari.",
      categoryName: "Fashion",
    },
    {
      kodeProduk: "PRD-FASH-002",
      namaProduk: "Sepatu Sneakers Casual",
      slug: slugify("Sepatu Sneakers Casual", { lower: true }),
      harga: 599000,
      stok: 25,
      deskripsi: "Sepatu sneakers bergaya minimalis dengan insole empuk dan sol karet tahan lama.",
      categoryName: "Fashion",
    },
    {
      kodeProduk: "PRD-FASH-003",
      namaProduk: "Kemeja Denim Slim Fit",
      slug: slugify("Kemeja Denim Slim Fit", { lower: true }),
      harga: 279000,
      stok: 18,
      deskripsi: "Kemeja denim gaya kasual dengan potongan slim fit modern.",
      categoryName: "Fashion",
    },
    {
      kodeProduk: "PRD-FOOD-001",
      namaProduk: "Kopi Arabika Gayo 500g",
      slug: slugify("Kopi Arabika Gayo 500g", { lower: true }),
      harga: 85000,
      stok: 50,
      deskripsi: "Biji kopi sangrai asli Aceh Gayo dengan cita rasa fruity dan aroma yang harum.",
      categoryName: "Food",
    },
    {
      kodeProduk: "PRD-FOOD-002",
      namaProduk: "Cokelat Artisan Dark 70%",
      slug: slugify("Cokelat Artisan Dark 70%", { lower: true }),
      harga: 45000,
      stok: 60,
      deskripsi: "Cokelat hitam organik asli buatan tangan tanpa bahan pengawet.",
      categoryName: "Food",
    },
    {
      kodeProduk: "PRD-ACCS-001",
      namaProduk: "Jam Tangan Minimalis Classic",
      slug: slugify("Jam Tangan Minimalis Classic", { lower: true }),
      harga: 899000,
      stok: 12,
      deskripsi: "Jam tangan bermesin kuarsa dengan tali kulit asli dan kaca tahan gores.",
      categoryName: "Accessories",
    },
    {
      kodeProduk: "PRD-ACCS-002",
      namaProduk: "Tas Ransel Waterproof",
      slug: slugify("Tas Ransel Waterproof", { lower: true }),
      harga: 399000,
      stok: 22,
      deskripsi: "Tas ransel multifungsi tahan air dilengkapi slot laptop 15.6 inch.",
      categoryName: "Accessories",
    },
  ];

  for (const item of productsData) {
    const { categoryName, ...prod } = item;
    await prisma.product.create({
      data: {
        ...prod,
        categoryId: categoriesMap[categoryName],
      },
    });
  }

  console.log("10 Products successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
