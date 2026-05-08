'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Briefcase, LayoutDashboard, ArrowRight, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [stats, setStats] = useState({ seniors: 0, jobs: 0, activeMatches: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: sCount },
        { count: jCount },
        { count: mCount },
      ] = await Promise.all([
        supabase.from('seniors').select('*', { count: 'exact', head: true }),
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }).gte('score', 2),
      ])
      setStats({ seniors: sCount ?? 0, jobs: jCount ?? 0, activeMatches: mCount ?? 0 })
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* 히어로 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">상상우리 매칭</h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
            시니어와 일자리를 규칙 기반으로 자동 연결하는 스마트 매칭 플랫폼
          </p>
        </div>

        {/* 실시간 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <p className="text-4xl font-black text-blue-600">
              {loading ? '…' : stats.seniors}
            </p>
            <p className="text-base text-gray-500 mt-1 font-semibold">등록 시니어</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <p className="text-4xl font-black text-green-600">
              {loading ? '…' : stats.jobs}
            </p>
            <p className="text-base text-gray-500 mt-1 font-semibold">등록 공고</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <p className="text-4xl font-black text-yellow-600">
              {loading ? '…' : stats.activeMatches}
            </p>
            <p className="text-base text-gray-500 mt-1 font-semibold">활성 매칭 (2점↑)</p>
          </div>
        </div>

        {/* 기능 카드 3종 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <a href="/register"
            className="group bg-white rounded-2xl shadow p-8 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all block">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-blue-200 transition-colors">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">시니어 등록</h2>
            <p className="text-base text-gray-500 mb-5 leading-relaxed">
              이름·지역·희망 직종을 입력하면 조건에 맞는 일자리를 즉시 매칭합니다.
            </p>
            <span className="text-blue-600 font-bold text-base flex items-center gap-1 group-hover:gap-2 transition-all">
              등록하기 <ArrowRight className="w-4 h-4" />
            </span>
          </a>

          <a href="/recommendations"
            className="group bg-white rounded-2xl shadow p-8 border border-gray-100 hover:border-yellow-300 hover:shadow-md transition-all block">
            <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-yellow-200 transition-colors">
              <Briefcase className="w-7 h-7 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">추천 일자리</h2>
            <p className="text-base text-gray-500 mb-5 leading-relaxed">
              시니어별 매칭 점수 순으로 가장 적합한 일자리 목록을 확인합니다.
            </p>
            <span className="text-yellow-600 font-bold text-base flex items-center gap-1 group-hover:gap-2 transition-all">
              추천 보기 <ArrowRight className="w-4 h-4" />
            </span>
          </a>

          <a href="/admin"
            className="group bg-white rounded-2xl shadow p-8 border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all block">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-purple-200 transition-colors">
              <LayoutDashboard className="w-7 h-7 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">담당자 관리</h2>
            <p className="text-base text-gray-500 mb-5 leading-relaxed">
              공고 추가·삭제, 매칭 현황 집계, 시니어 목록 관리를 합니다.
            </p>
            <span className="text-purple-600 font-bold text-base flex items-center gap-1 group-hover:gap-2 transition-all">
              관리하기 <ArrowRight className="w-4 h-4" />
            </span>
          </a>
        </div>

        {/* 매칭 규칙 안내 */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5">매칭 점수 기준</h2>
          <div className="grid grid-cols-3 gap-4 text-center mb-5">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-3xl font-black text-blue-600">+3점</p>
              <p className="text-base font-bold text-gray-800 mt-2">지역 일치</p>
              <p className="text-sm text-gray-500 mt-1">서울특별시 ↔ 서울<br />자동 정규화</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-3xl font-black text-purple-600">+2점</p>
              <p className="text-base font-bold text-gray-800 mt-2">직종 일치</p>
              <p className="text-sm text-gray-500 mt-1">경비직 ↔ 경비/보안<br />자동 정규화</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-3xl font-black text-green-600">+1점</p>
              <p className="text-base font-bold text-gray-800 mt-2">경력 충족</p>
              <p className="text-sm text-gray-500 mt-1">시니어 경력<br />≥ 요구 경력</p>
            </div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold border border-yellow-400">6점 ★ 매우 적합</span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold border border-green-400">4~5점 ● 적합</span>
            <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-bold border border-gray-400">2~3점 보통</span>
          </div>
        </div>

      </div>
    </div>
  )
}
