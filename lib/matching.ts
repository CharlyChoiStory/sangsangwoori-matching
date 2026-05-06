import { supabase, type Senior, type Job } from './supabase'

export function normalizeRegion(region: string): string {
  return region
    .replace(/특별시|광역시|특별자치시|특별자치도/g, '')
    .replace(/도$/g, '')
    .trim()
}

export function calculateScore(senior: Senior, job: Job): {
  score: number
  score_region: number
  score_job: number
  score_career: number
} {
  const score_region =
    normalizeRegion(senior.region) === normalizeRegion(job.region) ? 3 : 0

  const score_job =
    senior.desired_job.trim() === job.job_type.trim() ? 2 : 0

  const seniorCareer = senior.career_years ?? 0
  const requiredCareer = job.required_career ?? 0
  const score_career = seniorCareer >= requiredCareer ? 1 : 0

  return {
    score: score_region + score_job + score_career,
    score_region,
    score_job,
    score_career,
  }
}

export async function recalculateMatchesForSenior(seniorId: string) {
  const { data: senior, error: seniorError } = await supabase
    .from('seniors')
    .select('*')
    .eq('id', seniorId)
    .single()

  if (seniorError || !senior) return

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('*')

  if (jobsError || !jobs) return

  for (const job of jobs) {
    const { score, score_region, score_job, score_career } = calculateScore(
      senior,
      job
    )

    await supabase.from('matches').upsert(
      {
        senior_id: seniorId,
        job_id: job.id,
        score,
        score_region,
        score_job,
        score_career,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'senior_id,job_id' }
    )
  }
}

export async function recalculateMatchesForJob(jobId: string) {
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (jobError || !job) return

  const { data: seniors, error: seniorsError } = await supabase
    .from('seniors')
    .select('*')

  if (seniorsError || !seniors) return

  for (const senior of seniors) {
    const { score, score_region, score_job, score_career } = calculateScore(
      senior,
      job
    )

    await supabase.from('matches').upsert(
      {
        senior_id: senior.id,
        job_id: jobId,
        score,
        score_region,
        score_job,
        score_career,
        status: 'pending',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'senior_id,job_id' }
    )
  }
}

export async function recalculateAllMatches() {
  const { data: seniors, error: seniorsError } = await supabase
    .from('seniors')
    .select('*')

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('*')

  if (seniorsError || jobsError || !seniors || !jobs) return

  for (const senior of seniors) {
    for (const job of jobs) {
      const { score, score_region, score_job, score_career } = calculateScore(
        senior,
        job
      )

      await supabase.from('matches').upsert(
        {
          senior_id: senior.id,
          job_id: job.id,
          score,
          score_region,
          score_job,
          score_career,
          status: 'pending',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'senior_id,job_id' }
      )
    }
  }
}
