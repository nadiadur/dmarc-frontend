"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) setError("Link reset tidak valid. Silakan minta reset ulang.")
  }, [token])

  const strength = (() => {
    if (!newPassword) return null
    if (newPassword.length < 6) return { label: 'Lemah', color: 'bg-red-400', width: 'w-1/3' }
    if (newPassword.length < 10) return { label: 'Sedang', color: 'bg-yellow-400', width: 'w-2/3' }
    return { label: 'Kuat', color: 'bg-green-500', width: 'w-full' }
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) { setError("Password minimal 8 karakter."); return }
    if (newPassword !== confirmPassword) { setError("Konfirmasi password tidak cocok."); return }

    setLoading(true)
    try {
      // ✅ pakai api instance, bukan hardcode URL
      await api.post("/auth/password-reset-confirm/", {
        token,
        new_password: newPassword,
      })
      setSuccess(true)
      setTimeout(() => router.push("/login"), 2500)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response: { data?: { detail?: string } } }).response
        setError(res.data?.detail ?? "Gagal mereset password.")
      } else {
        setError("Tidak dapat terhubung ke server.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* LEFT */}
      <div className="w-[45%] bg-white flex flex-col justify-center px-16 relative">
        <h1 className="absolute top-6 left-10 text-xl font-semibold text-blue-600">Dmarclytics</h1>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Buat Password Baru</h2>
          <p className="text-gray-500">Pastikan password baru Anda kuat dan mudah diingat.</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-[55%] flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-400">
        <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl w-[400px] text-center shadow-xl">

          {success ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center text-4xl">✅</div>
              <h2 className="text-2xl font-semibold text-white">Password Berhasil Direset!</h2>
              <p className="text-blue-100 text-sm">Anda akan diarahkan ke halaman login...</p>
              <div className="w-8 h-8 mx-auto border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white mb-2">Password Baru</h2>
              <p className="text-blue-100 text-sm mb-6">Masukkan password baru Anda</p>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">

                <div>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      placeholder="Password baru"
                      className="w-full px-4 py-3 pr-12 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-blue-300"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showNew ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                      </div>
                      <p className="text-xs text-blue-200 mt-1">{strength.label}</p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Konfirmasi password"
                      className="w-full px-4 py-3 pr-12 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-blue-300"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-xs mt-1 ${newPassword === confirmPassword ? 'text-green-300' : 'text-red-300'}`}>
                      {newPassword === confirmPassword ? '✅ Password cocok' : '❌ Password tidak cocok'}
                    </p>
                  )}
                </div>

                {error && (
                  <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg transition font-medium"
                >
                  {loading ? "Menyimpan..." : "Simpan Password Baru"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}