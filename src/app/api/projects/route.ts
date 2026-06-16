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

      return {
        id: projectId,
        name: p.name,
        description: p.description || '',
        created_at: p.created_at,
        updated_at: p.updated_at,
        sales: projectSales,
        expenses: projectExpenses,
      }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await turso.execute({
      sql: 'INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      args: [id, name, description || '', now, now]
    })

    const project = {
      id,
      name,
      description: description || '',
      created_at: now,
      updated_at: now,
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
