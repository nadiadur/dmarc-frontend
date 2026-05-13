'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Swal from 'sweetalert2'


interface Domain {
  id: number
  domain_name: string
  rua_email: string
  is_verified: boolean
  total_reports: number
  created_at: string
}

interface ScanResult {
  spf_exists: boolean
  dkim_exists: boolean
  dmarc_exists: boolean
  summary: string
}

interface RecordItem {
  status: 'missing' | 'exists'
  name?: string
  type?: string
  value?: string
  description: string
  private_key?: string
  selector?: string
  note?: string
}

interface GenerateResult {
  domain: string
  rua_email: string
  scan_result: ScanResult
  records_to_add: {
    spf: RecordItem
    dkim: RecordItem
    dmarc: RecordItem
  }
  dkim_keypair: {
    generated: boolean
    private_key?: string
    selector?: string
    note?: string
  }
}

interface VerifyResult {
  is_verified: boolean
  message: string
  checks: {
    spf: { status: string; found: boolean; value: string }
    dkim: { status: string; found: boolean; value: string; selector: string }
    dmarc: { status: string; found: boolean; value: string; policy: string }
  }
}

type Step = 'list' | 'add' | 'scan' | 'records' | 'verify' | 'policy'
type Policy = 'none' | 'quarantine' | 'reject'

