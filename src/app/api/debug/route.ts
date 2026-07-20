import { turso, isTursoConfigured } from '@/lib/turso'
import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  const envStatus = {
    url: tursoUrl ? 'SET' : 'NOT SET',
    token: tursoToken ? 'SET' : 'NOT SET',
    urlValue: tursoUrl || null,
    configured: isTursoConfigured,
  }

  if (!isTursoConfigured) {
    return NextResponse.json({
      error: 'Missing Turso environment variables',
      env: envStatus,
    })
  }

  try {
    // Test connection
    const result = await turso.execute('SELECT COUNT(*) as count FROM projects')

    const projectsResult = await turso.execute('SELECT * FROM projects')

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'Connection working!',
      env: envStatus,
      projectsCount: Number(result.rows[0].count),
      projects: projectsResult.rows,
    })
  } catch (err) {
    return NextResponse.json({
      status: 'EXCEPTION',
      error: String(err),
      env: envStatus,
    })
  }
}
