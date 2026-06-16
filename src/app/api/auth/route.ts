import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

const WEDDING_PASSWORD = '2303'

// POST - Login
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { password } = body

    if (password !== WEDDING_PASSWORD) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
    }

    await turso.execute({
      sql: 'UPDATE auth_session SET is_authenticated = 1, updated_at = datetime(\'now\') WHERE id = 1',
      args: []
    })

    return NextResponse.json({ success: true, authenticated: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// GET - Verificar sesión
export async function GET() {
  try {
    const result = await turso.execute({
      sql: 'SELECT is_authenticated FROM auth_session WHERE id = 1',
      args: []
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({ authenticated: Boolean(result.rows[0].is_authenticated) })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    await turso.execute({
      sql: 'UPDATE auth_session SET is_authenticated = 0, updated_at = datetime(\'now\') WHERE id = 1',
      args: []
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
