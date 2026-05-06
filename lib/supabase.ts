import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Senior = {
  id: string
  name: string
  region: string
  desired_job: string
  career_years: number | null
  created_at: string
}

export type Job = {
  id: string
  title: string
  region: string
  job_type: string
  required_career: number | null
  created_at: string
}

export type Match = {
  id: string
  senior_id: string
  job_id: string
  score: number
  score_region: number
  score_job: number
  score_career: number
  status: 'pending' | 'assigned' | 'done'
  created_at: string
  updated_at: string
  jobs?: Job
  seniors?: Senior
}
