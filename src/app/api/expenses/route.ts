import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Crear nuevo gasto
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { project_id, concept, amount, notes } = body

    if (!project_id || !concept || amount === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([{ 
        project_id, 
        concept, 
        amount, 
        notes: notes || '' 
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expense })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
