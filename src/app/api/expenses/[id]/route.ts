import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// PUT - Actualizar gasto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const { concept, amount, notes, quantity } = body

    await turso.execute({
      sql: `UPDATE expenses SET concept = ?, amount = ?, notes = ?, quantity = ? WHERE id = ?`,
      args: [concept, amount, notes || '', quantity || 1, id]
    })

    const expense = {
      id,
      concept,
      amount: Number(amount),
      notes: notes || '',
      quantity: quantity || 1,
    }

    return NextResponse.json({ expense })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar gasto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await turso.execute({
      sql: 'DELETE FROM expenses WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
