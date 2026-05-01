'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getReportDetail } from '@/lib/reportService'
import api from '@/lib/api'

/* ================= TYPES ================= */

interface DMARCRecord {
  id: number
  source_ip: string
  message_count: number
  disposition: string
  dkim_result: string
  spf_result: string
  geo_city: string
  geo_country: string
  geo_isp: string
  is_suspicious: boolean
}

type AIStringArray = string[]

interface ReportDetail {
  org_name: string
  org_email: string
  status: string
  domain_policy: string
  policy_p: string
  date_begin: string
  date_end: string
  pass_rate: number
  passed_messages: number
  failed_messages: number
  records: DMARCRecord[]

  ai_summary?: string | null
  ai_risk_level?: string | null
  ai_risk_reason?: string | null
  ai_findings?: AIStringArray | null
  ai_recommendations?: AIStringArray | null
  ai_explanation?: string | null
  ai_policy_advice?: string | null
  ai_analyzed_at?: string | null
}

/* ================= SAFE HELPERS ================= */

function safeArray(data: unknown): string[] {
  if (!data) return []
  if (Array.isArray(data)) {
    return data.filter((x): x is string => typeof x === 'string')
  }
  return []
}

function safeString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

/* ================= BADGE ================= */

function ResultBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    pass: 'bg-green-100 text-green-700',
    fail: 'bg-red-100 text-red-700',
    softfail: 'bg-orange-100 text-orange-700',
    neutral: 'bg-gray-100 text-gray-600',
    none: 'bg-gray-100 text-gray-500',
  }

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        map[value] ?? 'bg-gray-100 text-gray-500'
      }`}
    >
      {value?.toUpperCase() || 'N/A'}
    </span>
  )
}

function RiskBadge({ level }: { level?: string | null }) {
  const safe = level || 'unknown'

  const map: Record<string, string> = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
    unknown: 'bg-gray-100 text-gray-600',
  }

  const emoji: Record<string, string> = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
    unknown: '⚪',
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        map[safe] ?? map.unknown
      }`}
    >
      {emoji[safe]} {safe.toUpperCase()}
    </span>
  )
}

/* ================= DELETE MODAL ================= */

function DeleteModal({
  orgName,
  onCancel,
  onConfirm,
  deleting,
  error,
}: {
  orgName: string
  onCancel: () => void
  onConfirm: () => void
  deleting: boolean
  error: string | null
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !deleting && onCancel()}
      />

      {/* MODAL */}
      <div className="relative bg-white w-[400px] rounded-3xl shadow-2xl p-6">

        {/* ICON */}
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-3xl mb-4">
          🗑️
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-bold text-center text-gray-800 mb-1">
          Hapus Report?
        </h2>

        {/* ORG NAME */}
        <p className="text-center text-sm font-medium text-gray-700 mb-2">
          {orgName}
        </p>

        {/* DESC */}
        <p className="text-sm text-gray-500 text-center mb-4">
          Report ini akan dihapus permanen beserta seluruh records dan hasil analisis AI-nya.
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Menghapus...
              </>
            ) : (
              'Ya, Hapus'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ================= PAGE ================= */

export default function ReportDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // delete state
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    getReportDetail(id as string)
      .then((res) => setReport(res))
      .catch(() => router.push('/user/reports'))
      .finally(() => setLoading(false))
  }, [id, router])

  /* ================= DELETE HANDLER ================= */

  const handleDelete = async () => {
    if (!id) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await api.delete(`/reports/${id}/`)
      // Kembali ke halaman list setelah berhasil hapus
      router.push('/user/reports')
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'detail' in err.response.data
      ) {
        setDeleteError((err.response.data as { detail: string }).detail)
      } else {
        setDeleteError('Gagal menghapus report. Coba lagi.')
      }
    } finally {
      setDeleting(false)
    }
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!report) return null

  /* ================= SAFE DATA ================= */

  const aiReady = Boolean(report.ai_analyzed_at)
  const findings = safeArray(report.ai_findings)
  const recommendations = safeArray(report.ai_recommendations)

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white p-6 rounded shadow mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{report.org_name}</h1>
            <p className="text-gray-500">{report.org_email}</p>
          </div>

          {/* ✅ DELETE BUTTON */}
          <button
            onClick={() => {
              setDeleteError(null)
              setShowDelete(true)
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition text-sm font-medium"
          >
            🗑️ Hapus Report
          </button>
        </div>

        {/* AI SECTION */}
        <div className="bg-white p-6 rounded shadow mb-6">

          <div className="flex justify-between mb-4">
            <h2 className="font-bold">🤖 AI Analysis</h2>

            {aiReady && (
              <RiskBadge level={report.ai_risk_level} />
            )}
          </div>

          {!aiReady ? (
            <div className="text-gray-500 flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              AI masih memproses...
            </div>
          ) : (
            <>
              <div className="bg-blue-50 p-3 rounded mb-3">
                {safeString(report.ai_summary) || 'No summary'}
              </div>

              {report.ai_risk_reason && (
                <div className="bg-yellow-50 p-3 rounded mb-3">
                  {report.ai_risk_reason}
                </div>
              )}

              {findings.length > 0 && (
                <ul className="list-disc ml-5 mb-3">
                  {findings.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              )}

              {recommendations.length > 0 && (
                <ul className="list-disc ml-5 mb-3">
                  {recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}

              {report.ai_explanation && (
                <div className="bg-gray-50 p-3 rounded mb-3">
                  {report.ai_explanation}
                </div>
              )}

              {report.ai_policy_advice && (
                <div className="bg-purple-50 p-3 rounded">
                  {report.ai_policy_advice}
                </div>
              )}
            </>
          )}
        </div>

        {/* RECORDS */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-semibold mb-4">
            Records ({report.records.length})
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">IP</th>
                <th className="p-2">Message</th>
                <th className="p-2">SPF</th>
                <th className="p-2">DKIM</th>
                <th className="p-2">Disposition</th>
              </tr>
            </thead>

            <tbody>
              {report.records.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.source_ip}</td>
                  <td className="p-2">{r.message_count}</td>
                  <td className="p-2">
                    <ResultBadge value={r.spf_result} />
                  </td>
                  <td className="p-2">
                    <ResultBadge value={r.dkim_result} />
                  </td>
                  <td className="p-2">
                    <ResultBadge value={r.disposition} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* ================= DELETE MODAL ================= */}
      {showDelete && (
        <DeleteModal
          orgName={report.org_name}
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
          deleting={deleting}
          error={deleteError}
        />
      )}
    </div>
  )
}