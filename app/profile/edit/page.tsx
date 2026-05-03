'use client'

import { useState } from 'react'
import Cookies from 'js-cookie'

import api from '@/lib/api'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'

export default function EditProfilePage() {

  const [name, setName] = useState(
    Cookies.get('username') || ''
  )

  const [email, setEmail] = useState(
    Cookies.get('email') || ''
  )

  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)

      await api.patch('/auth/profile/', {
        name,
        email,
      })

      // update cookies
      Cookies.set('username', name)
      Cookies.set('email', email)

      window.dispatchEvent(new Event('authChange'))

        setTimeout(() => {
        alert('✅ Profile berhasil diupdate')
        window.location.href = '/profile'
        }, 100)

        } catch (err: unknown) {

        console.log(err)

        alert(
            (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            '❌ Gagal update profile'
        )

        } finally {
        setLoading(false)
        }
            
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <Sidebar />

      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <main className="ml-64 pt-24 p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Edit Profile ✏️
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Update informasi akun kamu
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 max-w-3xl">

          <div className="space-y-5">

            {/* NAME */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

          </div>
            {/* BUTTONS */}
            <div className="flex justify-between items-center mt-8">

            <button
                onClick={() => window.history.back()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
                ← Kembali
            </button>

            <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
            >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>

            </div>
          <div className="flex justify-end mt-8">

          </div>

        </div>

      </main>
    </div>
  )
}