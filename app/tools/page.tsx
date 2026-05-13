"use client";

import { useRouter } from "next/navigation";

export default function ToolsPage() {
  const router = useRouter();

  const tools = [
      {
        title: "Domain Checker",
        path: "/tools/domain-checker",
        description:
          "Tool untuk memeriksa status keamanan domain seperti SPF dan DMARC secara real-time.",
      },

      {
        title: "SPF Checker",
        path: "/tools/spf-checker",
        description:
          "Tool untuk mengecek konfigurasi SPF pada domain guna membantu mencegah email spoofing.",
      },
    ];

  return (
    <div className="bg-gray-100 py-16 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto text-center">

        <h1 className="text-4xl font-bold text-blue-900 mb-10">
          Alat DMARC
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool, i) => (
            <div
              key={i}
              onClick={() => router.push(tool.path)}
              className="cursor-pointer bg-white p-7 rounded-2xl shadow hover:shadow-xl transition border border-gray-100 hover:border-blue-200"
            >

              <h2 className="text-2xl font-semibold text-blue-900 mb-3">
                {tool.title}
              </h2>

              <p className="text-gray-500 leading-relaxed">
                {tool.description}
              </p>

            </div>
          ))}
        </div>

      </div>
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
  );
}