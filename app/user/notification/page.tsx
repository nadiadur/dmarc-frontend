'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface NotificationConfig {
  telegram_enabled: boolean
  telegram_bot_token: string
  telegram_chat_id: string
  notify_on_suspicious: boolean
  notify_on_any_fail: boolean
}

interface AlertHistory {
  id: number
  alert_type: string
  status: string
  domain: string
  source_ip: string
  sent_at: string
  is_read: boolean
}

const PAGE_SIZE = 10

export default function NotificationsPage() {

  const [config, setConfig] = useState<NotificationConfig>({
    telegram_enabled: false,
    telegram_bot_token: '',
    telegram_chat_id: '',
    notify_on_suspicious: true,
    notify_on_any_fail: false,
  })

  const [history, setHistory] = useState<AlertHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  const [showToken, setShowToken] = useState(false)

  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const [page, setPage] = useState(1)

  // 🔥 popup state
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleteAll, setDeleteAll] = useState(false)

  // pagination
  const totalPages = Math.ceil(history.length / PAGE_SIZE)

  const pagedHistory = history.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  // load
  useEffect(() => {

    const loadData = async () => {

      try {

        const [configRes, historyRes] = await Promise.all([
          api.get('/notifications/config/'),
          api.get('/notifications/history/'),
        ])

        setConfig(configRes.data)
        setHistory(historyRes.data.results || [])

      } catch {
        // ignore
      } finally {
        setLoading(false)
      }

    }

    loadData()

  }, [])

  // save
  const handleSave = async () => {

    try {

      setSaving(true)

      await api.post('/notifications/config/', config)

      alert('Konfigurasi notifikasi berhasil disimpan!')

    } catch {

      alert('Gagal menyimpan konfigurasi')

    } finally {

      setSaving(false)

    }

  }

  // test
  const handleTest = async () => {

    try {

      setTesting(true)
      setTestResult(null)

      await api.post('/notifications/test/')

      setTestResult({
        success: true,
        message: 'Pesan test berhasil dikirim ke Telegram!'
      })

    } catch (err: unknown) {

      const e = err as {
        response?: {
          data?: {
            detail?: string
          }
        }
      }

      setTestResult({
        success: false,
        message:
          e.response?.data?.detail ||
          'Gagal kirim pesan test'
      })

    } finally {

      setTesting(false)

    }

  }

  // open delete
  const openDelete = (id: number) => {
    setDeleteId(id)
  }

  // confirm delete
  const confirmDelete = async () => {

    if (!deleteId) return

    try {

      await api.delete(`/alerts/${deleteId}/delete/`)

      setHistory(prev =>
        prev.filter(h => h.id !== deleteId)
      )

      if (pagedHistory.length === 1 && page > 1) {
        setPage(p => p - 1)
      }

    } catch {

      alert('Gagal menghapus notifikasi')

    } finally {

      setDeleteId(null)

    }

  }

  // delete all
  const confirmDeleteAll = async () => {

    try {

      await Promise.all(
        history.map(h =>
          api.delete(`/alerts/${h.id}/delete/`)
        )
      )

      setHistory([])
      setPage(1)

    } catch {

      alert('Gagal menghapus semua notifikasi')

    } finally {

      setDeleteAll(false)

    }

  }

  // loading
  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )

  }

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
       <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Notifikasi 🔔
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Setup notifikasi Telegram saat ada aktivitas mencurigakan
          </p>
        </div>

        {/* GUIDE */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">

          <h3 className="font-semibold text-blue-800 mb-3">
            📱 Cara Setup Telegram Bot
          </h3>

          <ol className="space-y-2 text-sm text-blue-700">

            <li className="flex gap-2">
              <span className="font-bold">1.</span>
              Buka Telegram → cari <strong>@BotFather</strong>
            </li>

            <li className="flex gap-2">
              <span className="font-bold">2.</span>
              Ketik <code>/newbot</code>
            </li>

            <li className="flex gap-2">
              <span className="font-bold">3.</span>
              Copy token bot
            </li>

             <li className="flex gap-2">
             <span className="font-bold">4.</span>
              Buka bot → klik <strong>Start</strong> lalu kirim pesan (contoh: <code>hai</code> atau <code>halo</code>)
            </li>

            <li className="flex gap-2">
              <span className="font-bold">5.</span>
                  <span>Buka browser, ketik <code className="text-xs bg-blue-100 px-1 rounded">https://api.telegram.org/botTOKEN/getUpdates</code> (ganti TOKEN dengan token bot kamu), lalu ambil nilai <code className="text-xs bg-blue-100 px-1 rounded">chat.id</code></span>
            </li>

          </ol>

        </div>

        {/* CONFIG */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">

          <div className="flex items-center justify-between mb-5">

            <h2 className="font-semibold text-gray-700">
              Konfigurasi Telegram
            </h2>

            <div
              onClick={() =>
                setConfig(prev => ({
                  ...prev,
                  telegram_enabled: !prev.telegram_enabled
                }))
              }
              className={`
                flex items-center gap-2 cursor-pointer
                px-3 py-1.5 rounded-xl border transition

                ${config.telegram_enabled
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200'
                }
              `}
            >

              <div
                className={`
                  w-10 h-5 rounded-full transition-colors

                  ${config.telegram_enabled
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                  }
                `}
              >

                <div
                  className={`
                    w-5 h-5 bg-white rounded-full shadow
                    transition-transform

                    ${config.telegram_enabled
                      ? 'translate-x-5'
                      : ''
                    }
                  `}
                />

              </div>

              <span
                className={`
                  text-sm font-medium

                  ${config.telegram_enabled
                    ? 'text-green-700'
                    : 'text-gray-500'
                  }
                `}
              >
                {config.telegram_enabled
                  ? 'Aktif'
                  : 'Nonaktif'}
              </span>

            </div>

          </div>

          <div className="space-y-4">

            {/* TOKEN */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bot Token
              </label>

              <div className="relative">

                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="7xxxxxxxxx:AAF..."
                  value={config.telegram_bot_token}
                  onChange={(e) =>
                    setConfig(prev => ({
                      ...prev,
                      telegram_bot_token: e.target.value
                    }))
                  }
                  disabled={!config.telegram_enabled}
                  className="
                    w-full px-4 py-2.5 pr-24
                    border rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="
                    absolute right-3 top-2.5
                    text-xs text-gray-400 hover:text-gray-600
                  "
                >
                  {showToken
                    ? 'Sembunyikan'
                    : 'Tampilkan'}
                </button>

              </div>

            </div>

            {/* CHAT ID */}
            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chat ID
              </label>

              <input
                type="text"
                placeholder="123456789"
                value={config.telegram_chat_id}
                onChange={(e) =>
                  setConfig(prev => ({
                    ...prev,
                    telegram_chat_id: e.target.value
                  }))
                }
                disabled={!config.telegram_enabled}
                className="
                  w-full px-4 py-2.5
                  border rounded-xl text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-300
                "
              />

            </div>

            {/* OPTIONS */}
            <div className="pt-2 border-t">

              <p className="text-sm font-medium text-gray-700 mb-3">
                Kirim notifikasi saat:
              </p>

              <div className="space-y-3">

                <label className={`
                  flex gap-3 p-3 rounded-xl border cursor-pointer transition

                  ${config.notify_on_suspicious
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                  }
                `}>

                  <input
                    type="checkbox"
                    checked={config.notify_on_suspicious}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        notify_on_suspicious: e.target.checked
                      }))
                    }
                    className="accent-red-500"
                  />

                  <div>
                    <p className="font-medium text-sm text-gray-700">
                      🚨 IP Mencurigakan
                    </p>

                    <p className="text-xs text-gray-400">
                      SPF & DKIM gagal
                    </p>
                  </div>

                </label>

                <label className={`
                  flex gap-3 p-3 rounded-xl border cursor-pointer transition

                  ${config.notify_on_any_fail
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                  }
                `}>

                  <input
                    type="checkbox"
                    checked={config.notify_on_any_fail}
                    onChange={(e) =>
                      setConfig(prev => ({
                        ...prev,
                        notify_on_any_fail: e.target.checked
                      }))
                    }
                    className="accent-yellow-500"
                  />

                  <div>
                    <p className="font-medium text-sm text-gray-700">
                      ⚠️ Semua Kegagalan
                    </p>

                    <p className="text-xs text-gray-400">
                      SPF atau DKIM gagal
                    </p>
                  </div>

                </label>

              </div>

            </div>

            {/* RESULT */}
            {testResult && (

              <div className={`
                rounded-xl p-3 text-sm border

                ${testResult.success
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
                }
              `}>
                {testResult.success ? '✅ ' : '❌ '}
                {testResult.message}
              </div>

            )}

            {/* ACTION */}
            <div className="flex gap-3 pt-2">

              <button
                onClick={handleTest}
                disabled={
                  testing ||
                  !config.telegram_enabled ||
                  !config.telegram_bot_token ||
                  !config.telegram_chat_id
                }
                className="
                  flex-1 py-2.5 rounded-xl font-medium transition
                  bg-gray-100 hover:bg-gray-200
                  disabled:opacity-40
                "
              >
                {testing
                  ? '⏳ Mengirim...'
                  : '📨 Test Kirim'}
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="
                  flex-1 py-2.5 rounded-xl font-medium transition
                  bg-blue-600 hover:bg-blue-700
                  text-white disabled:bg-blue-300
                "
              >
                {saving
                  ? 'Menyimpan...'
                  : '💾 Simpan'}
              </button>

            </div>

          </div>

        </div>

        {/* HISTORY */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          <div className="p-5 border-b flex items-center justify-between">

            <h3 className="font-semibold text-gray-700">
              Riwayat Notifikasi

              {history.length > 0 && (
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  ({history.length})
                </span>
              )}

            </h3>

            {history.length > 0 && (

              <button
                onClick={() => setDeleteAll(true)}
                className="
                  text-xs text-red-500
                  hover:text-red-700
                  transition
                "
              >
                🗑️ Hapus Semua
              </button>

            )}

          </div>

          {history.length === 0 ? (

            <div className="p-10 text-center text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">
                Belum ada notifikasi
              </p>
            </div>

          ) : (

            <>
              <div className="divide-y">

                {pagedHistory.map((h) => (

                  <div
                    key={h.id}
                    className="
                      p-4 flex items-center justify-between gap-4
                      hover:bg-gray-50 transition
                    "
                  >

                    <div className="flex items-center gap-3 flex-1 min-w-0">

                      <span className="text-lg">
                        {h.alert_type === 'both_fail'
                          ? '🚨'
                          : '⚠️'}
                      </span>

                      <div className="min-w-0">

                        <p className="text-sm font-medium text-gray-700 truncate">
                          {h.domain || '-'} —
                          <span className="font-mono ml-1">
                            {h.source_ip || '-'}
                          </span>
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {h.sent_at
                            ? new Date(h.sent_at).toLocaleString('id-ID')
                            : '-'}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium

                        ${h.status === 'sent'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-600'
                        }
                      `}>

                        {h.status === 'sent'
                          ? '✓ Terkirim'
                          : '✗ Gagal'}

                      </span>

                      <button
                        onClick={() => openDelete(h.id)}
                        className="
                          text-gray-400 hover:text-red-500
                          transition p-1 rounded-lg
                          hover:bg-red-50
                        "
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                ))}

              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (

                <div className="p-4 border-t flex items-center justify-between">

                  <button
                    onClick={() =>
                      setPage(p => Math.max(1, p - 1))
                    }
                    disabled={page === 1}
                    className="
                      px-3 py-1.5 text-sm rounded-xl border
                      disabled:opacity-40 hover:bg-gray-50
                    "
                  >
                    ← Sebelumnya
                  </button>

                  <span className="text-sm text-gray-500">
                    Halaman {page} dari {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setPage(p => Math.min(totalPages, p + 1))
                    }
                    disabled={page === totalPages}
                    className="
                      px-3 py-1.5 text-sm rounded-xl border
                      disabled:opacity-40 hover:bg-gray-50
                    "
                  >
                    Selanjutnya →
                  </button>

                </div>

              )}

            </>

          )}

        </div>

      </div>

      {/* DELETE ONE MODAL */}
      {deleteId && (

        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="
              absolute inset-0
              bg-black/40 backdrop-blur-sm
              animate-fadeIn
            "
            onClick={() => setDeleteId(null)}
          />

          <div
            className="
              relative bg-white w-[360px]
              rounded-2xl shadow-2xl p-6
              animate-modalIn
            "
          >

            <div className="flex items-center gap-3 mb-4">

              <div className="
                w-11 h-11 rounded-full
                bg-red-100 flex items-center justify-center
                text-red-500 text-xl
              ">
                ⚠️
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  Hapus Notifikasi?
                </h2>

                <p className="text-sm text-gray-400">
                  Data tidak bisa dikembalikan
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setDeleteId(null)}
                className="
                  px-4 py-2 rounded-xl border
                  hover:bg-gray-50 transition
                "
              >
                Batal
              </button>

              <button
                onClick={confirmDelete}
                className="
                  px-4 py-2 rounded-xl
                  bg-red-500 text-white
                  hover:bg-red-600 transition
                "
              >
                Hapus
              </button>

            </div>

          </div>

        </div>

      )}

      {/* DELETE ALL MODAL */}
      {deleteAll && (

        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            className="
              absolute inset-0
              bg-black/40 backdrop-blur-sm
              animate-fadeIn
            "
            onClick={() => setDeleteAll(false)}
          />

          <div
            className="
              relative bg-white w-[380px]
              rounded-2xl shadow-2xl p-6
              animate-modalIn
            "
          >

            <div className="flex items-center gap-3 mb-4">

              <div className="
                w-11 h-11 rounded-full
                bg-red-100 flex items-center justify-center
                text-red-500 text-xl
              ">
                🗑️
              </div>

              <div>
                <h2 className="font-semibold text-gray-800">
                  Hapus Semua?
                </h2>

                <p className="text-sm text-gray-400">
                  Semua riwayat akan dihapus
                </p>
              </div>

            </div>

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setDeleteAll(false)}
                className="
                  px-4 py-2 rounded-xl border
                  hover:bg-gray-50 transition
                "
              >
                Batal
              </button>

              <button
                onClick={confirmDeleteAll}
                className="
                  px-4 py-2 rounded-xl
                  bg-red-500 text-white
                  hover:bg-red-600 transition
                "
              >
                Hapus Semua
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )
}
