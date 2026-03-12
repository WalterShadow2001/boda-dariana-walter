import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Check environment variables
  const envStatus = {
    url: supabaseUrl ? 'SET' : 'NOT SET',
    key: supabaseKey ? 'SET' : 'NOT SET',
    urlValue: supabaseUrl || null,
    keyPrefix: supabaseKey ? supabaseKey.substring(0, 20) + '...' : null
  }
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      error: 'Missing environment variables',
      env: envStatus
    })
  }
  
  // Try to connect
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test 1: Simple query
    const { data: testData, error: testError } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
    
    if (testError) {
      return NextResponse.json({
        status: 'CONNECTION_ERROR',
        error: testError.message,
        code: testError.code,
        details: testError.details,
        hint: testError.hint,
        env: envStatus
      })
    }
    
    // Test 2: Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
    
    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Connection working!',
      env: envStatus,
      projectsCount: projects?.length || 0,
      projects: projects || []
    })
    
  } catch (err) {
    return NextResponse.json({
      status: 'EXCEPTION',
      error: String(err),
      env: envStatus
    })
  }
}
