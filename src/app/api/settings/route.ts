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

// Resuelve un enlace acortado de Google Maps (goo.gl, maps.app.goo.gl)
// y extrae las coordenadas reales
async function resolveMapsUrl(url: string): Promise<{ lat?: string; lng?: string; finalUrl?: string }> {
  try {
    // 1. Si la URL ya contiene coordenadas en formato @lat,lng
    const directMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (directMatch) {
      return { lat: directMatch[1], lng: directMatch[2], finalUrl: url };
    }

    // 2. Si la URL tiene parámetro q=lat,lng (formato común después de redirect)
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      return { lat: qMatch[1], lng: qMatch[2], finalUrl: url };
    }

    // 3. Si la URL tiene ll=lat,lng (formato común)
    const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      return { lat: llMatch[1], lng: llMatch[2], finalUrl: url };
    }

    // 4. Si es enlace corto (goo.gl, maps.app.goo.gl), seguir redirects
    if (url.includes("goo.gl") || url.includes("maps.app.goo.gl")) {
      console.log("Resolving short URL:", url);
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0" },
      });
      const finalUrl = res.url;
      console.log("Final URL:", finalUrl);

      // Buscar en la URL final
      const finalMatch = finalUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (finalMatch) {
        return { lat: finalMatch[1], lng: finalMatch[2], finalUrl };
      }
      const finalAtMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (finalAtMatch) {
        return { lat: finalAtMatch[1], lng: finalAtMatch[2], finalUrl };
      }
      const finalLlMatch = finalUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (finalLlMatch) {
        return { lat: finalLlMatch[1], lng: finalLlMatch[2], finalUrl };
      }

      console.log("No se pudieron extraer coordenadas de:", finalUrl);
      return { finalUrl };
    }

    return { finalUrl: url };
  } catch (e) {
    console.error("Error resolving maps URL:", e);
    return { finalUrl: url };
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
    console.log("Settings body received:", JSON.stringify(body).substring(0, 300));

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

    // Coordenadas: priorizar las que vienen del cliente
    if (venueLat) {
      updates.push({ key: "venueLat", value: String(venueLat) });
    }
    if (venueLng) {
      updates.push({ key: "venueLng", value: String(venueLng) });
    }

    // Si hay URL de Maps pero no coordenadas, intentar extraerlas (resolviendo enlaces cortos)
    if (venueMapsUrl && !venueLat && !venueLng) {
      console.log("Extrayendo coordenadas del enlace...");
      const coords = await resolveMapsUrl(venueMapsUrl);
      if (coords.lat && coords.lng) {
        console.log("✓ Coordenadas extraídas:", coords.lat, coords.lng);
        updates.push({ key: "venueLat", value: coords.lat });
        updates.push({ key: "venueLng", value: coords.lng });
      } else {
        console.log("✗ No se pudieron extraer coordenadas");
      }
    }

    console.log(`Updating ${updates.length} settings:`, updates.map(u => `${u.key}=${u.value.substring(0, 50)}`).join(", "));

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
