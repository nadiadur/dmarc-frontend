"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const handleCheck = async () => {
    if (!domain) {
      alert("Masukkan domain!");
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
            Tools
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
          {result && (
            <div className="space-y-4">

              <h2 className="text-xl font-semibold text-blue-900">
                Hasil Scan
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <div className="p-4 border rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">Domain</p>
                  <p className="font-semibold">{result.domain}</p>
                </div>

                <div className="p-4 border rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="font-semibold text-green-600">
                    {result.status}
                  </p>
                </div>

                <div className="p-4 border rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">SPF</p>
                  <p className="font-semibold">{result.spf}</p>
                </div>

                <div className="p-4 border rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">DMARC</p>
                  <p className="font-semibold">{result.dmarc}</p>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
