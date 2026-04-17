"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* 🔹 TYPE RESULT */
type DomainResult = {
  domain: string;
  status: string;
  ip: string;
  spf: string;
  dmarc: string;
};

export default function DomainCheckerPage() {
  const [domain, setDomain] = useState<string>("");
  const [result, setResult] = useState<DomainResult | null>(null);
  const router = useRouter();

  const handleCheck = () => {
    if (!domain) {
      alert("Masukkan domain!");
      return;
    }

    const fakeResult: DomainResult = {
      domain,
      status: "Valid",
      ip: "192.168.1.1",
      spf: "Available",
      dmarc: "Configured",
    };

    setResult(fakeResult);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-16 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-sm md:text-base text-gray-500 mb-8">
          <span
            onClick={() => router.push("/")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Home
          </span>

          <span className="mx-2">/</span>

          <span
            onClick={() => router.push("/tools")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Tools
          </span>

          <span className="mx-2">/</span>

          <span className="text-gray-700 font-semibold">
            Domain Checker
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 md:p-12">

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
            Domain Checker
          </h1>

          <p className="text-gray-500 text-lg mb-8">
            Periksa informasi domain dan konfigurasi email security Anda
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
              placeholder="example.com"
              className="flex-1 px-6 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleCheck}
              className="bg-blue-900 text-white px-8 py-4 text-lg rounded-xl hover:bg-blue-800 transition shadow-md"
            >
              Check
            </button>
          </div>

          {result && (
            <div className="space-y-6">

              <h2 className="text-2xl font-semibold text-blue-900">
                Hasil Analisis
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <div className="p-5 border rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">Domain</p>
                  <p className="font-semibold text-lg">{result.domain}</p>
                </div>

                <div className="p-5 border rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="font-semibold text-lg text-green-600">
                    {result.status}
                  </p>
                </div>

                <div className="p-5 border rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">IP Address</p>
                  <p className="font-semibold text-lg">{result.ip}</p>
                </div>

                <div className="p-5 border rounded-xl bg-gray-50">
                  <p className="text-gray-500 text-sm">SPF</p>
                  <p className="font-semibold text-lg">{result.spf}</p>
                </div>

                <div className="p-5 border rounded-xl bg-gray-50 md:col-span-2">
                  <p className="text-gray-500 text-sm">DMARC</p>
                  <p className="font-semibold text-lg">{result.dmarc}</p>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}