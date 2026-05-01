'use client'

import { useEffect, useState } from 'react'
import { getReports } from '@/lib/reportService'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { id as localeID } from 'date-fns/locale'

/* ================= TYPE ================= */

type Report = {
  id: string
  org_name: string
  domain_policy: string
  status: string
  failed_messages: number
  passed_messages: number
  created_at?: string
}

/* ================= CONST ================= */

const PAGE_SIZE = 5

/* ================= PAGE ================= */

export default function IssuePage() {
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState<Report[]>([])
  const [page, setPage] = useState(1)

  // popup delete
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

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

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(issues.length / PAGE_SIZE)

  const pagedIssues = issues.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  /* ================= DELETE ================= */

  const openDelete = (id: string) => {
    setDeleteError(null)
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return

    setDeleting(true)
    setDeleteError(null)

    try {
      // ✅ FIX: endpoint yang benar sesuai ReportDetailView Django
      // DELETE /api/reports/{id}/ — bukan /reports/{id}/delete/
      await api.delete(`/reports/${deleteId}/`)

      const remaining = issues.filter(i => i.id !== deleteId)
      setIssues(remaining)

      // ✅ FIX: hitung sisa halaman dari data baru, bukan pagedIssues lama
      const newTotalPages = Math.ceil(remaining.length / PAGE_SIZE)
      if (page > newTotalPages && newTotalPages > 0) {
        setPage(newTotalPages)
      }

      setDeleteId(null)

    } catch (err: unknown) {
      // ✅ Tampilkan pesan error dari server jika ada
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
        setDeleteError('Gagal menghapus issue. Coba lagi.')
      }
    } finally {
      setDeleting(false)
    }
  }

  /* ================= DATE ================= */

  const formatTime = (date?: string) => {
    if (!date) return '-'

    const created = new Date(date)
    const now = new Date()

    const diffDays =
      (now.getTime() - created.getTime()) /
      (1000 * 60 * 60 * 24)

    if (diffDays >= 7) {
      return created.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    }

    return formatDistanceToNow(created, {
      addSuffix: true,
      locale: localeID,
    })
  }

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Security Issues ⚠️
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitoring issue keamanan dan validasi email
          </p>
        </div>

        {/* EMPTY */}
        {issues.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-3">
              ✅
            </div>

            <p className="text-lg font-medium text-green-600">
              Tidak ada issue keamanan
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Semua domain aman dan tervalidasi
            </p>
          </div>
        ) : (
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

            <div className="divide-y">

              {pagedIssues.map((item) => (
                <div
                  key={item.id}
                  className="p-5 hover:bg-gray-50 transition"
                >

                  <div className="flex items-start justify-between gap-4">

                    {/* LEFT */}
                    <div className="flex-1">

                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-lg">
                          ⚠️
                        </div>

                        <div>
                          <h2 className="font-semibold text-gray-800">
                            {item.org_name}
                          </h2>

                          <p className="text-sm text-gray-500">
                            Policy: {item.domain_policy}
                          </p>
                        </div>
                      </div>

                      {/* TIME */}
                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                        🕒 {formatTime(item.created_at)}
                      </p>

                      {/* ISSUES */}
                      <div className="mt-4 space-y-2">

                        {item.status === 'failed' && (
                          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium mr-2">
                            ❌ Status report failed
                          </div>
                        )}

                        {item.failed_messages > 0 && (
                          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium mr-2">
                            ❌ Failed messages: {item.failed_messages}
                          </div>
                        )}

                        {item.domain_policy === 'none' && (
                          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                            ⚠️ DMARC policy NONE
                          </div>
                        )}

                      </div>

                    </div>

                    {/* ACTION */}
                    <button
                      onClick={() => openDelete(item.id)}
                      className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition"
                    >
                      🗑️ Hapus
                    </button>

                  </div>
                </div>
              ))}

            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t bg-gray-50">

                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border rounded-xl bg-white hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  ← Sebelumnya
                </button>

                <span className="text-sm text-gray-500">
                  Halaman {page} dari {totalPages}
                </span>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm border rounded-xl bg-white hover:bg-gray-100 disabled:opacity-40 transition"
                >
                  Selanjutnya →
                </button>

              </div>
            )}

          </div>
        )}
      </div>

      {/* ================= DELETE POPUP ================= */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => !deleting && setDeleteId(null)}
          />

          {/* MODAL */}
          <div className="relative bg-white w-[380px] rounded-3xl shadow-2xl p-6 animate-modalIn">

            {/* ICON */}
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-3xl mb-4 animate-bounce">
              🗑️
            </div>

            {/* TITLE */}
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              Hapus Issue?
            </h2>

            {/* DESC */}
            <p className="text-sm text-gray-500 text-center mb-4">
              Data issue akan dihapus permanen dan tidak bisa dipulihkan kembali.
            </p>

            {/* ✅ ERROR MESSAGE */}
            {deleteError && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">
                {deleteError}
              </div>
            )}

            {/* BUTTON */}
            <div className="flex gap-3">

              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Batal
              </button>

              <button
                onClick={confirmDelete}
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
      )}
    </div>
  )
}