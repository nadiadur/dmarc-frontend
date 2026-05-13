"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

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
            Alat
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
          <div className="mt-10 space-y-6">

            {/* TITLE */}
            <h2 className="text-3xl text-center text-blue-900 leading-relaxed">
              Hasil pengecekan SPF untuk domain{" "}
              <span className="font-bold">
                {result.domain}
              </span>
            </h2>

            {/* CARD */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* STATUS */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm">

                <p className="text-gray-500 mb-3">
                  Status SPF
                </p>

                <h3
                  className={`text-3xl font-bold ${
                    result.status === "pass"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {result.status === "pass"
                    ? "Valid"
                    : "Tidak Valid"}
                </h3>

              </div>

              {/* SPF RECORD */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm">

                <p className="text-gray-500 mb-3">
                  SPF Record
                </p>

                <h3 className="text-lg font-bold text-blue-700 break-all">
                  {result.record}
                </h3>

              </div>

            </div>

            {/* INFO */}
            <div
              className={`rounded-2xl border p-5 ${
                result.status === "pass"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >

              <p className="leading-relaxed">

                {result.status === "pass"
                  ? `SPF record berhasil ditemukan pada domain ${result.domain}. SPF membantu memvalidasi server pengirim email sehingga dapat mengurangi risiko spoofing atau pemalsuan email.`
                  : `SPF record tidak ditemukan pada domain ${result.domain}. Domain belum memiliki perlindungan SPF sehingga email lebih rentan terhadap spoofing.`}

              </p>

            </div>

          </div>
        )}
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
