import slugify from "slugify";
import { categoryRepository } from "@/repositories/category.repository";
import { categorySchema, type CategoryInput } from "@/lib/validations/category";

export const categoryService = {
  list() {
    return categoryRepository.findMany();
  },
  async create(input: CategoryInput) {
    const data = categorySchema.parse(input);
    const slug = data.slug || slugify(data.name, { lower: true, strict: true });
    const existing = await categoryRepository.findBySlug(slug);
    if (existing) throw new Error("Slug kategori sudah digunakan");
    return categoryRepository.create({ name: data.name, slug });
  },
  async update(id: string, input: CategoryInput) {
    const data = categorySchema.parse(input);
    const slug = data.slug || slugify(data.name, { lower: true, strict: true });
    return categoryRepository.update(id, { name: data.name, slug });
  },
  async remove(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error("Kategori tidak ditemukan");
    if (category._count.products > 0) throw new Error("Kategori masih digunakan produk");
    return categoryRepository.delete(id);
  },
};
