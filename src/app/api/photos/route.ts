import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddingConfig } from "@/lib/wedding-config";

// GET /api/photos - Lista de fotos (público)
export async function GET() {
  try {
    const photos = await db.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return NextResponse.json(
      { error: "Error al obtener fotos" },
      { status: 500 }
    );
  }
}

// POST /api/photos - Subir foto (requiere auth)
export async function POST(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  if (auth !== weddingConfig.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { data, caption } = body;

    if (!data || typeof data !== "string") {
      return NextResponse.json(
        { error: "Imagen es requerida" },
        { status: 400 }
      );
    }

    // Limit to 5MB base64 (~6.7MB)
    if (data.length > 7_000_000) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande (máx 5MB)" },
        { status: 400 }
      );
    }

    const photo = await db.photo.create({
      data: {
        data,
        caption: caption?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error("Error uploading photo:", error);
    return NextResponse.json(
      { error: "Error al subir la foto" },
      { status: 500 }
    );
  }
}

// DELETE /api/photos?id=xxx - Eliminar foto (requiere auth)
export async function DELETE(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  if (auth !== weddingConfig.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      );
    }

    await db.photo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Error al eliminar la foto" },
      { status: 500 }
    );
  }
}
