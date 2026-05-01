'use client'

import Cookies from 'js-cookie'

import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

export default function ProfilePage() {
  const username = Cookies.get('username') || 'User'
  const email = Cookies.get('email') || '-'
  const role = Cookies.get('role') || 'user'

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <main className="ml-64 pt-24 p-6">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Profile 👤
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Informasi akun pengguna
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-8">

          <h2 className="text-2xl font-semibold text-gray-800 mb-8">
            Profil Saya
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>

              <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
                {username}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
              </label>

              <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 capitalize">
                {role}
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>

              <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700">
                {email}
              </div>
            </div>

          </div>

          {/* BUTTON */}
            <div className="flex justify-end gap-3 mt-8">

            <Link href="/profile/edit">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Edit Profile
                </button>
            </Link>

            <Link href="/profile/ganti-sandi">
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                Ganti sandi
                </button>
            </Link>

            </div>

        </div>

      </main>
    </div>
  )
}