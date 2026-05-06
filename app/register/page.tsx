'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const REGIONS = [
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
]
const JOB_TYPES = [
  '경비/보안',
  '청소/미백',
  '조리/급식',
  '아이돌봄',
  '노인돌봄/요양',
  '배송/운전',
  '사무/행정',
  '교육/상담',
  '기타'
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [desiredJob, setDesiredJob] = useState('')
  const [careerYears, setCareerYears] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name.trim() || !region || !desiredJob) {
      setError('이름, 지역, 희망 직종은 반드시 입력해야 합니다.')
      return
    }

    setLoading(true)

    const { data, error: insertError } = await supabase
      .from('seniors')
      .insert({
        name: name.trim(),
        region,
        desired_job: desiredJob,
        career_years: careerYears ? parseInt(careerYears) : null,
      })
      .select()
      .single()

    if (insertError) {
      setError(`등록 중 오류가 발생했습니다: ${insertError.message}`)
      setLoading(false)
      return
    }

    await fetch('/api/recalculate-matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'senior', id: data.id }),
    })

    setSuccess(true)
    setName('')
    setRegion('')
    setDesiredJob('')
    setCareerYears('')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          시니어 일자리 신청하기
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          아래 정보를 입력하시면 가장 적합한 일자리를 바로 찾아드립니다.
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-400 rounded-lg text-green-800 text-xl font-bold text-center">
            등록이 완료되었습니다. 담당자가 곧 연락드립니다!
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-400 rounded-lg text-red-800 text-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-lg font-semibold text-gray-800 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg min-h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-xl font-bold text-gray-800 mb-2">
              거주 지역 <span className="text-red-500">*</span>
            </label>
            <p className="text-base text-gray-500 mb-2">어디에서 일하고 싶으세요?</p>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg min-h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
            >
              <option value="">지역을 선택하세요</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="jobType" className="block text-xl font-bold text-gray-800 mb-2">
              희망 직종 <span className="text-red-500">*</span>
            </label>
            <p className="text-base text-gray-500 mb-2">어떤 일을 하시겠어요?</p>
            <select
              id="jobType"
              value={desiredJob}
              onChange={(e) => setDesiredJob(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg min-h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white"
            >
              <option value="">직종을 선택하세요</option>
              {JOB_TYPES.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="career" className="block text-lg font-semibold text-gray-800 mb-2">
              경력 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input
              id="career"
              type="number"
              value={careerYears}
              onChange={(e) => setCareerYears(e.target.value)}
              placeholder="예: 5"
              min={0}
              max={50}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg min-h-[52px] focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <p className="text-base text-gray-500 mt-1">연 단위로 입력해 주세요. 없으면 비워 두셔도 됩니다.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-lg min-h-[52px] text-xl transition-colors"
          >
            {loading ? '등록 중...' : '등록하기'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/admin" className="text-lg text-blue-600 hover:underline">
            담당자 관리 화면으로 이동 →
          </a>
        </div>
      </div>
    </div>
  )
}
