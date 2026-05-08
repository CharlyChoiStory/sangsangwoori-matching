import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function resetDb() {
  await supabase.from('matches').delete().not('id', 'is', null)
  await supabase.from('seniors').delete().not('id', 'is', null)
  await supabase.from('jobs').delete().not('id', 'is', null)
}

export async function seedMatchingJob() {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ title: '테스트 경비 공고', region: '서울', job_type: '경비/보안', required_career: 3 })
    .select()
    .single()
  if (error) throw new Error(`Job seed failed: ${error.message}`)
  return data
}

export async function seedNoMatchJob() {
  const { data, error } = await supabase
    .from('jobs')
    .insert({ title: '테스트 기타 공고', region: '기타', job_type: '기타', required_career: 0 })
    .select()
    .single()
  if (error) throw new Error(`Job seed failed: ${error.message}`)
  return data
}

export async function getLatestSenior() {
  const { data, error } = await supabase
    .from('seniors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  if (error) throw new Error(`Failed to get latest senior: ${error.message}`)
  return data
}

export async function getSeniorsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('seniors')
    .select('*', { count: 'exact', head: true })
  if (error) throw new Error(`Failed to count seniors: ${error.message}`)
  return count ?? 0
}
