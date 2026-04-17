import Image from "next/image";

export default function HowItWorks() {
  return (
    <section id="about" className="py-24 bg-gray-50 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">
            Cara Kerja Sistem
          </h2>
          <p className="text-gray-500">
            Proses sederhana untuk menganalisis laporan DMARC Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          <div className="hidden md:block">
            <div className="sticky top-24">
              <Image
                src="/bg.jpg"
                alt="dashboard"
                width={600}
                height={400}
                className="rounded-xl shadow-xl hover:scale-105 transition duration-300"
              />
            </div>
          </div>

          <div className="space-y-10">

            {[
              {
                title: "Upload XML",
                desc: "Masukkan file laporan DMARC XML ke dalam sistem.",
              },
              {
                title: "Diproses",
                desc: "Sistem akan membaca dan memproses data secara otomatis.",
              },
              {
                title: "Ditampilkan",
                desc: "Hasil ditampilkan dalam bentuk visualisasi data.",
              },
              {
                title: "Analisis",
                desc: "Dapatkan insight dan deteksi potensi masalah keamanan.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 hover:-translate-y-1"
              >
                <h3 className="font-semibold text-blue-900 mb-2 text-lg">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm">
                  {item.desc}
                </p>
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}