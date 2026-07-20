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
    const { name, description, amount_per_number, total_numbers } = body

    const now = new Date().toISOString()

    const updates: string[] = ['updated_at = ?']
    const args: (string | number)[] = [now]

    if (name !== undefined) { updates.push('name = ?'); args.push(name) }
    if (description !== undefined) { updates.push('description = ?'); args.push(description) }
    if (amount_per_number !== undefined) { updates.push('amount_per_number = ?'); args.push(amount_per_number) }
    if (total_numbers !== undefined) { updates.push('total_numbers = ?'); args.push(total_numbers) }

    args.push(id)

    await turso.execute({
      sql: `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      args
    })

    // If rifa, also update the linked raffle
    const projectResult = await turso.execute({
      sql: 'SELECT type FROM projects WHERE id = ?',
      args: [id]
    })

    if (projectResult.rows.length > 0 && projectResult.rows[0].type === 'raffle') {
      const raffleUpdates: string[] = ['updated_at = ?']
      const raffleArgs: (string | number)[] = [now]

      if (name !== undefined) { raffleUpdates.push('name = ?'); raffleArgs.push(name) }
      if (description !== undefined) { raffleUpdates.push('description = ?'); raffleArgs.push(description) }
      if (amount_per_number !== undefined) { raffleUpdates.push('amount = ?'); raffleArgs.push(amount_per_number) }
      if (total_numbers !== undefined) { raffleUpdates.push('total_numbers = ?'); raffleArgs.push(total_numbers) }

      raffleArgs.push(id)

      await turso.execute({
        sql: `UPDATE raffles SET ${raffleUpdates.join(', ')} WHERE project_id = ?`,
        args: raffleArgs
      })
    }

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

// DELETE - Eliminar proyecto (con cascade)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Delete raffle participants first (via raffles linked to this project)
    await turso.execute({
      sql: 'DELETE FROM raffle_participants WHERE raffle_id IN (SELECT id FROM raffles WHERE project_id = ?)',
      args: [id]
    })

    // Delete raffles linked to this project
    await turso.execute({
      sql: 'DELETE FROM raffles WHERE project_id = ?',
      args: [id]
    })

    // Delete associated sales and expenses
    await turso.execute({
      sql: 'DELETE FROM sales WHERE project_id = ?',
      args: [id]
    })

    await turso.execute({
      sql: 'DELETE FROM expenses WHERE project_id = ?',
      args: [id]
    })

    // Delete the project itself
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
