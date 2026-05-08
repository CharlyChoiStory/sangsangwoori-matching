'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase, type Match, type Senior } from '@/lib/supabase'

function ScoreBadge({ score }: { score: number }) {
  if (score === 6)
    return <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-yellow-100 text-yellow-800 border border-yellow-400">6점 ★ 매우 적합</span>
  if (score >= 4)
    return <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-green-100 text-green-800 border border-green-400">{score}점 ● 적합</span>
  if (score >= 2)
    return <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-gray-100 text-gray-700 border border-gray-400">{score}점 보통</span>
  return <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-gray-50 text-gray-500 border border-gray-300">{score}점</span>
}

// senior_id 없을 때: 시니어 선택 목록
function SeniorListView() {
  const router = useRouter()
  const [seniors, setSeniors] = useState<Senior[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('seniors')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSeniors(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">추천 일자리 확인</h1>
        <p className="text-lg text-gray-600 mb-8">시니어를 선택하면 추천 일자리를 확인할 수 있습니다.</p>

        {seniors.length === 0 ? (
          <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-lg">
            등록된 시니어가 없습니다.{' '}
            <a href="/register" className="text-blue-600 underline">시니어 등록하기 →</a>
          </div>
        ) : (
          <div className="space-y-3">
            {seniors.map((senior) => (
              <button
                key={senior.id}
                onClick={() => router.push(`/recommendations?senior_id=${senior.id}`)}
                className="w-full bg-white rounded-2xl shadow p-5 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-bold text-gray-900">{senior.name}</p>
                    <p className="text-lg text-gray-500 mt-1">
                      {senior.region} · {senior.desired_job} · 경력 {senior.career_years ?? 0}년
                    </p>
                  </div>
                  <span className="text-2xl text-blue-400 shrink-0">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// senior_id 있을 때: 해당 시니어의 추천 목록
function RecommendationDetailView({ seniorId }: { seniorId: string }) {
  const [senior, setSenior] = useState<Senior | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [assigningId, setAssigningId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [seniorId])

  async function fetchData() {
    setLoading(true)
    const { data: seniorData } = await supabase
      .from('seniors').select('*').eq('id', seniorId).single()

    if (!seniorData) { setNotFound(true); setLoading(false); return }
    setSenior(seniorData)

    const { data: matchData } = await supabase
      .from('matches').select('*, jobs(*)')
      .eq('senior_id', seniorId)
      .order('score', { ascending: false })

    setMatches(matchData ?? [])
    setLoading(false)
  }

  async function handleAssign(matchId: string, currentStatus: string) {
    setAssigningId(matchId)
    const newStatus = (currentStatus === 'assigned' || currentStatus === 'done') ? 'pending' : 'assigned'
    await supabase
      .from('matches')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', matchId)
    await fetchData()
    setAssigningId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">불러오는 중...</p>
      </div>
    )
  }

  if (notFound || !senior) {
    return (
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="p-6 bg-orange-50 border border-orange-400 rounded-lg text-orange-800 text-lg">
            시니어 정보를 찾을 수 없습니다.
          </div>
          <div className="mt-4">
            <a href="/recommendations" className="text-lg text-blue-600 hover:underline">← 목록으로 돌아가기</a>
          </div>
        </div>
      </div>
    )
  }

  const visibleMatches = matches.filter(m => m.score >= 2)
  const assignedCount = visibleMatches.filter(m => m.status === 'assigned' || m.status === 'done').length

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <a href="/recommendations" className="text-lg text-blue-600 hover:underline">← 시니어 목록으로</a>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">{senior.name} 님께 맞는 일자리</h1>
        <p className="text-lg text-gray-600 mb-2">
          {senior.region} · {senior.desired_job} · 경력 {senior.career_years ?? 0}년
        </p>
        {assignedCount > 0 && (
          <p className="text-base font-semibold text-green-700 mb-6">✓ {assignedCount}건 배정 완료</p>
        )}
        {assignedCount === 0 && <div className="mb-6" />}

        {visibleMatches.length === 0 ? (
          <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-lg">
            <p className="font-semibold">현재 매칭되는 일자리가 없습니다.</p>
            <p className="mt-1">담당자가 직접 연락드리니 잠시만 기다려 주세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleMatches.map((match) => {
              const isAssigned = match.status === 'assigned' || match.status === 'done'
              return (
                <div key={match.id}
                  className={`bg-white rounded-2xl shadow p-6 border transition-colors ${isAssigned ? 'border-green-300 bg-green-50' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{match.jobs?.title}</h2>
                      <p className="text-lg text-gray-600">
                        {match.jobs?.region} · {match.jobs?.job_type} · 요구경력 {match.jobs?.required_career ?? 0}년
                      </p>
                    </div>
                    <ScoreBadge score={match.score} />
                  </div>

                  <div className="mt-3 flex gap-2 flex-wrap">
                    {match.score_region > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-base font-medium">지역 +{match.score_region}</span>
                    )}
                    {match.score_job > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-base font-medium">직종 +{match.score_job}</span>
                    )}
                    {match.score_career > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-base font-medium">경력 +{match.score_career}</span>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleAssign(match.id, match.status)}
                      disabled={assigningId === match.id}
                      className={`px-5 py-2 rounded-lg text-base font-semibold min-h-[44px] transition-colors disabled:opacity-50 ${
                        isAssigned
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {assigningId === match.id ? '처리 중...' : isAssigned ? '✓ 배정 완료 (취소)' : '배정 완료로 변경'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function RecommendationsContent() {
  const searchParams = useSearchParams()
  const seniorId = searchParams.get('senior_id')

  if (!seniorId) return <SeniorListView />
  return <RecommendationDetailView seniorId={seniorId} />
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-500">불러오는 중...</p>
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  )
}
