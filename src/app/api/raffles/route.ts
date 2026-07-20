import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// GET - Obtener todas las rifas de un proyecto
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const project_id = searchParams.get('project_id')

    if (!project_id) {
      return NextResponse.json({ error: 'project_id es requerido' }, { status: 400 })
    }

    const rafflesResult = await turso.execute({
      sql: 'SELECT * FROM raffles WHERE project_id = ? ORDER BY created_at DESC',
      args: [project_id]
    })

    const participantsResult = await turso.execute({
      sql: 'SELECT * FROM raffle_participants WHERE raffle_id IN (SELECT id FROM raffles WHERE project_id = ?) ORDER BY number ASC',
      args: [project_id]
    })

    const raffles = rafflesResult.rows.map((r) => {
      const raffleId = r.id as string
      const participants = participantsResult.rows
        .filter((p) => p.raffle_id === raffleId)
        .map((p) => ({
          id: p.id,
          raffle_id: p.raffle_id,
          number: Number(p.number),
          name: p.name,
          phone: p.phone || '',
          is_paid: Boolean(p.is_paid),
          created_at: p.created_at,
        }))

      return {
        id: raffleId,
        project_id: r.project_id,
        name: r.name,
        description: r.description || '',
        amount: Number(r.amount),
        total_numbers: Number(r.total_numbers),
        winner_number: r.winner_number !== null ? Number(r.winner_number) : null,
        status: r.status || 'active',
        created_at: r.created_at,
        updated_at: r.updated_at,
        participants,
      }
    })

    return NextResponse.json({ raffles })
  } catch (error) {
    console.error('Error fetching raffles:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear nueva rifa
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { project_id, name, description, amount, total_numbers } = body

    if (!project_id || !name || amount === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await turso.execute({
      sql: `INSERT INTO raffles (id, project_id, name, description, amount, total_numbers, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      args: [id, project_id, name, description || '', amount, total_numbers || 100, now, now]
    })

    const raffle = {
      id,
      project_id,
      name,
      description: description || '',
      amount: Number(amount),
      total_numbers: Number(total_numbers) || 100,
      winner_number: null,
      status: 'active',
      created_at: now,
      updated_at: now,
      participants: [],
    }

    return NextResponse.json({ raffle })
  } catch (error) {
    console.error('Error creating raffle:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
