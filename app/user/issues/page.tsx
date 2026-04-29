'use client'

import { useEffect, useState } from 'react'
import { getReports } from '@/lib/reportService'

/* ================= TYPE ================= */

type Report = {
  id: string
  org_name: string
  domain_policy: string
  status: string
  failed_messages: number
  passed_messages: number
}

/* ================= PAGE ================= */

export default function IssuePage() {
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState<Report[]>([])

  useEffect(() => {
    getReports()
      .then((data: { results?: Report[] }) => {
        const reports = data.results ?? []

        const filtered = reports.filter((r) => {
          return (
            r.status === 'failed' ||
            r.failed_messages > 0 ||
            r.domain_policy === 'none'
          )
        })

        setIssues(filtered)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        Security Issues ⚠️
      </h1>

      {/* EMPTY STATE */}
      {issues.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-green-600">
          ✔ Tidak ada issue keamanan terdeteksi
        </div>
      ) : (
        <div className="space-y-4">

          {issues.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded shadow border-l-4 border-red-500"
            >
              <h2 className="font-semibold text-lg">
                {item.org_name}
              </h2>

              <p className="text-gray-600">
                Domain: {item.domain_policy}
              </p>

              <div className="mt-2 text-sm text-red-600 space-y-1">

                {item.status === 'failed' && (
                  <p>❌ Status report failed</p>
                )}

                {item.failed_messages > 0 && (
                  <p>❌ Failed messages: {item.failed_messages}</p>
                )}

                {item.domain_policy === 'none' && (
                  <p>⚠️ DMARC policy masih NONE (rawan spoofing)</p>
                )}

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  )
}