import { NextResponse } from 'next/server'

// POST /api/images/[id]/analyze — Wave 2
export async function POST() {
  return NextResponse.json({ error: 'AI analysis not yet implemented (Wave 2)' }, { status: 501 })
}