export default function DomainPage() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<Step>('list')
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [generateResult, setGenerateResult] = useState<GenerateResult | null>(null)
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<Policy>('none')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
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

  const [formDomain, setFormDomain] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [dkimSelector, setDkimSelector] = useState('default')

  const loadDomains = async () => {
    try {
      setLoading(true)
      const res = await api.get('/domains/')
      setDomains(res.data)
    } catch {
      showAlert('Gagal', 'Gagal memuat domain', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDomains() }, [])

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  // ── Tambah domain ─────────────────────────────────────────────────────────
  const handleAddDomain = async () => {
    if (!formDomain || !formEmail) {
        showAlert(
          'Peringatan',
          'Domain dan email wajib diisi',
          'warning'
        )
        return
      }
    try {
      setSubmitting(true)
      const res = await api.post('/domains/', {
        domain_name: formDomain.toLowerCase().trim(),
        rua_email: formEmail.trim(),
      })
      setSelectedDomain(res.data)
      await loadDomains()
      setStep('scan')
      // Auto scan setelah tambah
      await handleScan(res.data.id)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      showAlert(
        'Gagal',
        e.response?.data?.detail || 'Gagal menambah domain',
        'error'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ── Scan DNS ──────────────────────────────────────────────────────────────
  const handleScan = async (domainId: number) => {
    try {
      setSubmitting(true)
      const res = await api.post(`/domains/${domainId}/scan/`, {
        dkim_selector: dkimSelector,
      })
      setScanResult(res.data.scan_result || {
        spf_exists: res.data.scan?.spf?.found,
        dkim_exists: res.data.scan?.dkim?.found,
        dmarc_exists: res.data.scan?.dmarc?.found,
        summary: res.data.summary,
      })
    } catch {
      showAlert('Gagal', 'Gagal scan DNS', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Generate records ──────────────────────────────────────────────────────
  const handleGenerateRecords = async () => {
    if (!selectedDomain) return
    try {
      setSubmitting(true)
      const res = await api.post(`/domains/${selectedDomain.id}/generate-records/`, {
        dkim_selector: dkimSelector,
        policy: selectedPolicy,
      })
      setGenerateResult(res.data)
      setStep('records')
    } catch {
      showAlert('Gagal', 'Gagal generate DNS records', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Verifikasi ────────────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!selectedDomain) return
    try {
      setSubmitting(true)
      const res = await api.post(`/domains/${selectedDomain.id}/verify/`, {
        dkim_selector: dkimSelector,
      })
      setVerifyResult(res.data)
      if (res.data.is_verified) {
        await loadDomains()
        setTimeout(() => setStep('policy'), 1500)
      }
    } catch {
      showAlert('Gagal', 'Gagal verifikasi DNS', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Set policy ────────────────────────────────────────────────────────────
  const handleSetPolicy = async () => {
    if (!selectedDomain) return
    try {
      setSubmitting(true)
      await api.patch(`/domains/${selectedDomain.id}/policy/`, { policy: selectedPolicy })
      showAlert(
        'Berhasil',
        `Policy ${selectedPolicy.toUpperCase()} berhasil diterapkan!`,
        'success'
      )
      setStep('list')
      setSelectedDomain(null)
    } catch {
      showAlert('Gagal', 'Gagal update policy', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Hapus domain ──────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Hapus domain?',
      text: 'Domain akan dihapus dari monitoring',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    })

    if (!result.isConfirmed) return

    try {
      await api.delete(`/domains/${id}/`)
      await loadDomains()

      showAlert(
        'Berhasil',
        'Domain berhasil dihapus',
        'success'
      )
    } catch {
      showAlert(
        'Gagal',
        'Gagal menghapus domain',
        'error'
      )
    }
  }

  // ── Stepper ───────────────────────────────────────────────────────────────
  const steps = ['Tambah', 'Scan DNS', 'Pasang Record', 'Verifikasi', 'Policy']
  const stepIndex: Record<string, number> = { add: 0, scan: 1, records: 2, verify: 3, policy: 4 }
  const currentIdx = stepIndex[step] ?? -1

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: List domain
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'list') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
            {/* HEADER */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-800">
                    Domain Management 🌐
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    Kelola domain yang dipantau DMARC-nya
                  </p>
                </div>
              </div>
            <button
              onClick={() => { setStep('add'); setFormDomain(''); setFormEmail('') }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Tambah Domain
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : domains.length === 0 ? (
            <div className="bg-white rounded-xl shadow border p-12 text-center">
              <p className="text-5xl mb-4">🌐</p>
              <p className="font-semibold text-gray-700 text-lg">Belum ada domain terdaftar</p>
              <p className="text-gray-400 text-sm mt-2 mb-6">Tambah domain untuk mulai memantau laporan DMARC</p>
              <button
                onClick={() => setStep('add')}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium"
              >
                + Tambah Domain Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((d) => (
                <div key={d.id} className="bg-white rounded-xl shadow border p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1 ${d.is_verified ? 'bg-green-500' : 'bg-yellow-400'}`} />
                      <div>
                        <p className="font-semibold text-gray-800 text-lg">{d.domain_name}</p>
                        <p className="text-gray-400 text-sm">{d.rua_email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      d.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {d.is_verified ? '✓ Terverifikasi' : '⏳ Belum Verifikasi'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-500">📊 {d.total_reports} laporan</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500">
                      📅 {new Date(d.created_at).toLocaleDateString('id-ID')}
                    </span>
                    <div className="ml-auto flex gap-2">
                      {!d.is_verified && (
                        <button
                          onClick={async () => {
                            setSelectedDomain(d)
                            setStep('scan')
                            await handleScan(d.id)
                          }}
                          className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium"
                        >
                          Setup DNS →
                        </button>
                      )}
                      {d.is_verified && (
                        <button
                          onClick={() => { setSelectedDomain(d); setStep('policy') }}
                          className="text-sm bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded-lg font-medium"
                        >
                          Ubah Policy
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-sm bg-red-50 text-red-500 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }


  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: Stepper pages
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">

        <button
          onClick={() => { setStep('list'); setVerifyResult(null); setScanResult(null); setGenerateResult(null) }}
          className="text-blue-600 hover:underline text-sm mb-4 flex items-center gap-1"
        >
          ← Kembali ke daftar domain
        </button>

        {/* Stepper */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i < currentIdx ? 'bg-green-500 text-white' :
                  i === currentIdx ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i < currentIdx ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 text-center whitespace-nowrap ${
                  i === currentIdx ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP: Tambah Domain ── */}
        {step === 'add' && (
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Tambah Domain Baru</h2>
            <p className="text-gray-500 text-sm mb-6">Masukkan domain yang ingin dipantau DMARC-nya</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Domain</label>
                <input
                  type="text"
                  placeholder="yourdomain.com"
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
                <p className="text-gray-400 text-xs mt-1">Tanpa http:// atau www</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Penerima Laporan (RUA)</label>
                <input
                  type="email"
                  placeholder="dmarc-reports@yourdomain.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
                />
                <p className="text-gray-400 text-xs mt-1">Laporan XML akan dikirim ke email ini secara otomatis</p>
              </div>
              <button
                onClick={handleAddDomain}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition"
              >
                {submitting ? 'Menyimpan & Scanning...' : 'Simpan & Scan DNS →'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Scan DNS ── */}
        {step === 'scan' && (
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Scan DNS Domain</h2>
            <p className="text-gray-500 text-sm mb-6">
              Sistem mendeteksi kondisi DNS <strong>{selectedDomain?.domain_name}</strong> yang sudah ada
            </p>

            {submitting && (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                <span className="text-gray-500">Scanning DNS...</span>
              </div>
            )}

            {scanResult && !submitting && (
              <>
                <div className="space-y-3 mb-6">
                  {[
                    { key: 'spf', label: 'SPF Record', exists: scanResult.spf_exists },
                    { key: 'dkim', label: 'DKIM Record', exists: scanResult.dkim_exists },
                    { key: 'dmarc', label: 'DMARC Record', exists: scanResult.dmarc_exists },
                  ].map((item) => (
                    <div key={item.key} className={`flex items-center justify-between p-4 rounded-lg border ${
                      item.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.exists ? '✅' : '❌'}</span>
                        <span className="font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className={`text-sm font-medium ${item.exists ? 'text-green-600' : 'text-red-600'}`}>
                        {item.exists ? 'Sudah ada' : 'Belum ada'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={`rounded-lg p-4 mb-6 ${
                  scanResult.spf_exists && scanResult.dkim_exists && scanResult.dmarc_exists
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className="text-sm font-medium text-blue-700">{scanResult.summary}</p>
                </div>

                {/* DKIM selector input */}
                {!scanResult.dkim_exists && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DKIM Selector
                    </label>
                    <input
                      type="text"
                      value={dkimSelector}
                      onChange={(e) => setDkimSelector(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      placeholder="default"
                    />
                    <p className="text-gray-400 text-xs mt-1">
                      Nama selector DKIM — biarkan &quot;default&quot; jika tidak yakin
                    </p>
                  </div>
                )}

                {scanResult.spf_exists && scanResult.dkim_exists && scanResult.dmarc_exists ? (
                  <button
                    onClick={() => setStep('verify')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium"
                  >
                    Semua Ada, Verifikasi Sekarang →
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateRecords}
                    disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition"
                  >
                    {submitting ? 'Generating...' : 'Generate Record yang Belum Ada →'}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STEP: Pasang Records ── */}
        {step === 'records' && generateResult && (
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Pasang DNS Record</h2>
            <p className="text-gray-500 text-sm mb-6">
              Tambahkan record berikut ke panel DNS domain <strong>{generateResult.domain}</strong>
            </p>

            <div className="space-y-4 mb-6">
              {(['spf', 'dkim', 'dmarc'] as const).map((key) => {
                const rec = generateResult.records_to_add[key]
                if (!rec) return null

                if (rec.status === 'exists') {
                  return (
                    <div key={key} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        <span className="font-semibold text-green-700 uppercase">{key}</span>
                        <span className="text-green-600 text-sm">— {rec.description}</span>
                      </div>
                      {rec.value && (
                        <p className="text-xs font-mono text-gray-500 mt-2 break-all">{rec.value}</p>
                      )}
                    </div>
                  )
                }

                return (
                  <div key={key} className="border-2 border-dashed border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-blue-700 uppercase">{key} Record</span>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Perlu dipasang</span>
                    </div>

                    {rec.name && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">Type</span>
                          <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border">{rec.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-12">Name</span>
                          <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border flex-1 break-all">{rec.name}</span>
                          <button onClick={() => handleCopy(rec.name!, `${key}-name`)} className="text-xs text-blue-600 hover:underline">
                            {copied === `${key}-name` ? '✓' : 'Copy'}
                          </button>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 w-12 mt-1">Value</span>
                          <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded border flex-1 break-all">{rec.value}</span>
                          <button onClick={() => handleCopy(rec.value!, `${key}-value`)} className="text-xs text-blue-600 hover:underline mt-1">
                            {copied === `${key}-value` ? '✓' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Private key DKIM */}
                    {key === 'dkim' && generateResult.dkim_keypair.generated && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-yellow-700">🔑 Private Key (Simpan di mail server)</p>
                          <button
                            onClick={() => setShowPrivateKey(!showPrivateKey)}
                            className="text-xs text-yellow-600 hover:underline"
                          >
                            {showPrivateKey ? 'Sembunyikan' : 'Tampilkan'}
                          </button>
                        </div>
                        <p className="text-xs text-yellow-600 mb-2">
                          ⚠️ {generateResult.dkim_keypair.note}
                        </p>
                        {showPrivateKey && (
                          <>
                            <pre className="text-xs font-mono bg-white p-2 rounded border overflow-x-auto max-h-32">
                              {generateResult.dkim_keypair.private_key}
                            </pre>
                            <button
                              onClick={() => handleCopy(generateResult.dkim_keypair.private_key!, 'privkey')}
                              className="text-xs text-blue-600 hover:underline mt-2"
                            >
                              {copied === 'privkey' ? '✓ Copied' : 'Copy Private Key'}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-700 mb-2">📋 Cara Memasang:</p>
              <ol className="text-sm text-blue-600 space-y-1 list-decimal list-inside">
                <li>Login ke panel DNS domain kamu (Cloudflare, cPanel, GoDaddy, dll)</li>
                <li>Tambahkan TXT record sesuai Name dan Value di atas</li>
                <li>Tunggu propagasi DNS 1-24 jam</li>
                <li>Klik Verifikasi DNS setelah dipasang</li>
              </ol>
            </div>

            <button
              onClick={() => setStep('verify')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium"
            >
              Sudah Dipasang, Verifikasi Sekarang →
            </button>
          </div>
        )}

        {/* ── STEP: Verifikasi ── */}
        {step === 'verify' && (
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Verifikasi DNS</h2>
            <p className="text-gray-500 text-sm mb-6">
              Klik tombol untuk cek apakah semua record sudah aktif.
              Propagasi DNS bisa memakan waktu 1-24 jam.
            </p>

            {verifyResult && (
              <div className="space-y-3 mb-6">
                {(['spf', 'dkim', 'dmarc'] as const).map((key) => {
                  const check = verifyResult.checks[key]
                  return (
                    <div key={key} className={`flex items-center justify-between p-3 rounded-lg border ${
                      check.found ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <span className="font-medium text-gray-700 uppercase">{key}</span>
                      <span className={`text-sm ${check.found ? 'text-green-600' : 'text-red-500'}`}>
                        {check.status}
                      </span>
                    </div>
                  )
                })}
                <div className={`rounded-lg p-4 ${
                  verifyResult.is_verified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`text-sm font-medium ${verifyResult.is_verified ? 'text-green-700' : 'text-yellow-700'}`}>
                    {verifyResult.message}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleVerify}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition"
              >
                {submitting ? 'Mengecek DNS...' : '🔍 Cek DNS Sekarang'}
              </button>
              <button
                onClick={() => setStep('records')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-lg font-medium"
              >
                ← Kembali ke Instruksi
              </button>
            </div>
          </div>
        )}

        {/* ── STEP: Policy ── */}
        {step === 'policy' && (
          <div className="bg-white rounded-xl shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Pilih DMARC Policy</h2>
            <p className="text-gray-500 text-sm mb-6">
              Policy menentukan apa yang terjadi pada email yang gagal validasi DMARC
            </p>

            <div className="space-y-3 mb-6">
              {[
                {
                  value: 'none' as Policy,
                  label: 'None — Monitor Only',
                  desc: 'Email tetap diterima. Hanya laporan yang dikirim. Cocok untuk awal pemantauan.',
                  badge: 'bg-gray-100 text-gray-600',
                  badgeText: 'Mulai di sini',
                  border: 'border-gray-300',
                },
                {
                  value: 'quarantine' as Policy,
                  label: 'Quarantine',
                  desc: 'Email yang gagal dikirim ke folder spam. Gunakan setelah monitoring stabil.',
                  badge: 'bg-yellow-100 text-yellow-700',
                  badgeText: 'Direkomendasikan',
                  border: 'border-yellow-400',
                },
                {
                  value: 'reject' as Policy,
                  label: 'Reject',
                  desc: 'Email yang gagal langsung ditolak. Perlindungan maksimal.',
                  badge: 'bg-red-100 text-red-700',
                  badgeText: 'Perlindungan penuh',
                  border: 'border-red-400',
                },
              ].map((p) => (
                <div
                  key={p.value}
                  onClick={() => setSelectedPolicy(p.value)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition ${
                    selectedPolicy === p.value ? `${p.border} bg-blue-50` : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPolicy === p.value ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                        {selectedPolicy === p.value && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                      <span className="font-semibold text-gray-800">{p.label}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.badge}`}>{p.badgeText}</span>
                  </div>
                  <p className="text-gray-500 text-sm ml-6">{p.desc}</p>
                </div>
              ))}
            </div>

            {selectedDomain && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6 border">
                <p className="text-xs text-gray-500 mb-1">DNS Record yang akan digunakan:</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  v=DMARC1; p={selectedPolicy}; rua=mailto:{selectedDomain.rua_email}; pct=100
                </p>
              </div>
            )}

            <button
              onClick={handleSetPolicy}
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-lg font-medium transition"
            >
              {submitting ? 'Menyimpan...' : `Terapkan Policy ${selectedPolicy.toUpperCase()} ✓`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}