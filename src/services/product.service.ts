import slugify from "slugify";
import { productRepository } from "@/repositories/product.repository";
import { productSchema, type ProductInput } from "@/lib/validations/product";

export const productService = {
  async list(params?: { search?: string; category?: string; page?: number; limit?: number }) {
    const [products, total] = await Promise.all([
      productRepository.findMany(params),
      productRepository.count(params),
    ]);
    return { products, total };
  },
  detailBySlug(slug: string) {
    return productRepository.findBySlug(slug);
  },
  detailById(id: string) {
    return productRepository.findById(id);
  },
  async create(input: ProductInput) {
    const data = productSchema.parse(input);
    const slug = slugify(data.namaProduk, { lower: true, strict: true });
    return productRepository.create({
      kodeProduk: data.kodeProduk,
      namaProduk: data.namaProduk,
      slug,
      harga: data.harga,
      stok: data.stok,
      deskripsi: data.deskripsi,
      image: data.image,
      category: { connect: { id: data.categoryId } },
    });
  },
  async update(id: string, input: ProductInput) {
    const data = productSchema.parse(input);
    const slug = slugify(data.namaProduk, { lower: true, strict: true });
    return productRepository.update(id, {
      kodeProduk: data.kodeProduk,
      namaProduk: data.namaProduk,
      slug,
      harga: data.harga,
      stok: data.stok,
      deskripsi: data.deskripsi,
      image: data.image,
      category: { connect: { id: data.categoryId } },
    });
  },
  remove(id: string) {
    return productRepository.delete(id);
  },
};
