import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Obtener configuración
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// PUT - Actualizar configuración
export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { savings_goal, theme } = body

    const updateData: Record<string, unknown> = {}
    if (savings_goal !== undefined) updateData.savings_goal = savings_goal
    if (theme) updateData.theme = theme

    const { data: settings, error } = await supabase
      .from('settings')
      .update(updateData)
      .eq('id', 1)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
