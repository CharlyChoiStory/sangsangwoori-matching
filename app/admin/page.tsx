'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type Senior, type Job } from '@/lib/supabase'
import { AlertCircle, Clock, CheckCircle, RefreshCw, LayoutDashboard, Search, Trash2 } from 'lucide-react'

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
]
const JOB_TYPES = [
  '경비/보안', '청소/미백', '조리/급식', '아이돌봄', '노인돌봄/요양',
  '배송/운전', '사무/행정', '교육/상담', '기타'
]

type KPI = { unmatched: number; pending: number; assigned: number }
type SeniorWithScore = Senior & { topScore: number; status: string }

export default function AdminPage() {
  const [kpi, setKpi] = useState<KPI>({ unmatched: 0, pending: 0, assigned: 0 })
  const [jobs, setJobs] = useState<Job[]>([])
  const [seniors, setSeniors] = useState<SeniorWithScore[]>([])
  const [jobMatchCounts, setJobMatchCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [rematchLoading, setRematchLoading] = useState(false)
  const [rematchDone, setRematchDone] = useState(false)

  // 일자리 추가 폼
  const [jobTitle, setJobTitle] = useState('')
  const [jobRegion, setJobRegion] = useState('')
  const [jobType, setJobType] = useState('')
  const [jobCareer, setJobCareer] = useState('')
  const [jobFormError, setJobFormError] = useState('')
  const [jobFormLoading, setJobFormLoading] = useState(false)

  // 시니어 검색/필터
  const [seniorSearch, setSeniorSearch] = useState('')
  const [seniorRegionFilter, setSeniorRegionFilter] = useState('')
  const [seniorJobFilter, setSeniorJobFilter] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)

    const [{ data: jobsData }, { data: seniorsData }, { data: matchesData }] =
      await Promise.all([
        supabase.from('jobs').select('*').order('created_at', { ascending: false }),
        supabase.from('seniors').select('*').order('created_at', { ascending: false }),
        supabase.from('matches').select('*'),
      ])

    setJobs(jobsData ?? [])

    const allSeniors = seniorsData ?? []
    const allMatches = matchesData ?? []

    // 공고별 매칭 인원 (score >= 2)
    const counts: Record<string, number> = {}
    allMatches.forEach(m => {
      if (m.score >= 2) counts[m.job_id] = (counts[m.job_id] ?? 0) + 1
    })
    setJobMatchCounts(counts)

    const seniorsWithScore: SeniorWithScore[] = allSeniors.map((s) => {
      const seniorMatches = allMatches.filter((m) => m.senior_id === s.id)
      const topScore = seniorMatches.length > 0 ? Math.max(...seniorMatches.map((m) => m.score)) : -1
      const topMatch = seniorMatches.find((m) => m.score === topScore)
      const status = topMatch?.status ?? 'none'
      return { ...s, topScore: topScore === -1 ? 0 : topScore, status }
    })
    setSeniors(seniorsWithScore)

    const realUnmatched = seniorsWithScore.filter((s) => {
      const sm = allMatches.filter((m) => m.senior_id === s.id)
      return sm.length === 0 || sm.every((m) => m.score === 0)
    }).length

    setKpi({
      unmatched: realUnmatched,
      pending: allMatches.filter((m) => m.status === 'pending').length,
      assigned: allMatches.filter((m) => m.status === 'assigned' || m.status === 'done').length,
    })

    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  async function handleAddJob(e: React.FormEvent) {
    e.preventDefault()
    setJobFormError('')
    if (!jobTitle.trim() || !jobRegion || !jobType) {
      setJobFormError('공고명, 지역, 직종은 반드시 입력해야 합니다.')
      return
    }
    setJobFormLoading(true)
    const { data, error } = await supabase
      .from('jobs')
      .insert({ title: jobTitle.trim(), region: jobRegion, job_type: jobType, required_career: jobCareer ? parseInt(jobCareer) : null })
      .select().single()

    if (error) { setJobFormError('일자리 등록 중 오류가 발생했습니다.'); setJobFormLoading(false); return }

    await fetch('/api/recalculate-matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'job', id: data.id }),
    })
    setJobTitle(''); setJobRegion(''); setJobType(''); setJobCareer('')
    setJobFormLoading(false)
    fetchAll()
  }

  async function handleDeleteJob(jobId: string, title: string) {
    if (!window.confirm(`"${title}" 공고를 삭제하시겠습니까?\n관련 매칭 정보도 함께 삭제됩니다.`)) return
    await supabase.from('jobs').delete().eq('id', jobId)
    fetchAll()
  }

  async function handleDeleteSenior(seniorId: string, name: string) {
    if (!window.confirm(`"${name}" 시니어를 삭제하시겠습니까?\n관련 매칭 정보도 함께 삭제됩니다.`)) return
    await supabase.from('seniors').delete().eq('id', seniorId)
    fetchAll()
  }

  async function handleRematchAll() {
    setRematchLoading(true)
    setRematchDone(false)
    await fetch('/api/recalculate-matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'all' }),
    })
    setRematchLoading(false)
    setRematchDone(true)
    fetchAll()
  }

  // 시니어 필터 적용
  const filteredSeniors = seniors.filter(s => {
    if (seniorSearch && !s.name.includes(seniorSearch)) return false
    if (seniorRegionFilter && s.region !== seniorRegionFilter) return false
    if (seniorJobFilter && s.desired_job !== seniorJobFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* 헤더 */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <LayoutDashboard className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">담당자 관리 화면</h1>
              <p className="text-lg text-gray-600">일자리 공고 관리 및 매칭 현황 확인</p>
            </div>
          </div>
          <button
            onClick={handleRematchAll}
            disabled={rematchLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold px-6 rounded-lg min-h-[48px] text-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${rematchLoading ? 'animate-spin' : ''}`} />
            {rematchLoading ? '재매칭 중...' : '전체 재매칭'}
          </button>
        </div>
        {rematchDone && (
          <p className="text-base text-green-700 font-semibold -mt-6 px-2">✓ 재매칭이 완료되었습니다.</p>
        )}

        {/* KPI 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-5">
            <div className="p-4 bg-orange-100 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <p className="text-base text-gray-500 font-bold mb-1">미매칭 시니어</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-orange-600">{kpi.unmatched}</span>
                <span className="text-lg font-bold text-gray-400">명</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-5">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-base text-gray-500 font-bold mb-1">매칭 대기</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-blue-600">{kpi.pending}</span>
                <span className="text-lg font-bold text-gray-400">건</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-5">
            <div className="p-4 bg-green-100 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-base text-gray-500 font-bold mb-1">배정 완료</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-green-600">{kpi.assigned}</span>
                <span className="text-lg font-bold text-gray-400">건</span>
              </div>
            </div>
          </div>
        </div>

        {/* 일자리 추가 폼 */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">일자리 공고 추가</h2>
          {jobFormError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-400 rounded-lg text-red-800 text-lg">{jobFormError}</div>
          )}
          <form onSubmit={handleAddJob} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">공고명 <span className="text-red-500">*</span></label>
                <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="예: 관악구 경비원 모집"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg min-h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">지역 <span className="text-red-500">*</span></label>
                <select value={jobRegion} onChange={(e) => setJobRegion(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg min-h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white">
                  <option value="">지역 선택</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">직종 <span className="text-red-500">*</span></label>
                <select value={jobType} onChange={(e) => setJobType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg min-h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white">
                  <option value="">직종 선택</option>
                  {JOB_TYPES.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">요구 경력 <span className="text-gray-400 font-normal">(선택)</span></label>
                <input type="number" value={jobCareer} onChange={(e) => setJobCareer(e.target.value)}
                  placeholder="예: 3" min={0}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg min-h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
            <button type="submit" disabled={jobFormLoading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-8 rounded-lg min-h-[52px] text-lg transition-colors">
              {jobFormLoading ? '등록 중...' : '공고 추가'}
            </button>
          </form>
        </div>

        {/* 일자리 목록 */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            등록된 일자리 <span className="text-gray-400 font-normal text-lg">({jobs.length}건)</span>
          </h2>
          {jobs.length === 0 ? (
            <p className="text-lg text-gray-500">등록된 일자리가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-lg">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">공고명</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">지역</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">직종</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">요구경력</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">매칭 인원</th>
                    <th className="text-left py-3 text-gray-600 font-semibold">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-900">{job.title}</td>
                      <td className="py-3 pr-4 text-gray-600">{job.region}</td>
                      <td className="py-3 pr-4 text-gray-600">{job.job_type}</td>
                      <td className="py-3 pr-4 text-gray-600">{job.required_career ?? 0}년</td>
                      <td className="py-3 pr-4">
                        {(jobMatchCounts[job.id] ?? 0) > 0 ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-base font-semibold">
                            {jobMatchCounts[job.id]}명
                          </span>
                        ) : (
                          <span className="text-gray-400 text-base">0명</span>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg text-base transition-colors min-h-[40px]"
                        >
                          <Trash2 className="w-4 h-4" /> 삭제 확인
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 시니어 목록 */}
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            시니어 목록 <span className="text-gray-400 font-normal text-lg">({seniors.length}명 전체 / {filteredSeniors.length}명 표시)</span>
          </h2>

          {/* 검색/필터 */}
          <div className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 min-h-[44px] flex-1 min-w-[160px]">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={seniorSearch}
                onChange={(e) => setSeniorSearch(e.target.value)}
                placeholder="이름 검색"
                className="flex-1 text-base focus:outline-none bg-transparent"
              />
            </div>
            <select value={seniorRegionFilter} onChange={(e) => setSeniorRegionFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 min-h-[44px] text-base bg-white focus:outline-none focus:border-blue-500">
              <option value="">전체 지역</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={seniorJobFilter} onChange={(e) => setSeniorJobFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 min-h-[44px] text-base bg-white focus:outline-none focus:border-blue-500">
              <option value="">전체 직종</option>
              {JOB_TYPES.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            {(seniorSearch || seniorRegionFilter || seniorJobFilter) && (
              <button
                onClick={() => { setSeniorSearch(''); setSeniorRegionFilter(''); setSeniorJobFilter('') }}
                className="px-4 min-h-[44px] text-base font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                초기화
              </button>
            )}
          </div>

          {seniors.length === 0 ? (
            <p className="text-lg text-gray-500">등록된 시니어가 없습니다.</p>
          ) : filteredSeniors.length === 0 ? (
            <p className="text-lg text-gray-500 py-4">검색 조건에 맞는 시니어가 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-lg">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">이름</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">지역</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">희망직종</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">최고점수</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">상태</th>
                    <th className="text-left py-3 pr-4 text-gray-600 font-semibold">추천 보기</th>
                    <th className="text-left py-3 text-gray-600 font-semibold">삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSeniors.map((senior) => (
                    <tr key={senior.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-gray-900">{senior.name}</td>
                      <td className="py-3 pr-4 text-gray-600">{senior.region}</td>
                      <td className="py-3 pr-4 text-gray-600">{senior.desired_job}</td>
                      <td className="py-3 pr-4"><TopScoreBadge score={senior.topScore} /></td>
                      <td className="py-3 pr-4"><StatusBadge status={senior.status} /></td>
                      <td className="py-3 pr-4">
                        <a
                          href={`/recommendations?senior_id=${senior.id}`}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg text-base transition-colors inline-block min-h-[40px] leading-[24px]"
                        >
                          상세 보기
                        </a>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleDeleteSenior(senior.id, senior.name)}
                          className="flex items-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg text-base transition-colors min-h-[40px]"
                        >
                          <Trash2 className="w-4 h-4" /> 삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function TopScoreBadge({ score }: { score: number }) {
  if (score === 6) return <span className="font-bold text-yellow-600">★ {score}점</span>
  if (score >= 4) return <span className="font-bold text-green-600">● {score}점</span>
  if (score >= 2) return <span className="font-bold text-gray-600">{score}점</span>
  return <span className="text-gray-400">{score}점</span>
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'assigned' || status === 'done')
    return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-base font-semibold">배정완료</span>
  if (status === 'pending')
    return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-base font-semibold">대기중</span>
  return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-base font-semibold">미매칭</span>
}
