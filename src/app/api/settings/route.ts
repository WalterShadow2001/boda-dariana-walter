import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddingConfig } from "@/lib/wedding-config";

// GET /api/settings - Obtener configuración (público)
export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

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
    console.log("Settings body received:", JSON.stringify(body).substring(0, 200));

    const {
      weddingDate,
      venueName,
      venueAddress,
      venueMapsUrl,
      venueLat,
      venueLng,
    } = body as {
      weddingDate?: string;
      venueName?: string;
      venueAddress?: string;
      venueMapsUrl?: string;
      venueLat?: string;
      venueLng?: string;
    };

    // Validar fecha si se proporciona
    if (weddingDate && isNaN(Date.parse(weddingDate))) {
      return NextResponse.json(
        { error: "Fecha inválida" },
        { status: 400 }
      );
    }

    // Construir lista de campos a actualizar
    const updates: { key: string; value: string }[] = [];

    if (weddingDate) updates.push({ key: "weddingDate", value: weddingDate });
    if (venueName) updates.push({ key: "venueName", value: venueName });
    if (venueAddress) updates.push({ key: "venueAddress", value: venueAddress });
    if (venueMapsUrl) updates.push({ key: "venueMapsUrl", value: venueMapsUrl });

    // Coordenadas: usar las que vienen, si no, mantener las existentes en DB
    // o usar defaults del config
    if (venueLat) {
      updates.push({ key: "venueLat", value: String(venueLat) });
    }
    if (venueLng) {
      updates.push({ key: "venueLng", value: String(venueLng) });
    }

    // Si hay URL de Maps pero no coordenadas, intentar extraerlas
    if (venueMapsUrl && !venueLat) {
      const coordMatch = venueMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        updates.push({ key: "venueLat", value: coordMatch[1] });
        updates.push({ key: "venueLng", value: coordMatch[2] });
      }
    }

    console.log(`Updating ${updates.length} settings`);

    // Guardar cada setting (upsert) secuencialmente
    for (const { key, value } of updates) {
      try {
        await db.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
        console.log(`  ✓ Saved ${key}`);
      } catch (e) {
        console.error(`  ✗ Error saving ${key}:`, e);
        throw e;
      }
    }

    return NextResponse.json({ success: true, updated: updates.length });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      {
        error: "Error al guardar la configuración",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
