import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddingConfig } from "@/lib/wedding-config";

// GET /api/settings - Obtener configuración (público)
// Devuelve la configuración dinámica si existe, si no, los defaults del archivo
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    // Combinar defaults con valores guardados
    const response = {
      weddingDate: settingsMap.weddingDate || weddingConfig.weddingDate,
      venueName: settingsMap.venueName || weddingConfig.venue.name,
      venueAddress: settingsMap.venueAddress || weddingConfig.venue.address,
      venueMapsUrl: settingsMap.venueMapsUrl || weddingConfig.venue.mapsUrl,
      venueLat: settingsMap.venueLat || weddingConfig.venue.lat.toString(),
      venueLng: settingsMap.venueLng || weddingConfig.venue.lng.toString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching settings:", error);
    // Si hay error, devolver defaults
    return NextResponse.json({
      weddingDate: weddingConfig.weddingDate,
      venueName: weddingConfig.venue.name,
      venueAddress: weddingConfig.venue.address,
      venueMapsUrl: weddingConfig.venue.mapsUrl,
      venueLat: weddingConfig.venue.lat.toString(),
      venueLng: weddingConfig.venue.lng.toString(),
    });
  }
}

// POST /api/settings - Guardar configuración (requiere auth)
export async function POST(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  if (auth !== weddingConfig.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      weddingDate,
      venueName,
      venueAddress,
      venueMapsUrl,
      venueLat,
      venueLng,
    } = body;

    // Validar fecha si se proporciona
    if (weddingDate && isNaN(Date.parse(weddingDate))) {
      return NextResponse.json(
        { error: "Fecha inválida" },
        { status: 400 }
      );
    }

    // Si venueMapsUrl viene, extraer coordenadas automáticamente
    let finalLat = venueLat;
    let finalLng = venueLng;

    if (venueMapsUrl && !venueLat) {
      // Intentar extraer coordenadas de la URL de Google Maps
      const coordMatch = venueMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        finalLat = coordMatch[1];
        finalLng = coordMatch[2];
      } else {
        // Si no se pueden extraer, usar coordenadas por defecto
        finalLat = weddingConfig.venue.lat.toString();
        finalLng = weddingConfig.venue.lng.toString();
      }
    }

    const updates: { key: string; value: string }[] = [];
    if (weddingDate) updates.push({ key: "weddingDate", value: weddingDate });
    if (venueName) updates.push({ key: "venueName", value: venueName });
    if (venueAddress) updates.push({ key: "venueAddress", value: venueAddress });
    if (venueMapsUrl) updates.push({ key: "venueMapsUrl", value: venueMapsUrl });
    if (finalLat) updates.push({ key: "venueLat", value: finalLat });
    if (finalLng) updates.push({ key: "venueLng", value: finalLng });

    // Guardar cada setting (upsert)
    for (const { key, value } of updates) {
      await db.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Error al guardar la configuración" },
      { status: 500 }
    );
  }
}
