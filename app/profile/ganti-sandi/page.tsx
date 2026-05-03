'use client'

import { useState } from 'react'

import api from '@/lib/api'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleChangePassword = async () => {
  try {
    await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    })

    alert('Password berhasil diubah')

    setOldPassword('')
    setNewPassword('')
  } catch {
    alert('Gagal mengganti password')
  }
}

  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />
      <Navbar />

      <main className="ml-64 pt-24 p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Ganti Password 🔒
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Update password akun kamu
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 max-w-3xl">

          <div className="space-y-5">

            {/* Password Lama */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password Lama
              </label>

              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Password Baru */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password Baru
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

          </div>

          {/* BUTTON */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              ← Kembali
            </button>
            <button
              onClick={handleChangePassword}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
              Update Password
            </button>
          </div>

        </div>

      </main>
    </div>
  )
}