import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Obtener todos los proyectos
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        sales (*),
        expenses (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert([{ name, description: description || '' }])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
