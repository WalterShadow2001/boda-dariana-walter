import { createClient } from '@libsql/client'

const tursoUrl = process.env.TURSO_DATABASE_URL
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN

if (!tursoUrl || !tursoAuthToken) {
  console.warn('⚠️ Turso environment variables not set: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN')
}

export const turso = createClient({
  url: tursoUrl || 'file:local.db',
  authToken: tursoAuthToken || '',
})

export const isTursoConfigured = !!(tursoUrl && tursoAuthToken)

export async function testTursoConnection(): Promise<{
  success: boolean
  error?: string
  info?: { url: string | undefined; configured: boolean }
}> {
  const info = { url: tursoUrl, configured: isTursoConfigured }
  if (!isTursoConfigured) return { success: false, error: 'Turso no está configurado', info }
  try {
    const result = await turso.execute('SELECT 1 as test')
    if (result.rows.length === 0) {
      return { success: false, error: 'No se pudo conectar a Turso', info }
    }
    return { success: true, info }
  } catch (err) {
    return { success: false, error: String(err), info }
  }
}
