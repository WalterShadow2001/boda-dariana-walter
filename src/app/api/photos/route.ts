import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddingConfig } from "@/lib/wedding-config";

// GET /api/photos - Lista de fotos (público)
export async function GET() {
  try {
    const photos = await db.photo.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
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

// POST /api/photos - Subir foto a Uploadcare y guardar URL (requiere auth)
// Sin límites: las imágenes se suben a la CDN de Uploadcare y se muestran automáticamente
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

    // La data viene como base64 data URL: data:image/png;base64,iVBOR...
    const match = data.match(/^data:(.+?);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Formato de imagen inválido" },
        { status: 400 }
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Límite: 100MB (límite de Uploadcare en plan demo)
    if (buffer.length > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen es demasiado grande (máx 100MB)" },
        { status: 400 }
      );
    }

    // Determinar extensión
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/bmp": "bmp",
      "image/svg+xml": "svg",
    };
    const ext = extMap[mimeType] || "jpg";
    const filename = `photo-${Date.now()}.${ext}`;

    // Subir a Uploadcare (CDN gratuito, sin límites prácticos)
    // Usamos la clave pública demo si no hay una configurada
    const pubKey = weddingConfig.uploadcarePublicKey || "demopublickey";

    const formData = new FormData();
    formData.append("UPLOADCARE_PUB_KEY", pubKey);
    formData.append("UPLOADCARE_STORE", "1");
    const blob = new Blob([buffer], { type: mimeType });
    formData.append("file", blob, filename);

    const ucRes = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    });

    if (!ucRes.ok) {
      console.error("Uploadcare error:", await ucRes.text());
      return NextResponse.json(
        { error: "Error al subir al servicio de imágenes" },
        { status: 502 }
      );
    }

    const ucData = await ucRes.json() as { file?: string };
    const fileId = ucData.file;
    if (!fileId) {
      return NextResponse.json(
        { error: "Respuesta inválida del servicio de imágenes" },
        { status: 502 }
      );
    }

    // URL pública de la imagen en la CDN de Uploadcare
    const publicUrl = `https://ucarecdn.com/${fileId}/`;

    // Guardar solo la URL en la base de datos (sin la imagen pesada)
    const photo = await db.photo.create({
      data: {
        url: publicUrl,
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

// DELETE /api/photos?id=xxx - Eliminar foto de la galería (requiere auth)
// Nota: La imagen queda en la CDN de Uploadcare pero se quita de la galería
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
