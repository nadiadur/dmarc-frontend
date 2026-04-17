"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DkimResult = {
  domain: string;
  selector: string;
  status: string;
};

export default function DkimCheckerPage() {
  const [domain, setDomain] = useState("");
  const [selector, setSelector] = useState("");
  const [result, setResult] = useState<DkimResult | null>(null);
  const router = useRouter();

  const handleCheck = () => {
    if (!domain || !selector) return alert("Lengkapi semua field!");

    const fakeResult: DkimResult = {
      domain,
      selector,
      status: "Valid",
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
            DKIM Checker
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-10 md:p-12">

          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">
            DKIM Checker
          </h1>

          <p className="text-gray-500 text-lg mb-8">
            Periksa konfigurasi DKIM domain dan selector Anda
          </p>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Domain (example.com)"
              className="flex-1 px-6 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <input
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              placeholder="Selector (default)"
              className="flex-1 px-6 py-4 text-lg rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />

            <button
              onClick={handleCheck}
              className="bg-blue-900 text-white px-8 py-4 text-lg rounded-xl hover:bg-blue-800 transition shadow-md"
            >
              Check
            </button>
          </div>

          {result && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-3 text-lg">
              <p><b>Domain:</b> {result.domain}</p>
              <p><b>Selector:</b> {result.selector}</p>
              <p className="text-green-600">
                <b>Status:</b> {result.status}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}