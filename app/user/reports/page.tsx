'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation' 
import {
  getDashboardOverview,
  getReports,
  getReportStats,
  fetchEmailNow,
  DashboardOverview,
  DMARCReport,
  ReportStats,
} from '@/lib/reportService'

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    pass: 'bg-green-100 text-green-700',
    parsed: 'bg-green-100 text-green-700',
    fail: 'bg-red-100 text-red-700',
    error: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
    none: 'bg-gray-100 text-gray-600',
    quarantine: 'bg-orange-100 text-orange-700',
    reject: 'bg-red-100 text-red-700',
  }
  const cls = map[value?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {value?.toUpperCase() || '-'}
    </span>
  )
}

function StatCard({
  title, value, sub, color,
}: { title: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default function ReportsPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [reports, setReports] = useState<DMARCReport[]>([])
  const [reportStats, setReportStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalReports, setTotalReports] = useState(0)
  const PAGE_SIZE = 10
  const router = useRouter()

  const showAlert = (
    title: string,
    text: string,
    icon: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: '#2563eb',
    })
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const [ov, rp, st] = await Promise.all([
          getDashboardOverview(),
          getReports({ page, page_size: PAGE_SIZE }),
          getReportStats(30),
        ])

        setOverview(ov)
        setReports(rp.results)
        setTotalReports(rp.count)
        setReportStats(st)
      } catch {
        setError('Gagal memuat data. Pastikan Django server berjalan.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [page])

  const handleFetchEmail = async () => {
    try {
      setFetching(true)

      const res = await fetchEmailNow()

      showAlert(
        'Berhasil',
        `Proses fetch dimulai! Task ID: ${res.task_id}`,
        'success'
      )
    } catch {
      showAlert(
        'Gagal',
        'Gagal trigger fetch email. Pastikan token.json Gmail sudah ada di server.',
        'error'
      )
    } finally {
      setFetching(false)
    }
  }

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('file', file)

      await api.post('/reports/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      showAlert(
        'Berhasil',
        `File ${file.name} berhasil diupload! Sedang diproses...`,
        'success'
      )

      setTimeout(() => window.location.reload(), 2000)
    } catch {
      showAlert(
        'Gagal',
        'Gagal upload file. Pastikan format .xml, .gz, atau .zip',
        'error'
      )
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat data laporan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow text-center max-w-md">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-red-600 font-semibold mb-2">Koneksi Gagal</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  const s = overview?.summary

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="p-6 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">DMARC Reports 📊</h1>
            <p className="text-gray-500 mt-1">Laporan keamanan email 30 hari terakhir</p>
          </div>
          <div className="flex items-center gap-3">
            <label className={`flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
              {uploading ? '⏳ Uploading...' : '📂 Upload XML'}
              <input
                type="file"
                accept=".xml,.gz,.zip"
                className="hidden"
                onChange={handleUploadFile}
                disabled={uploading}
              />
            </label>
            <button
              onClick={handleFetchEmail}
              disabled={fetching}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              {fetching ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📥'}
              {fetching ? 'Mengambil...' : 'Fetch Email Sekarang'}
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Reports" value={s?.total_reports ?? 0} sub="Semua laporan" color="text-blue-600" />
          <StatCard title="Pass Rate" value={`${s?.pass_rate_30d ?? 0}%`} sub="30 hari terakhir" color={(s?.pass_rate_30d ?? 0) >= 80 ? 'text-green-600' : 'text-red-500'} />
          <StatCard title="Gagal Validasi" value={s?.failed_messages_30d ?? 0} sub="Pesan gagal SPF/DKIM" color="text-red-500" />
          <StatCard title="IP Mencurigakan" value={s?.suspicious_ips_30d ?? 0} sub="Unik dalam 30 hari" color="text-orange-500" />
        </div>

        {(s?.unread_alerts ?? 0) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-semibold text-red-700">{s?.unread_alerts} alert belum dibaca</p>
              <p className="text-red-500 text-sm">Ada aktivitas mencurigakan yang perlu diperiksa</p>
            </div>
            <button
              onClick={() => router.push('/user/alerts')}
              className="ml-auto bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm"
            >
              Lihat Alert
            </button>
          </div>
        )}

        {reportStats && (
          <div className="bg-white rounded-xl shadow border p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Distribusi Validasi</h3>
              <span className="text-xs text-gray-400">Total {reportStats.total_messages.toLocaleString()} pesan</span>
            </div>
            <div className="flex rounded-full overflow-hidden h-4 mb-2">
              <div className="bg-green-500 transition-all" style={{ width: `${reportStats.pass_rate}%` }} />
              <div className="bg-red-400" style={{ width: `${100 - reportStats.pass_rate}%` }} />
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Pass: {reportStats.passed_messages.toLocaleString()}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Fail: {reportStats.failed_messages.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Daftar Laporan</h3>
            <span className="text-sm text-gray-400">{totalReports} laporan ditemukan</span>
          </div>

          {reports.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium">Belum ada laporan</p>
              <p className="text-sm mt-1">Upload file XML atau klik Fetch Email Sekarang</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Pengirim</th>
                    <th className="px-4 py-3 text-left">Domain</th>
                    <th className="px-4 py-3 text-left">Periode</th>
                    <th className="px-4 py-3 text-center">Total</th>
                    <th className="px-4 py-3 text-center">Pass</th>
                    <th className="px-4 py-3 text-center">Fail</th>
                    <th className="px-4 py-3 text-center">Policy</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{r.org_name || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{r.domain_policy || r.domain_name || '-'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {r.date_begin ? new Date(r.date_begin).toLocaleDateString('id-ID') : '-'}
                        {' → '}
                        {r.date_end ? new Date(r.date_end).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{r.total_messages.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">{r.passed_messages.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center text-red-500 font-semibold">{r.failed_messages.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge value={r.policy_p} /></td>
                      <td className="px-4 py-3 text-center"><StatusBadge value={r.status} /></td>
                      <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => router.push(`/user/reports/${r.id}`)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Detail →
                      </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalReports > PAGE_SIZE && (
            <div className="p-4 border-t flex items-center justify-between">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">← Sebelumnya</button>
              <span className="text-sm text-gray-500">Halaman {page} dari {Math.ceil(totalReports / PAGE_SIZE)}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(totalReports / PAGE_SIZE)} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Selanjutnya →</button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}