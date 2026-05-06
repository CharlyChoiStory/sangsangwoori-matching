import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const seniors = [
  { name: '김영수', region: '서울', desired_job: '경비/보안', career_years: 10 },
  { name: '박미경', region: '경기', desired_job: '청소/미백', career_years: 5 },
  { name: '이정호', region: '서울', desired_job: '조리/급식', career_years: 15 },
  { name: '최순자', region: '인천', desired_job: '노인돌봄/요양', career_years: 8 },
  { name: '정대현', region: '서울', desired_job: '경비/보안', career_years: 3 },
  { name: '강옥분', region: '경기', desired_job: '아이돌봄', career_years: 12 },
  { name: '윤기석', region: '서울', desired_job: '조리/급식', career_years: 7 },
  { name: '장미자', region: '인천', desired_job: '청소/미백', career_years: 4 },
  { name: '오상훈', region: '기타', desired_job: '기타', career_years: 20 },
  { name: '임복순', region: '서울특별시', desired_job: '경비직', career_years: 6 },
]

const jobs = [
  { title: '아파트 경비원 A동', region: '서울', job_type: '경비/보안', required_career: 5 },
  { title: '오피스 미화 주간반', region: '경기', job_type: '청소/미백', required_career: 2 },
  { title: '어린이집 조리사', region: '서울', job_type: '조리/급식', required_career: 10 },
  { title: '방문 요양보호사 서구', region: '인천', job_type: '노인돌봄/요양', required_career: 5 },
  { title: '상가 야간 경비원', region: '서울', job_type: '경비/보안', required_career: 3 },
  { title: '주간 돌봄 보조', region: '경기', job_type: '아이돌봄', required_career: 4 },
  { title: '단체급식 보조 조리', region: '서울', job_type: '조리/급식', required_career: 3 },
  { title: '호텔 객실 미화', region: '인천', job_type: '청소/미백', required_career: 2 },
  { title: '공원 환경 관리', region: '서울', job_type: '기타', required_career: 1 },
  { title: '동주민센터 안내 도우미', region: '경기', job_type: '기타', required_career: 0 },
  { title: '학교 경비원', region: '서울특별시', job_type: '경비/보안', required_career: 2 },
  { title: '병원 청소', region: '인천', job_type: '청소/미백', required_career: 3 },
  { title: '주간 조리 보조', region: '서울', job_type: '조리/급식', required_career: 5 },
  { title: '방문 돌봄 도우미', region: '경기', job_type: '아이돌봄', required_career: 6 },
  { title: '주차 관리원', region: '서울', job_type: '경비/보안', required_career: 1 },
]

async function seed() {
  console.log('Seeding data...')
  
  const { error: sError } = await supabase.from('seniors').insert(seniors)
  if (sError) console.error('Seniors insert error:', sError)
  
  const { error: jError } = await supabase.from('jobs').insert(jobs)
  if (jError) console.error('Jobs insert error:', jError)
  
  console.log('Seeding complete. Recalculating matches...')
  
  // Trigger recalculation via API or RPC if possible. 
  // Since we are in a script, we'll just call the recalculate-matches endpoint locally 
  // or use the logic if we could, but let's just trigger it via a simple fetch 
  // to the running dev server or handle it later in the UI.
}

seed()
