import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { productService } from "@/services/product.service";
import { getAuthSession } from "@/lib/auth";

// GET /api/products?search=&category=&page=&limit=
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 12;

    const result = await productService.list({ search, category, page, limit });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}

// POST /api/products  (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const product = await productService.create(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat produk" }, { status: 400 });
  }
}
