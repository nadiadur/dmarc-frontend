"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

/* 🔹 TYPE RESULT (sesuai backend Django kamu) */
type DomainResult = {
  domain: string;
  status: string;
  spf: string;
  dmarc: string;
};

export default function DomainCheckerPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<DomainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
    const showAlert = (
    title: string,
    text: string,
    icon: "success" | "error" | "warning" | "info" = "info"
  ) => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: "#1d4ed8",
    });
  };

  const handleCheck = async () => {
    if (!domain) {
    showAlert(
      "Peringatan",
      "Masukkan domain!",
      "warning"
    );
    return;
  }

    setLoading(true);
    setError("");
    setResult(null);

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
        throw new Error(data?.error || "Gagal scan domain");
      }

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* NAV */}
        <div className="text-sm text-gray-500 mb-8">
          <span onClick={() => router.push("/")} className="text-blue-600 cursor-pointer hover:underline">
            Home
          </span>
          <span className="mx-2">/</span>
          <span onClick={() => router.push("/tools")} className="text-blue-600 cursor-pointer hover:underline">
            Alat
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-semibold">Domain Checker</span>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-10">

          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Domain Checker
          </h1>

          <p className="text-gray-500 mb-8">
            Cek SPF & DMARC domain secara real-time
          </p>

          {/* INPUT */}
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              placeholder="example.com"
              className="flex-1 px-5 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleCheck}
              disabled={loading}
              className="bg-blue-900 text-white px-6 py-4 rounded-xl hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Check"}
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 text-red-600 rounded-lg">
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
                ? "text-green-600"
                : riskLevel === "Medium"
                ? "text-yellow-600"
                : "text-red-600";

            const riskBox =
              riskLevel === "Low"
                ? "bg-green-50 border-green-200"
                : riskLevel === "Medium"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-red-50 border-red-200";

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
              <div className="mt-8 bg-blue-950 rounded-3xl p-8 text-white">

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-blue-200 text-sm">Hasil Scan Domain</p>
                    <h2 className="text-2xl font-bold">{result.domain}</h2>
                  </div>

                  <button
                    onClick={() => {
                      setDomain("");
                      setResult(null);
                      setError("");
                    }}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/30 border border-white/20"
                  >
                    ✕
                  </button>
                </div>

                <div className={`p-5 rounded-2xl border mb-6 ${riskBox}`}>
                  <p className="text-sm text-gray-600">Risk Assessment</p>
                  <h3 className={`text-xl font-bold ${riskColor}`}>
                    {riskLevel} Risk
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {riskLevel === "Low"
                      ? "Konfigurasi SPF dan DMARC sudah terdeteksi dengan baik."
                      : riskLevel === "Medium"
                      ? "Domain masih memiliki salah satu konfigurasi SPF atau DMARC yang perlu diperiksa."
                      : "Domain belum memiliki konfigurasi SPF dan DMARC yang valid sehingga berisiko tinggi terhadap spoofing email."}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-blue-100 text-sm">Security Score</p>
                    <p className="font-bold">{score}</p>
                  </div>

                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-500 ${scoreBar}`} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
                    <p className="text-blue-100 text-sm mb-1">SPF</p>
                    <p className={`text-xl font-bold ${result.spf === "pass" ? "text-green-400" : "text-red-400"}`}>
                      {result.spf.toUpperCase()}
                    </p>
                    <p className="text-xs text-blue-200 mt-1">Sender Policy Framework</p>
                  </div>

                  <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
                    <p className="text-blue-100 text-sm mb-1">DMARC</p>
                    <p className={`text-xl font-bold ${result.dmarc === "pass" ? "text-green-400" : "text-red-400"}`}>
                      {result.dmarc.toUpperCase()}
                    </p>
                    <p className="text-xs text-blue-200 mt-1">
                      Domain-based Message Authentication
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setDomain("");
                    setResult(null);
                    setError("");
                  }}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition"
                >
                  Cek Domain Lain
                </button>
              </div>
            );
          })()}
        </div>
        {/* FAQ SECTION */}
        <div className="mt-14 bg-blue-950 rounded-3xl p-8 md:p-10 text-white">

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">
              FAQ Keamanan Email
            </h2>

            <p className="text-blue-100">
              Pertanyaan umum tentang Domain, SPF, DKIM, dan DMARC.
            </p>
          </div>

          <div className="space-y-4">

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-2">
                Apa itu Domain?
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Domain adalah alamat website atau identitas email yang digunakan di internet,
                seperti example.com. Domain digunakan untuk mengakses website serta mengirim
                dan menerima email.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-2">
                Apa itu SPF?
              </h3>
              <p className="text-blue-100 leading-relaxed">
                SPF adalah sistem keamanan email yang menentukan server mana saja yang
                diizinkan mengirim email atas nama sebuah domain. SPF membantu mencegah
                email palsu yang mengatasnamakan domain tertentu.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-2">
                Apa itu DKIM?
              </h3>
              <p className="text-blue-100 leading-relaxed">
                DKIM adalah metode autentikasi email dengan tanda tangan digital. DKIM
                membantu memastikan bahwa email benar-benar berasal dari domain yang sah
                dan isi email tidak berubah selama pengiriman.
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-lg mb-2">
                Apa itu DMARC?
              </h3>
              <p className="text-blue-100 leading-relaxed">
                DMARC adalah sistem keamanan email yang menggunakan hasil SPF dan DKIM
                untuk menentukan apakah email valid atau mencurigakan. DMARC juga dapat
                memberikan laporan kepada pemilik domain.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
