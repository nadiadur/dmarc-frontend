'use client'

import { useState } from 'react'
import Swal from 'sweetalert2'
import api from '@/lib/api'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

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

    if (score <= 2) {
      return { label: 'Lemah', color: 'bg-red-400', width: 'w-1/3' }
    }

    if (score <= 4) {
      return { label: 'Sedang', color: 'bg-yellow-400', width: 'w-2/3' }
    }

    return { label: 'Kuat', color: 'bg-green-500', width: 'w-full' }
  })()

  const handleChangePassword = async () => {
    if (!oldPassword) {
      showAlert('Peringatan', 'Password lama wajib diisi.', 'warning')
      return
    }

    if (!newPassword) {
      showAlert('Peringatan', 'Password baru wajib diisi.', 'warning')
      return
    }

    if (passwordError) {
      showAlert('Password Lemah', passwordError, 'warning')
      return
    }

    if (newPassword === oldPassword) {
      showAlert(
        'Password Tidak Valid',
        'Password baru tidak boleh sama dengan password lama.',
        'warning'
      )
      return
    }

    if (newPassword !== confirmPassword) {
      showAlert('Peringatan', 'Konfirmasi password tidak cocok.', 'warning')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      })

      showAlert('Berhasil', 'Password berhasil diubah', 'success')

      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      showAlert('Gagal', 'Gagal mengganti password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Navbar />

      <main className="ml-64 pt-24 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Ganti Password 🔒
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Update password akun kamu
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 max-w-3xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password Lama
              </label>

              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password Baru
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                  newPassword && passwordError
                    ? 'border-red-300 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-blue-300'
                }`}
              />

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
                Konfirmasi Password Baru
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                  confirmPassword && newPassword !== confirmPassword
                    ? 'border-red-300 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-blue-300'
                }`}
              />

              {confirmPassword && (
                <p
                  className={`text-xs mt-1 ${
                    newPassword === confirmPassword
                      ? 'text-green-600'
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

          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              ← Kembali
            </button>

            <button
              onClick={handleChangePassword}
              disabled={
                loading ||
                !oldPassword ||
                !newPassword ||
                !confirmPassword ||
                !!passwordError ||
                newPassword !== confirmPassword
              }
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              {loading ? 'Memproses...' : 'Update Password'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}