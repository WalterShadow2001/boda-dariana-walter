import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { weddingConfig } from "@/lib/wedding-config";

// POST /api/rsvp - Crear nuevo RSVP (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, attending, guests, message } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      );
    }

    if (typeof attending !== "boolean") {
      return NextResponse.json(
        { error: "Debe indicar si asistirá" },
        { status: 400 }
      );
    }

    const rsvp = await db.rsvp.create({
      data: {
        name: name.trim(),
        attending,
        guests: attending ? Math.max(1, Math.min(20, Number(guests) || 1)) : 0,
        message: message?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, rsvp });
  } catch (error) {
    console.error("Error creating RSVP:", error);
    return NextResponse.json(
      { error: "Error al guardar la confirmación" },
      { status: 500 }
    );
  }
}

// GET /api/rsvp - Lista de RSVPs (requiere auth)
export async function GET(request: NextRequest) {
  const auth = request.headers.get("x-admin-password");
  if (auth !== weddingConfig.adminPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const rsvps = await db.rsvp.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ rsvps });
  } catch (error) {
    console.error("Error fetching RSVPs:", error);
    return NextResponse.json(
      { error: "Error al obtener confirmaciones" },
      { status: 500 }
    );
  }
}
