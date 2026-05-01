'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

interface Alert {
  id: number
  alert_type: string
  status: string
  is_read: boolean
  source_ip: string
  domain: string
  created_at: string
}

const PAGE_SIZE = 10

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)

  // delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // load data
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true)

      const params = filter === 'unread'
        ? { is_read: false }
        : {}

      const res = await api.get('/alerts/', { params })

      setAlerts(res.data.results || [])
      setPage(1)

    } catch {
      alert('Gagal memuat alerts')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  // summary
  const totalUnread = alerts.filter(a => !a.is_read).length
  const totalSent = alerts.filter(a => a.status === 'sent').length

  // pagination
  const totalPages = Math.ceil(alerts.length / PAGE_SIZE)

  const pagedAlerts = alerts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  // mark read
  const handleMarkRead = async (id: number) => {
    try {
      await api.post(`/alerts/${id}/read/`)

      setAlerts(prev =>
        prev.map(a =>
          a.id === id
            ? { ...a, is_read: true }
            : a
        )
      )
    } catch {
      alert('Gagal menandai alert')
    }
  }

  // open modal
  const openDelete = (id: number) => {
    setDeleteId(id)
  }

  // delete alert
  const confirmDelete = async () => {
    if (!deleteId) return

    try {
      await api.delete(`/alerts/${deleteId}/delete/`)

      setAlerts(prev =>
        prev.filter(a => a.id !== deleteId)
      )

    } catch {
      alert('Gagal menghapus alert')
    } finally {
      setDeleteId(null)
    }
  }

  // label
  const alertTypeLabel: Record<string, string> = {
    both_fail: 'SPF & DKIM Gagal',
    spf_fail: 'SPF Gagal',
    dkim_fail: 'DKIM Gagal',
    suspicious_ip: 'IP Mencurigakan',
    policy_reject: 'Policy Reject',
  }

  // icon
  const alertTypeIcon: Record<string, string> = {
    both_fail: '🚨',
    spf_fail: '⚠️',
    dkim_fail: '⚠️',
    suspicious_ip: '🔴',
    policy_reject: '🛡️',
  }

  // loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Alert & Notifikasi 🔔
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitoring keamanan sistem
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">
              Total Alert
            </p>

            <h2 className="text-3xl font-bold text-gray-800">
              {alerts.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">
              Belum Dibaca
            </p>

            <h2 className="text-3xl font-bold text-red-500">
              {totalUnread}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm text-gray-500 mb-1">
              Terkirim
            </p>

            <h2 className="text-3xl font-bold text-green-600">
              {totalSent}
            </h2>
          </div>

        </div>

        {/* FILTER */}
        <div className="flex gap-2 mb-4">

          {(['all', 'unread'] as const).map(f => (

            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium border transition

                ${filter === f
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              {f === 'all'
                ? 'Semua'
                : 'Belum Dibaca'}
            </button>

          ))}

        </div>

        {/* LIST */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {pagedAlerts.length === 0 ? (

            <div className="p-12 text-center text-gray-400">
              Tidak ada alert
            </div>

          ) : (

            <div className="divide-y divide-gray-100">

              {pagedAlerts.map(alert => (

                <div
                  key={alert.id}
                  className={`
                    p-5 flex items-start justify-between gap-4 transition

                    ${!alert.is_read
                      ? 'bg-indigo-50'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >

                  {/* LEFT */}
                  <div className="flex-1 min-w-0">

                    {/* TITLE */}
                    <p className="font-medium text-gray-800 flex items-center gap-2">

                      <span className="text-base">
                        {alertTypeIcon[alert.alert_type]}
                      </span>

                      <span>
                        {alertTypeLabel[alert.alert_type]}
                      </span>

                      {!alert.is_read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      )}

                    </p>

                    {/* DOMAIN */}
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {alert.domain} — {alert.source_ip}
                    </p>

                    {/* TIME */}
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">

                      <span>🕒</span>

                      {(() => {

                        const created = new Date(alert.created_at)
                        const now = new Date()

                        const diffDays =
                          (now.getTime() - created.getTime()) /
                          (1000 * 60 * 60 * 24)

                        return diffDays < 7

                          ? formatDistanceToNow(created, {
                              addSuffix: true,
                              locale: id,
                            })

                          : created.toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })

                      })()}

                    </p>

                  </div>

                  {/* ACTION */}
                  <div className="flex items-center gap-2 flex-shrink-0">

                    {!alert.is_read && (

                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        className="
                          px-3 py-1.5
                          text-xs font-medium
                          rounded-lg
                          bg-indigo-50
                          text-indigo-600
                          hover:bg-indigo-100
                          transition
                        "
                      >
                        Tandai
                      </button>

                    )}

                    <button
                      onClick={() => openDelete(alert.id)}
                      className="
                        px-3 py-1.5
                        text-xs font-medium
                        rounded-lg
                        bg-red-50
                        text-red-500
                        hover:bg-red-100
                        transition
                      "
                    >
                      Hapus
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

          {/* PAGINATION */}
          {totalPages > 1 && (

            <div className="flex items-center justify-between p-4 border-t border-gray-100">

              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="
                  px-4 py-2
                  text-sm
                  rounded-xl
                  border border-gray-200
                  bg-white
                  hover:bg-gray-50
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  transition
                "
              >
                ← Prev
              </button>

              <p className="text-sm text-gray-500">
                Halaman {page} dari {totalPages}
              </p>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="
                  px-4 py-2
                  text-sm
                  rounded-xl
                  border border-gray-200
                  bg-white
                  hover:bg-gray-50
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  transition
                "
              >
                Next →
              </button>

            </div>

          )}

        </div>

      </div>

      {/* DELETE MODAL */}
      {deleteId && (

        <div className="fixed inset-0 z-50 flex items-center justify-center">

          {/* BACKDROP */}
          <div
            className="
              absolute inset-0
              bg-black/40
              backdrop-blur-sm
              animate-fadeIn
            "
            onClick={() => setDeleteId(null)}
          />

          {/* MODAL */}
          <div
            className="
              relative
              bg-white
              w-[360px]
              rounded-2xl
              shadow-2xl
              p-6
              animate-modalIn
            "
          >

            <div className="flex items-center gap-3 mb-3">

              <div className="
                w-11 h-11
                rounded-full
                bg-red-100
                flex items-center justify-center
                text-red-500 text-xl
              ">
                ⚠️
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Hapus Alert?
                </h2>

                <p className="text-sm text-gray-400">
                  Tindakan tidak bisa dibatalkan
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                onClick={() => setDeleteId(null)}
                className="
                  px-4 py-2
                  text-sm
                  rounded-xl
                  border border-gray-200
                  hover:bg-gray-50
                  transition
                "
              >
                Batal
              </button>

              <button
                onClick={confirmDelete}
                className="
                  px-4 py-2
                  text-sm
                  rounded-xl
                  bg-red-500
                  text-white
                  hover:bg-red-600
                  transition
                  shadow-sm
                "
              >
                Hapus
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}