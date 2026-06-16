import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// PUT - Actualizar venta
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const { concept, amount, client, status, quantity, delivery_date } = body

    await turso.execute({
      sql: `UPDATE sales SET concept = ?, amount = ?, client = ?, status = ?, quantity = ?, delivery_date = ? WHERE id = ?`,
      args: [concept, amount, client || '', status, quantity || 1, delivery_date || null, id]
    })

    const sale = {
      id,
      concept,
      amount: Number(amount),
      client: client || '',
      status,
      quantity: quantity || 1,
      delivery_date: delivery_date || null,
    }

    return NextResponse.json({ sale })
  } catch (error) {
    console.error('Error updating sale:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar venta
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await turso.execute({
      sql: 'DELETE FROM sales WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sale:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
