"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ApiResponse = {
  domain: string;
  spf: "pass" | "fail";
  dmarc: "pass" | "fail";
  status: "pass" | "fail";
};

type SpfResult = {
  domain: string;
  record: string;
  status: string;
};

export default function SpfCheckerPage() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<SpfResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleCheck = async () => {
    if (!domain) return alert("Masukkan domain!");

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

      const data: ApiResponse = await res.json();

      if (!res.ok) {
        throw new Error(
          "error" in data && typeof data.error === "string"
            ? data.error
            : "Request gagal"
        );      
      }

      const spfResult: SpfResult = {
        domain: data.domain,
        record:
          data.spf === "pass"
            ? "SPF record found"
            : "No SPF record found",
        status: data.spf,
      };

      setResult(spfResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
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
          <span className="text-gray-700 font-semibold">SPF Checker</span>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-2xl shadow-xl p-10">

          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            SPF Checker
          </h1>

          <p className="text-gray-500 mb-8">
            Cek SPF record domain secara real-time
          </p>

          {/* INPUT */}
          <div className="flex gap-4 mb-6">
            <input
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
            <div className="bg-gray-50 p-6 rounded-xl border space-y-3">
              <p><b>Domain:</b> {result.domain}</p>
              <p className={result.status === "pass" ? "text-green-600" : "text-red-600"}>
                <b>Status:</b> {result.status}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
