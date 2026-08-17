import { NextRequest, NextResponse } from "next/server";
import { weddingConfig } from "@/lib/wedding-config";

// POST /api/admin/verify - Verificar contraseña
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (password === weddingConfig.adminPassword) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { error: "Contraseña incorrecta" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Petición inválida" },
      { status: 400 }
    );
  }
}
