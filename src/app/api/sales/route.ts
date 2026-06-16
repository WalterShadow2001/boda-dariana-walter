import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// POST - Crear nueva venta
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, concept, amount, client, status, quantity, delivery_date } = body

    if (!project_id || !concept || amount === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await turso.execute({
      sql: `INSERT INTO sales (id, project_id, concept, amount, client, status, quantity, delivery_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        project_id,
        concept,
        amount,
        client || '',
        status || 'pending',
        quantity || 1,
        delivery_date || null,
        now,
      ]
    })

    const sale = {
      id,
      project_id,
      concept,
      amount: Number(amount),
      client: client || '',
      status: status || 'pending',
      quantity: quantity || 1,
      delivery_date: delivery_date || null,
      created_at: now,
    }

    return NextResponse.json({ sale })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
