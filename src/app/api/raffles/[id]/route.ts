import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// PUT - Actualizar rifa (agregar participante, sortear ganador, etc.)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params
    const { action } = body

    // Action: add_participant
    if (action === 'add_participant') {
      const { number, name, phone } = body
      if (!number || !name) {
        return NextResponse.json({ error: 'Número y nombre son requeridos' }, { status: 400 })
      }

      // Check if number is already taken
      const existing = await turso.execute({
        sql: 'SELECT id FROM raffle_participants WHERE raffle_id = ? AND number = ?',
        args: [id, number]
      })

      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Este número ya está asignado' }, { status: 409 })
      }

      const participantId = crypto.randomUUID()
      const now = new Date().toISOString()

      await turso.execute({
        sql: `INSERT INTO raffle_participants (id, raffle_id, number, name, phone, is_paid, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [participantId, id, number, name, phone || '', 0, now]
      })

      return NextResponse.json({
        participant: {
          id: participantId,
          raffle_id: id,
          number: Number(number),
          name,
          phone: phone || '',
          is_paid: false,
          created_at: now,
        }
      })
    }

    // Action: update_participant (mark as paid, change name, etc.)
    if (action === 'update_participant') {
      const { participant_id, name, phone, is_paid } = body

      const updates: string[] = []
      const args: (string | number | boolean)[] = []

      if (name !== undefined) { updates.push('name = ?'); args.push(name) }
      if (phone !== undefined) { updates.push('phone = ?'); args.push(phone) }
      if (is_paid !== undefined) { updates.push('is_paid = ?'); args.push(is_paid ? 1 : 0) }

      if (updates.length === 0) {
        return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 })
      }

      args.push(participant_id)
      args.push(id)

      await turso.execute({
        sql: `UPDATE raffle_participants SET ${updates.join(', ')} WHERE id = ? AND raffle_id = ?`,
        args
      })

      return NextResponse.json({ success: true })
    }

    // Action: remove_participant
    if (action === 'remove_participant') {
      const { participant_id } = body

      await turso.execute({
        sql: 'DELETE FROM raffle_participants WHERE id = ? AND raffle_id = ?',
        args: [participant_id, id]
      })

      return NextResponse.json({ success: true })
    }

    // Action: spin_wheel (pick winner)
    if (action === 'spin_wheel') {
      // Get all participants
      const participants = await turso.execute({
        sql: 'SELECT number, name FROM raffle_participants WHERE raffle_id = ?',
        args: [id]
      })

      if (participants.rows.length === 0) {
        return NextResponse.json({ error: 'No hay participantes en la rifa' }, { status: 400 })
      }

      // Pick a random winner from participants
      const randomIndex = Math.floor(Math.random() * participants.rows.length)
      const winner = participants.rows[randomIndex]
      const winnerNumber = Number(winner.number)

      // Update raffle with winner
      const now = new Date().toISOString()
      await turso.execute({
        sql: 'UPDATE raffles SET winner_number = ?, status = \'completed\', updated_at = ? WHERE id = ?',
        args: [winnerNumber, now, id]
      })

      return NextResponse.json({
        winner: {
          number: winnerNumber,
          name: winner.name,
        }
      })
    }

    // Action: update raffle info (name, amount, total_numbers)
    if (action === 'update_info') {
      const { name, description, amount, total_numbers } = body
      const now = new Date().toISOString()

      const updates: string[] = ['updated_at = ?']
      const args: (string | number)[] = [now]

      if (name !== undefined) { updates.push('name = ?'); args.push(name) }
      if (description !== undefined) { updates.push('description = ?'); args.push(description) }
      if (amount !== undefined) { updates.push('amount = ?'); args.push(amount) }
      if (total_numbers !== undefined) { updates.push('total_numbers = ?'); args.push(total_numbers) }

      args.push(id)

      await turso.execute({
        sql: `UPDATE raffles SET ${updates.join(', ')} WHERE id = ?`,
        args
      })

      return NextResponse.json({ success: true })
    }

    // Action: reset raffle (clear winner, set active again)
    if (action === 'reset') {
      const now = new Date().toISOString()
      await turso.execute({
        sql: 'UPDATE raffles SET winner_number = NULL, status = \'active\', updated_at = ? WHERE id = ?',
        args: [now, id]
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (error) {
    console.error('Error updating raffle:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// DELETE - Eliminar rifa
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await turso.execute({
      sql: 'DELETE FROM raffle_participants WHERE raffle_id = ?',
      args: [id]
    })

    await turso.execute({
      sql: 'DELETE FROM raffles WHERE id = ?',
      args: [id]
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting raffle:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
