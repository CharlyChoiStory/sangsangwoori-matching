'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase, type Match, type Senior } from '@/lib/supabase'
import { Suspense } from 'react'

function ScoreBadge({ score }: { score: number }) {
  if (score === 6) {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-yellow-100 text-yellow-800 border border-yellow-400">
        {score}점 ★ 매우 적합
      </span>
    )
  }
  if (score >= 4) {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-green-100 text-green-800 border border-green-400">
        {score}점 ● 적합
      </span>
    )
  }
  if (score >= 2) {
    return (
      <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-gray-100 text-gray-700 border border-gray-400">
        {score}점 일부 적합
      </span>
    )
  }
  return (
    <span className="inline-block px-3 py-1 rounded-full text-base font-bold bg-gray-50 text-gray-500 border border-gray-300">
      {score}점
    </span>
  )
}

function RecommendationsContent() {
  const searchParams = useSearchParams()
  const seniorId = searchParams.get('senior_id')

  const [senior, setSenior] = useState<Senior | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!seniorId) {
      setNotFound(true)
      setLoading(false)
      return
    }
    fetchData()
  }, [seniorId])

  async function fetchData() {
    setLoading(true)

    const { data: seniorData } = await supabase
      .from('seniors')
      .select('*')
      .eq('id', seniorId)
      .single()

    if (!seniorData) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setSenior(seniorData)

    const { data: matchData } = await supabase
      .from('matches')
      .select('*, jobs(*)')
      .eq('senior_id', seniorId)
      .order('score', { ascending: false })

    setMatches(matchData ?? [])
    setLoading(false)
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
            시니어 정보를 찾을 수 없습니다. URL의 senior_id를 확인해 주세요.
          </div>
          <div className="mt-4">
            <a href="/admin" className="text-lg text-blue-600 hover:underline">← 관리자 화면으로 돌아가기</a>
          </div>
        </div>
      </div>
    )
  }

  const hasMatches = matches.length > 0 && matches.some((m) => m.score > 0)

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-2 flex items-center gap-2">
          <a href="/admin" className="text-lg text-blue-600 hover:underline">← 관리자 화면</a>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          추천 일자리 목록
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {senior.name}님 ({senior.region} · {senior.desired_job} · 경력 {senior.career_years ?? 0}년)
        </p>

        {!hasMatches ? (
          <div className="p-6 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-lg">
            현재 매칭되는 일자리가 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-white rounded-2xl shadow p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {match.jobs?.title}
                    </h2>
                    <p className="text-lg text-gray-600">
                      {match.jobs?.region} · {match.jobs?.job_type} · 요구경력 {match.jobs?.required_career ?? 0}년
                    </p>
                  </div>
                  <ScoreBadge score={match.score} />
                </div>

                <div className="mt-4 flex gap-2 flex-wrap">
                  {match.score_region > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-base font-medium">
                      지역 +{match.score_region}
                    </span>
                  )}
                  {match.score_job > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-base font-medium">
                      직종 +{match.score_job}
                    </span>
                  )}
                  {match.score_career > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-base font-medium">
                      경력 +{match.score_career}
                    </span>
                  )}
                  {match.score === 0 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-base">
                      조건 불일치
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
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
