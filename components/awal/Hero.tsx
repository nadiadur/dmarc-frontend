"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Swal from "sweetalert2";


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
      const showAlert = (
      title: string,
      text: string,
      icon: "success" | "error" | "warning" | "info" = "info"
    ) => {
      Swal.fire({
        title,
        text,
        icon,
        confirmButtonColor: "#2563eb",
      });
    };

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
   if (!domain) {
      showAlert(
        "Peringatan",
        "Masukkan domain dulu!",
        "warning"
      );
      return;
    }

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
          {result && (() => {

            const riskLevel =
              result.spf === "fail" && result.dmarc === "fail"
                ? "High"
                : result.spf === "fail" || result.dmarc === "fail"
                ? "Medium"
                : "Low";

            const riskColor =
              riskLevel === "Low"
                ? "text-green-400"
                : riskLevel === "Medium"
                ? "text-yellow-400"
                : "text-red-400";

            const riskBox =
              riskLevel === "Low"
                ? "bg-green-500/10 border-green-400/50"
                : riskLevel === "Medium"
                ? "bg-yellow-500/10 border-yellow-400/50"
                : "bg-red-500/10 border-red-400/50";

            const score =
              riskLevel === "Low"
                ? "100%"
                : riskLevel === "Medium"
                ? "50%"
                : "0%";

            const scoreBar =
              riskLevel === "Low"
                ? "bg-green-500 w-full"
                : riskLevel === "Medium"
                ? "bg-yellow-500 w-1/2"
                : "bg-red-500 w-[10%]";

            return (

              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-md space-y-5 shadow-xl">

                {/* HEADER */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-gray-300">
                      Hasil Scan Domain
                    </p>

                    <h2 className="text-xl font-bold">
                      {result.domain}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setDomain("");
                      setResult(null);
                      setError("");
                    }}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/30 border border-white/20 flex items-center justify-center text-white transition"
                  >
                    ✕
                  </button>

                </div>

                {/* RISK */}
                <div className={`p-4 rounded-xl border ${riskBox}`}>

                  <p className="text-sm text-gray-300">
                    Risk Assessment
                  </p>

                  <h3 className={`text-lg font-bold ${riskColor}`}>
                    {riskLevel} Risk
                  </h3>

                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">
                    {riskLevel === "Low"
                      ? "Konfigurasi SPF dan DMARC sudah terdeteksi dengan baik."
                      : riskLevel === "Medium"
                      ? "Domain masih memiliki salah satu konfigurasi SPF atau DMARC yang perlu diperiksa."
                      : "Domain belum memiliki konfigurasi SPF dan DMARC yang valid sehingga berisiko tinggi terhadap spoofing email."}
                  </p>

                </div>

                {/* SCORE */}
                <div>

                  <div className="flex items-center justify-between mb-2">

                    <p className="text-sm text-gray-300">
                      Security Score
                    </p>

                    <p className={`font-bold ${riskColor}`}>
                      {score}
                    </p>

                  </div>

                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">

                    <div
                      className={`h-full transition-all duration-500 ${scoreBar}`}
                    />

                  </div>

                </div>

                {/* RESULT GRID */}
                <div className="grid grid-cols-2 gap-4">

                  {/* SPF */}
                  <div className="p-4 rounded-xl bg-black/20 border border-white/10">

                    <div className="flex items-center justify-between mb-2">

                      <p className="text-sm text-gray-300">
                        SPF
                      </p>

                      <div
                        className={`w-3 h-3 rounded-full ${
                          result.spf === "pass"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      />

                    </div>

                    <p
                      className={`font-bold text-lg ${
                        result.spf === "pass"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {result.spf.toUpperCase()}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Sender Policy Framework
                    </p>

                  </div>

                  {/* DMARC */}
                  <div className="p-4 rounded-xl bg-black/20 border border-white/10">

                    <div className="flex items-center justify-between mb-2">

                      <p className="text-sm text-gray-300">
                        DMARC
                      </p>

                      <div
                        className={`w-3 h-3 rounded-full ${
                          result.dmarc === "pass"
                            ? "bg-green-400"
                            : "bg-red-400"
                        }`}
                      />

                    </div>

                    <p
                      className={`font-bold text-lg ${
                        result.dmarc === "pass"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {result.dmarc.toUpperCase()}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      Domain-based Message Authentication
                    </p>

                  </div>

                </div>

              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
}
