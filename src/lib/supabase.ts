import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug in browser
if (typeof window !== 'undefined') {
  console.log('=== SUPABASE CONFIG ===')
  console.log('URL:', supabaseUrl || 'NOT SET')
  console.log('KEY:', supabaseKey ? 'SET (length: ' + supabaseKey.length + ')' : 'NOT SET')
  console.log('======================')
}

// Check if configured
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseKey.startsWith('eyJ')
)

// Create client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseKey!)
  : null

// Test connection
export async function testConnection(): Promise<{ 
  success: boolean
  error?: string
  info?: {
    url: string | undefined
    keySet: boolean
    configured: boolean
  }
}> {
  const info = {
    url: supabaseUrl,
    keySet: !!supabaseKey,
    configured: isSupabaseConfigured
  }
  
  if (!isSupabaseConfigured) {
    return { 
      success: false, 
      error: 'Supabase no está configurado. Verifica NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY',
      info 
    }
  }
  
  if (!supabase) {
    return {
      success: false,
      error: 'Cliente Supabase no inicializado',
      info
    }
  }
  
  try {
    console.log('Testing Supabase connection...')
    const { error } = await supabase.from('projects').select('id').limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
      return { 
        success: false, 
        error: `${error.message} (${error.code || 'sin código'})`,
        info 
      }
    }
    
    console.log('Supabase connection OK!')
    return { success: true, info }
  } catch (err) {
    console.error('Supabase exception:', err)
    return { 
      success: false, 
      error: String(err),
      info 
    }
  }
}
