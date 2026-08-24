import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddingConfig } from "@/lib/wedding-config";

// POST /api/photos/reorder - Reordenar fotos
// Body: { photos: [{ id: string, order: number }] }
export async function POST(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  if (auth !== weddingConfig.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { photos } = body as { photos: { id: string; order: number }[] };

    if (!Array.isArray(photos)) {
      return NextResponse.json(
        { error: "Formato inválido" },
        { status: 400 }
      );
    }

    // Actualizar el orden de cada foto en una transacción
    await db.$transaction(
      photos.map((p) =>
        db.photo.update({
          where: { id: p.id },
          data: { order: p.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering photos:", error);
    return NextResponse.json(
      { error: "Error al reordenar" },
      { status: 500 }
    );
  }
}
