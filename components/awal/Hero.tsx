"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

/* =========================
   TYPES
========================= */
type ScanResult = {
  domain: string;
  spf: "pass" | "fail";
  dmarc: "pass" | "fail";
  status: "pass" | "fail";
};

export default function Hero() {
  const router = useRouter();

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");

  const [isLogin, setIsLogin] = useState(false);

  // ✅ cek login dari cookie
  useEffect(() => {
    const token = Cookies.get("access");
    setIsLogin(!!token);

    // listen perubahan login/logout
    const handleAuthChange = () => {
      const token = Cookies.get("access");
      setIsLogin(!!token);
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const handleScan = async () => {
    if (!domain) return alert("Masukkan domain dulu!");

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scan-domain/`,
       {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ domain }),
       }
     );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Request gagal");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal scan domain");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="hero"
      className="h-screen flex items-center pt-20 scroll-mt-20 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-10 p-6 text-white">

        {/* LEFT */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Monitor DMARC Report dengan Mudah
          </h1>

          <p className="text-gray-200">
            Analisis laporan DMARC, deteksi spoofing, dan tingkatkan keamanan email domain Anda.
          </p>

          {/* ✅ BUTTON FIX */}
          <button
            onClick={() =>
              router.push(isLogin ? "/user/dashboard" : "/login")
            }
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition"
          >
            {isLogin ? "Ke Dashboard" : "Coba Sekarang"}
          </button>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {/* INPUT */}
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder="example.com"
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white"
            />

            <button
              onClick={handleScan}
              disabled={loading}
              className="px-6 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {loading ? "Scanning..." : "Scan"}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* RESULT */}
          {result && (
            <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md space-y-4">

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{result.domain}</h2>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    result.status === "pass"
                      ? "bg-green-500/20 text-green-300 border border-green-500"
                      : "bg-red-500/20 text-red-300 border border-red-500"
                  }`}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/20 border border-white/10">
                  <p className="text-sm text-gray-300">SPF</p>
                  <p className={`font-bold ${
                    result.spf === "pass" ? "text-green-400" : "text-red-400"
                  }`}>
                    {result.spf.toUpperCase()}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/20 border border-white/10">
                  <p className="text-sm text-gray-300">DMARC</p>
                  <p className={`font-bold ${
                    result.dmarc === "pass" ? "text-green-400" : "text-red-400"
                  }`}>
                    {result.dmarc.toUpperCase()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-2">Security Score</p>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      result.status === "pass"
                        ? "bg-green-500 w-full"
                        : "bg-red-500 w-1/2"
                    }`}
                  />
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </section>
  );
}
