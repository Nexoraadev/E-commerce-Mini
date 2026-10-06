import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { productRepository } from "@/repositories/product.repository";

type Params = { params: Promise<{ id: string }> };

// POST /api/products/:id/upload  (Admin only)
// Menerima multipart/form-data dengan field "image"
export async function POST(request: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasSupabaseConfig || !supabase) {
      return NextResponse.json({ error: "Storage belum dikonfigurasi (Supabase)" }, { status: 503 });
    }

    const { id } = await params;
    const product = await productRepository.findById(id);
    if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "File gambar wajib disertakan" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format file harus JPG, PNG, atau WebP" }, { status: 400 });
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const fileName = `products/${id}-${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("product-image")
      .upload(fileName, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: `Upload gagal: ${uploadError.message}` }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-image")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Simpan URL gambar ke database
    const updated = await productRepository.update(id, { image: imageUrl });
    return NextResponse.json({ product: updated, imageUrl });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload gagal" }, { status: 500 });
  }
}
