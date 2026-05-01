'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'

interface User {
  user_id: string
  name: string
  email: string
  role: string
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()

  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchUser = async () => {
      setFetchError(null)
      try {
        const res = await api.get<User>(`/auth/users/${id}/`)
        setName(res.data.name)
        setEmail(res.data.email)
      } catch (err: unknown) {
        console.error('Fetch user error:', err)
        if (err && typeof err === 'object' && 'response' in err) {
          const res = (err as { response: { data?: { detail?: string }; status: number } }).response
          if (res.status === 403) setFetchError('Anda tidak memiliki akses untuk melihat user ini.')
          else if (res.status === 404) setFetchError('User tidak ditemukan.')
          else setFetchError(res.data?.detail ?? 'Gagal memuat user.')
        } else {
          setFetchError('Tidak dapat terhubung ke server.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const handleUpdate = async () => {
    if (!id) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      // ✅ Hanya kirim name & email, tanpa role
      await api.patch(`/auth/users/${id}/`, { name, email })
      setSaveSuccess(true)
      setTimeout(() => router.push('/admin/users'), 1000)
    } catch (err: unknown) {
      console.error('Update user error:', err)
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response: { data?: { detail?: string }; status: number } }).response
        if (res.status === 403) setSaveError('Anda tidak memiliki akses untuk mengedit user ini.')
        else setSaveError(res.data?.detail ?? 'Gagal menyimpan perubahan.')
      } else {
        setSaveError('Tidak dapat terhubung ke server.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 max-w-md text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Gagal Memuat User</h2>
          <p className="text-sm text-red-500 mb-6">{fetchError}</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            ← Kembali ke Daftar User
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit User ✏️</h1>
        <p className="text-sm text-gray-500 mt-1">Update data user sistem</p>
      </div>

      <div className="bg-white rounded-2xl shadow border border-gray-200 p-8 max-w-3xl">
        <div className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

        </div>

        {saveError && (
          <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            ❌ {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="mt-5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            ✅ User berhasil diupdate! Mengalihkan...
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
            onClick={handleUpdate}
            disabled={saving || saveSuccess}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}