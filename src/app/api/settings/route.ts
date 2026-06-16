import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// GET - Obtener configuración
export async function GET() {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM settings WHERE id = 1',
      args: []
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ settings: { id: 1, savings_goal: 0, theme: null } })
    }

    const row = result.rows[0]
    const settings = {
      id: row.id,
      savings_goal: Number(row.savings_goal),
      theme: row.theme ? JSON.parse(row.theme as string) : null,
      updated_at: row.updated_at,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT - Actualizar configuración
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { savings_goal, theme } = body

    const now = new Date().toISOString()

    if (savings_goal !== undefined && theme) {
      await turso.execute({
        sql: 'UPDATE settings SET savings_goal = ?, theme = ?, updated_at = ? WHERE id = 1',
        args: [savings_goal, JSON.stringify(theme), now]
      })
    } else if (savings_goal !== undefined) {
      await turso.execute({
        sql: 'UPDATE settings SET savings_goal = ?, updated_at = ? WHERE id = 1',
        args: [savings_goal, now]
      })
    } else if (theme) {
      await turso.execute({
        sql: 'UPDATE settings SET theme = ?, updated_at = ? WHERE id = 1',
        args: [JSON.stringify(theme), now]
      })
    }

    const result = await turso.execute({
      sql: 'SELECT * FROM settings WHERE id = 1',
      args: []
    })

    const row = result.rows[0]
    const settings = {
      id: row.id,
      savings_goal: Number(row.savings_goal),
      theme: row.theme ? JSON.parse(row.theme as string) : null,
      updated_at: row.updated_at,
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
