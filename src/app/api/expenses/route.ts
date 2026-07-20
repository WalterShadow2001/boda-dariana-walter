import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// POST - Crear nuevo gasto
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, concept, amount, notes, quantity } = body

    if (!project_id || !concept || amount === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await turso.execute({
      sql: `INSERT INTO expenses (id, project_id, concept, amount, notes, quantity, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        project_id,
        concept,
        amount,
        notes || '',
        quantity || 1,
        now,
      ]
    })

    const expense = {
      id,
      project_id,
      concept,
      amount: Number(amount),
      notes: notes || '',
      quantity: quantity || 1,
      created_at: now,
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
