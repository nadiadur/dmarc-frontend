"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // ✅ pakai api instance, bukan hardcode URL
      await api.post("/auth/password-reset/", { email })
      setSent(true)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response: { data?: { detail?: string } } }).response
        setError(res.data?.detail ?? "Gagal mengirim email.")
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
        <h1 className="absolute top-6 left-10 text-xl font-semibold text-blue-600">
          Dmarclytics
        </h1>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Lupa Password?</h2>
          <p className="text-gray-500">Tenang, kami akan kirimkan link reset ke email Anda.</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-[55%] flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-400">
        <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl w-[400px] text-center shadow-xl">

          {sent ? (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center text-4xl">📧</div>
              <h2 className="text-2xl font-semibold text-white">Email Terkirim!</h2>
              <p className="text-blue-100 text-sm">
                Cek inbox email <span className="font-semibold text-white">{email}</span> dan klik link reset yang kami kirimkan.
              </p>
              <p className="text-blue-200 text-xs">Link berlaku 1 jam. Cek folder spam jika tidak muncul.</p>
              <button
                onClick={() => router.push("/login")}
                className="w-full mt-2 bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
              >
                Kembali ke Login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white mb-2">Reset Password</h2>
              <p className="text-blue-100 text-sm mb-6">Masukkan email akun Anda</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-blue-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && (
                  <p className="text-red-200 text-sm bg-red-500/20 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-lg transition font-medium"
                >
                  {loading ? "Mengirim..." : "Kirim Link Reset"}
                </button>
              </form>

              <button
                onClick={() => router.push("/login")}
                className="mt-4 text-sm text-blue-200 hover:text-white transition"
              >
                ← Kembali ke Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}