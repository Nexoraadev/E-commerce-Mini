import type { Product, CreateProductInput, UpdateProductInput } from "../entities/product";

export interface ProductRepository {
  list(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(input: CreateProductInput): Promise<Product>;
  update(id: string, input: UpdateProductInput): Promise<Product>;
  remove(id: string): Promise<void>;
}
