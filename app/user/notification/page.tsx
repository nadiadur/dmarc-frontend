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
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

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
        // Config belum ada — pakai default
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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

  const handleTest = async () => {
    try {
      setTesting(true)
      setTestResult(null)
      await api.post('/notifications/test/')
      setTestResult({ success: true, message: 'Pesan test berhasil dikirim ke Telegram!' })
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setTestResult({
        success: false,
        message: e.response?.data?.detail || 'Gagal kirim pesan test'
      })
    } finally {
      setTesting(false)
    }
  }

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm('Yakin hapus notifikasi ini?')) return
    try {
      await api.delete(`/alerts/${id}/delete/`)
      setHistory(prev => prev.filter(h => h.id !== id))
    } catch {
      alert('Gagal menghapus notifikasi')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Yakin hapus semua riwayat notifikasi?')) return
    try {
      await Promise.all(history.map(h => api.delete(`/alerts/${h.id}/delete/`)))
      setHistory([])
    } catch {
      alert('Gagal menghapus semua notifikasi')
    }
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
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi 🔔</h1>
          <p className="text-gray-500 text-sm mt-1">
            Setup notifikasi Telegram saat ada aktivitas mencurigakan
          </p>
        </div>

        {/* Setup Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">📱 Cara Setup Telegram Bot</h3>
          <ol className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="font-bold flex-shrink-0">1.</span>
              Buka Telegram → cari <strong>@BotFather</strong> → ketik <code className="bg-blue-100 px-1 rounded">/newbot</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold flex-shrink-0">2.</span>
              Isi nama bot dan username → copy <strong>token</strong> yang diberikan
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold flex-shrink-0">3.</span>
              Cari bot kamu → klik <strong>Start</strong>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold flex-shrink-0">4.</span>
              Buka browser: <code className="bg-blue-100 px-1 rounded text-xs">https://api.telegram.org/bot{'<TOKEN>'}/getUpdates</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold flex-shrink-0">5.</span>
              Copy nilai <strong>{'"id"'}</strong> dari bagian <strong>{'"chat"'}</strong> — itu Chat ID kamu
            </li>
          </ol>
        </div>

        {/* Config Form */}
        <div className="bg-white rounded-xl shadow border p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-700">Konfigurasi Telegram</h2>
            <div
              onClick={() => setConfig(prev => ({ ...prev, telegram_enabled: !prev.telegram_enabled }))}
              className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition ${
                config.telegram_enabled ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`w-10 h-5 rounded-full transition-colors ${config.telegram_enabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${config.telegram_enabled ? 'translate-x-5' : ''}`} />
              </div>
              <span className={`text-sm font-medium ${config.telegram_enabled ? 'text-green-700' : 'text-gray-500'}`}>
                {config.telegram_enabled ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Bot Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="7xxxxxxxxx:AAF..."
                  value={config.telegram_bot_token}
                  onChange={(e) => setConfig(prev => ({ ...prev, telegram_bot_token: e.target.value }))}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm pr-24"
                  disabled={!config.telegram_enabled}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  {showToken ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              <p className="text-gray-400 text-xs mt-1">Dari @BotFather</p>
            </div>

            {/* Chat ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chat ID</label>
              <input
                type="text"
                placeholder="123456789"
                value={config.telegram_chat_id}
                onChange={(e) => setConfig(prev => ({ ...prev, telegram_chat_id: e.target.value }))}
                className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                disabled={!config.telegram_enabled}
              />
              <p className="text-gray-400 text-xs mt-1">
                Dari getUpdates API — nilai <strong>{'"id"'}</strong> di bagian <strong>{'"chat"'}</strong>
              </p>
            </div>

            {/* Trigger settings */}
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-gray-700 mb-3">Kirim notifikasi saat:</p>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  config.notify_on_suspicious ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <input
                    type="checkbox"
                    checked={config.notify_on_suspicious}
                    onChange={(e) => setConfig(prev => ({ ...prev, notify_on_suspicious: e.target.checked }))}
                    className="w-4 h-4 accent-red-500"
                    disabled={!config.telegram_enabled}
                  />
                  <div>
                    <p className="font-medium text-gray-700 text-sm">🚨 IP Mencurigakan</p>
                    <p className="text-gray-400 text-xs">SPF dan DKIM keduanya gagal — kemungkinan spoofing</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  config.notify_on_any_fail ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                }`}>
                  <input
                    type="checkbox"
                    checked={config.notify_on_any_fail}
                    onChange={(e) => setConfig(prev => ({ ...prev, notify_on_any_fail: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-500"
                    disabled={!config.telegram_enabled}
                  />
                  <div>
                    <p className="font-medium text-gray-700 text-sm">⚠️ Semua Kegagalan Validasi</p>
                    <p className="text-gray-400 text-xs">SPF atau DKIM gagal — termasuk yang tidak mencurigakan</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Test result */}
            {testResult && (
              <div className={`rounded-lg p-3 text-sm ${
                testResult.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult.success ? '✅ ' : '❌ '}{testResult.message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleTest}
                disabled={testing || !config.telegram_enabled || !config.telegram_bot_token || !config.telegram_chat_id}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 py-2.5 rounded-lg font-medium transition"
              >
                {testing ? '⏳ Mengirim...' : '📨 Test Kirim'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition"
              >
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">
              Riwayat Notifikasi
              {history.length > 0 && (
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  ({history.length} notifikasi)
                </span>
              )}
            </h3>
            {history.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="text-xs text-red-500 hover:text-red-700 hover:underline transition"
              >
                🗑️ Hapus Semua
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">Belum ada notifikasi terkirim</p>
            </div>
          ) : (
            <div className="divide-y">
              {history.map((h) => (
                <div key={h.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">
                      {h.alert_type === 'both_fail' ? '🚨' : '⚠️'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {h.domain || '-'} — <span className="font-mono">{h.source_ip || '-'}</span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {h.sent_at ? new Date(h.sent_at).toLocaleString('id-ID') : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      h.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {h.status === 'sent' ? '✓ Terkirim' : '✗ Gagal'}
                    </span>
                    <button
                      onClick={() => handleDelete(h.id)}
                      className="text-gray-400 hover:text-red-500 transition p-1 rounded hover:bg-red-50"
                      title="Hapus notifikasi"
                    >
                      🗑️
                    </button>
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