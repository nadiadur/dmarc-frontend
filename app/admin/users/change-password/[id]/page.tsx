'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

export default function ChangePasswordPage() {
  const params = useParams()
  const router = useRouter()

  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validatePassword = (password: string) => {
    if (password.length < 8) return 'Password minimal 8 karakter.'
    if (!/[A-Z]/.test(password)) return 'Password harus memiliki huruf kapital.'
    if (!/[a-z]/.test(password)) return 'Password harus memiliki huruf kecil.'
    if (!/[0-9]/.test(password)) return 'Password harus memiliki angka.'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password harus memiliki simbol.'
    return ''
  }

  const passwordError = validatePassword(newPassword)

  const strength = (() => {
    if (!newPassword) return null

    let score = 0
    if (newPassword.length >= 8) score++
    if (newPassword.length >= 12) score++
    if (/[A-Z]/.test(newPassword)) score++
    if (/[a-z]/.test(newPassword)) score++
    if (/[0-9]/.test(newPassword)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++

    if (score <= 2) return { label: 'Lemah', color: 'bg-red-400', width: 'w-1/3' }
    if (score <= 4) return { label: 'Sedang', color: 'bg-yellow-400', width: 'w-2/3' }
    return { label: 'Kuat', color: 'bg-green-500', width: 'w-full' }
  })()

  const handleSubmit = async () => {
    setError(null)

    if (!id) {
      setError('User ID tidak ditemukan.')
      return
    }

    if (!newPassword) {
      setError('Password baru tidak boleh kosong.')
      return
    }

    if (passwordError) {
      setError(passwordError)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setSaving(true)

    try {
      await api.patch(`/auth/users/${id}/`, {
        password: newPassword,
      })

      setSuccess(true)

      setTimeout(() => {
        router.push('/admin/users')
      }, 1200)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = err as {
          response?: {
            data?: {
              detail?: string
              password?: string[]
            }
            status?: number
          }
        }

        if (res.response?.status === 403) {
          setError('Anda tidak memiliki akses.')
        } else {
          setError(
            res.response?.data?.detail ||
              res.response?.data?.password?.[0] ||
              'Gagal mengubah password.'
          )
        }
      } else {
        setError('Tidak dapat terhubung ke server.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Ubah Sandi 🔑</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set password baru untuk user ini
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 max-w-xl">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password Baru
            </label>

            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Minimal 8 karakter"
                className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 ${
                  passwordError && newPassword
                    ? 'border-red-300 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-indigo-300'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNew ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.02-2.27 2.7-4.19 4.88-5.52M6.53 6.53A9.956 9.956 0 0112 5c5 0 9.27 3.11 11 7a11.82 11.82 0 01-4.2 5.4M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {strength && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Password: {strength.label}
                </p>
              </div>
            )}

            {newPassword && (
              <div className="text-xs mt-2 space-y-1">
                <p className={newPassword.length >= 8 ? 'text-green-600' : 'text-red-500'}>
                  • Minimal 8 karakter
                </p>
                <p className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-red-500'}>
                  • Memiliki huruf kapital
                </p>
                <p className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-red-500'}>
                  • Memiliki huruf kecil
                </p>
                <p className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-red-500'}>
                  • Memiliki angka
                </p>
                <p className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : 'text-red-500'}>
                  • Memiliki simbol
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Konfirmasi Password
            </label>

            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError(null)
                }}
                placeholder="Ulangi password baru"
                className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-300 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-indigo-300'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.02-2.27 2.7-4.19 4.88-5.52M6.53 6.53A9.956 9.956 0 0112 5c5 0 9.27 3.11 11 7a11.82 11.82 0 01-4.2 5.4M3 3l18 18" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {confirmPassword && (
              <p
                className={`text-xs mt-1 ${
                  newPassword === confirmPassword
                    ? 'text-green-500'
                    : 'text-red-500'
                }`}
              >
                {newPassword === confirmPassword
                  ? '✅ Password cocok'
                  : '❌ Password tidak cocok'}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="mt-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            ✅ Password berhasil diubah! Mengalihkan...
          </div>
        )}

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            ← Kembali
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              saving ||
              success ||
              !!passwordError ||
              newPassword !== confirmPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            {saving ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </div>
      </div>
    </div>
  )
}