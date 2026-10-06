import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { categoryService } from "@/services/category.service";
import { getAuthSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

// PUT /api/categories/:id  (Admin only)
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const category = await categoryService.update(id, body);
    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengupdate kategori" }, { status: 400 });
  }
}

// DELETE /api/categories/:id  (Admin only)
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await categoryService.remove(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus kategori" }, { status: 400 });
  }
}
