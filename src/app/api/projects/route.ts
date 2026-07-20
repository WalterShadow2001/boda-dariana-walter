import { turso } from '@/lib/turso'
import { NextResponse } from 'next/server'

// GET - Obtener todos los proyectos con ventas y gastos
export async function GET() {
  try {
    const projectsResult = await turso.execute(
      'SELECT * FROM projects ORDER BY created_at DESC'
    )

    const salesResult = await turso.execute(
      'SELECT * FROM sales'
    )

    const expensesResult = await turso.execute(
      'SELECT * FROM expenses'
    )

    const rafflesResult = await turso.execute(
      'SELECT * FROM raffles'
    )

    const participantsResult = await turso.execute(
      'SELECT * FROM raffle_participants ORDER BY number ASC'
    )

    const projects = projectsResult.rows.map((p) => {
      const projectId = p.id as string
      const projectSales = salesResult.rows
        .filter((s) => s.project_id === projectId)
        .map((s) => ({
          id: s.id,
          project_id: s.project_id,
          concept: s.concept,
          amount: Number(s.amount),
          quantity: Number(s.quantity) || 1,
          client: s.client || '',
          status: s.status || 'pending',
          delivery_date: s.delivery_date || null,
          created_at: s.created_at,
        }))

      const projectExpenses = expensesResult.rows
        .filter((e) => e.project_id === projectId)
        .map((e) => ({
          id: e.id,
          project_id: e.project_id,
          concept: e.concept,
          amount: Number(e.amount),
          quantity: Number(e.quantity) || 1,
          notes: e.notes || '',
          created_at: e.created_at,
        }))

      // For rifa-type projects, include raffle data
      const projectType = (p.type as string) || 'project'
      let raffle = null
      if (projectType === 'raffle') {
        const raffleRow = rafflesResult.rows.find((r) => r.project_id === projectId)
        if (raffleRow) {
          const raffleId = raffleRow.id as string
          const raffleParticipants = participantsResult.rows
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
          raffle = {
            id: raffleId,
            project_id: raffleRow.project_id,
            name: raffleRow.name,
            description: raffleRow.description || '',
            amount: Number(raffleRow.amount),
            total_numbers: Number(raffleRow.total_numbers),
            winner_number: raffleRow.winner_number !== null ? Number(raffleRow.winner_number) : null,
            status: raffleRow.status || 'active',
            created_at: raffleRow.created_at,
            updated_at: raffleRow.updated_at,
            participants: raffleParticipants,
          }
        }
      }

      return {
        id: projectId,
        name: p.name,
        description: p.description || '',
        type: projectType,
        amount_per_number: Number(p.amount_per_number) || 0,
        total_numbers: Number(p.total_numbers) || 100,
        created_at: p.created_at,
        updated_at: p.updated_at,
        sales: projectSales,
        expenses: projectExpenses,
        raffle,
      }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear nuevo proyecto (o rifa)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, type, amount_per_number, total_numbers } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const projectType = type || 'project'
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const amountPerNumber = amount_per_number || 0
    const totalNumbers = total_numbers || 100

    await turso.execute({
      sql: 'INSERT INTO projects (id, name, description, type, amount_per_number, total_numbers, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [id, name, description || '', projectType, amountPerNumber, totalNumbers, now, now]
    })

    // If rifa type, auto-create a raffle linked to this project
    let raffle = null
    if (projectType === 'raffle') {
      const raffleId = crypto.randomUUID()
      await turso.execute({
        sql: `INSERT INTO raffles (id, project_id, name, description, amount, total_numbers, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        args: [raffleId, id, name, description || '', amountPerNumber, totalNumbers, now, now]
      })
      raffle = {
        id: raffleId,
        project_id: id,
        name,
        description: description || '',
        amount: amountPerNumber,
        total_numbers: totalNumbers,
        winner_number: null,
        status: 'active',
        created_at: now,
        updated_at: now,
        participants: [],
      }
    }

    const project = {
      id,
      name,
      description: description || '',
      type: projectType,
      amount_per_number: amountPerNumber,
      total_numbers: totalNumbers,
      created_at: now,
      updated_at: now,
      raffle,
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
