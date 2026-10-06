import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { categoryService } from "@/services/category.service";
import { getAuthSession } from "@/lib/auth";

// GET /api/categories  (public)
export async function GET() {
  try {
    const categories = await categoryService.list();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Gagal mengambil kategori" }, { status: 500 });
  }
}

// POST /api/categories  (Admin only)
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const category = await categoryService.create(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal membuat kategori" }, { status: 400 });
  }
}
