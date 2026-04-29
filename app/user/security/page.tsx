'use client'

import { useEffect, useState } from 'react'
import { getReports } from '@/lib/reportService'

/* ================= TYPES ================= */

type Report = {
  status: string
  failed_messages: number
}

/* ================= PAGE ================= */

export default function SecurityPage() {
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState<{
    total: number
    secure: number
    risk: number
  }>({
    total: 0,
    secure: 0,
    risk: 0,
  })

  useEffect(() => {
    getReports()
      .then((data: { results?: Report[] }) => {
        const reports = data.results ?? []

        const total = reports.length

        const risk = reports.filter(
          (r) => r.status === 'failed' || r.failed_messages > 0
        ).length

        const secure = total - risk

        setStats({ total, secure, risk })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        Security Dashboard 🛡
      </h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white p-5 rounded shadow">
          <p className="text-gray-500">Total Reports</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-green-100 p-5 rounded shadow">
          <p className="text-gray-600">Secure</p>
          <p className="text-2xl font-bold text-green-700">
            {stats.secure}
          </p>
        </div>

        <div className="bg-red-100 p-5 rounded shadow">
          <p className="text-gray-600">Risk</p>
          <p className="text-2xl font-bold text-red-700">
            {stats.risk}
          </p>
        </div>

      </div>

      {/* INFO */}
      <div className="mt-6 bg-white p-5 rounded shadow">
        <h2 className="font-semibold mb-2">
          Penjelasan Security
        </h2>

        <p className="text-gray-600">
          Halaman ini menampilkan ringkasan keamanan berdasarkan hasil
          DMARC report (SPF, DKIM, dan status failed messages).
        </p>
      </div>

    </div>
  )
}