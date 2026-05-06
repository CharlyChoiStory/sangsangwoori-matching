import { NextRequest, NextResponse } from 'next/server'
import {
  recalculateMatchesForSenior,
  recalculateMatchesForJob,
  recalculateAllMatches,
} from '@/lib/matching'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, id } = body

  if (type === 'senior' && id) {
    await recalculateMatchesForSenior(id)
    return NextResponse.json({ ok: true })
  }

  if (type === 'job' && id) {
    await recalculateMatchesForJob(id)
    return NextResponse.json({ ok: true })
  }

  if (type === 'all') {
    await recalculateAllMatches()
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'invalid type' }, { status: 400 })
}
