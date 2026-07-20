import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// PUT - Actualizar proyecto
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const { name, description } = body

    const now = new Date().toISOString()

    await turso.execute({
      sql: 'UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?',
      args: [name, description, now, id]
    })

    const project = {
      id,
      name,
      description,
      updated_at: now,
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar proyecto
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete associated sales and expenses first
    await turso.execute({
      sql: 'DELETE FROM sales WHERE project_id = ?',
      args: [id]
    })

    await turso.execute({
      sql: 'DELETE FROM expenses WHERE project_id = ?',
      args: [id]
    })

    await turso.execute({
      sql: 'DELETE FROM projects WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
