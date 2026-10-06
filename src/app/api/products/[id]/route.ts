import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { productService } from "@/services/product.service";
import { getAuthSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/products/:id  — cari by UUID dulu, fallback ke slug
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;

    // UUID pattern check
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let product = isUUID
      ? await productService.detailById(id)
      : await productService.detailBySlug(id);

    // fallback: kalau UUID tidak ketemu, coba slug
    if (!product && isUUID) {
      product = await productService.detailBySlug(id);
    }

    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil produk" }, { status: 500 });
  }
}

// PUT /api/products/:id  (Admin only)
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const product = await productService.update(id, body);
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengupdate produk" }, { status: 400 });
  }
}

// DELETE /api/products/:id  (Admin only)
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await productService.remove(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus produk" }, { status: 400 });
  }
}
