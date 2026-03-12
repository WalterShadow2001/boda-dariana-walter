import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const WEDDING_PASSWORD = '2303'

// POST - Login
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { password } = body

    if (password !== WEDDING_PASSWORD) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    // Actualizar sesión como autenticada
    const { error } = await supabase
      .from('auth_session')
      .update({ is_authenticated: true })
      .eq('id', 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, authenticated: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// GET - Verificar sesión
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: session, error } = await supabase
      .from('auth_session')
      .select('is_authenticated')
      .eq('id', 1)
      .single()

    if (error) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ authenticated: session?.is_authenticated || false })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('auth_session')
      .update({ is_authenticated: false })
      .eq('id', 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
