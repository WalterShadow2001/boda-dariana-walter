import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST - Crear nueva venta
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { project_id, concept, amount, client, status } = body

    if (!project_id || !concept || amount === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const { data: sale, error } = await supabase
      .from('sales')
      .insert([{ 
        project_id, 
        concept, 
        amount, 
        client: client || '', 
        status: status || 'pending' 
      }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sale })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
