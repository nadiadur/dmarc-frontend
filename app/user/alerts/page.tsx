'use client'

import { useEffect, useState, useCallback } from 'react'
import api from '@/lib/api'

interface Alert {
  id: number
  alert_type: string
  channel: string
  recipient: string
  subject: string
  status: string
  is_read: boolean
  source_ip: string
  domain: string
  sent_at: string
  created_at: string
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [totalUnread, setTotalUnread] = useState(0)

  // ✅ FIX: pakai useCallback
  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true)
      const params = filter === 'unread' ? { is_read: false } : {}
      const res = await api.get('/alerts/', { params })
      setAlerts(res.data.results || [])
      setTotalUnread(res.data.unread || 0)
    } catch {
      alert('Gagal memuat alerts')
    } finally {
      setLoading(false)
    }
  }, [filter])

  // ✅ FIX: dependency benar
  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const handleMarkRead = async (id: number) => {
    try {
      await api.post(`/alerts/${id}/read/`)
      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, is_read: true } : a))
      )
      setTotalUnread(prev => Math.max(0, prev - 1))
    } catch {
      alert('Gagal menandai alert')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const unread = alerts.filter(a => !a.is_read)
      await Promise.all(unread.map(a => api.post(`/alerts/${a.id}/read/`)))
      setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))
      setTotalUnread(0)
    } catch {
      alert('Gagal menandai semua alert')
    }
  }

  const alertTypeLabel: Record<string, string> = {
    both_fail: 'SPF & DKIM Gagal',
    spf_fail: 'SPF Gagal',
    dkim_fail: 'DKIM Gagal',
    suspicious_ip: 'IP Mencurigakan',
    policy_reject: 'Policy Reject',
  }


  const alertTypeIcon: Record<string, string> = {
    both_fail: '🚨',
    spf_fail: '⚠️',
    dkim_fail: '⚠️',
    suspicious_ip: '🔴',
    policy_reject: '🛡️',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Alert & Notifikasi 🔔</h1>
            <p className="text-gray-500 text-sm mt-1">
              Aktivitas mencurigakan yang terdeteksi sistem
            </p>
          </div>

          <div className="flex items-center gap-3">
            {totalUnread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow border p-4 text-center">
            <p className="text-2xl font-bold">{alerts.length}</p>
            <p className="text-gray-500 text-sm">Total Alert</p>
          </div>

          <div className="bg-white rounded-xl shadow border p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{totalUnread}</p>
            <p className="text-gray-500 text-sm">Belum Dibaca</p>
          </div>

          <div className="bg-white rounded-xl shadow border p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {alerts.filter(a => a.status === 'sent').length}
            </p>
            <p className="text-gray-500 text-sm">Terkirim</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600'
              }`}
            >
              {f === 'all' ? 'Semua' : `Belum Dibaca (${totalUnread})`}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          {alerts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">🎉</p>
              <p>
                {filter === 'unread'
                  ? 'Semua alert sudah dibaca!'
                  : 'Belum ada alert'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-5 ${
                    !alert.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {alertTypeIcon[alert.alert_type]}{' '}
                        {alertTypeLabel[alert.alert_type]}
                      </p>
                      <p className="text-sm text-gray-500">
                        {alert.domain} - {alert.source_ip}
                      </p>
                    </div>

                    {!alert.is_read && (
                      <button
                        onClick={() => handleMarkRead(alert.id)}
                        className="text-xs text-blue-600"
                      >
                        Tandai dibaca
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}