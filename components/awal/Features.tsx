export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50 scroll-mt-20">
      <div className="max-w-6xl mx-auto text-center px-6">
        
        <h2 className="text-4xl font-bold mb-4 text-blue-900">
          Fitur Unggulan DMARC
        </h2>

        <p className="text-gray-500 mb-14">
          Kelola keamanan email Anda dengan mudah, cepat, dan aman
        </p>

        <div className="grid md:grid-cols-3 gap-10">

          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2">
            
            <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-600 transition duration-300">
              <span className="text-blue-600 group-hover:text-white text-2xl">📤</span>
            </div>

            <h3 className="font-bold text-lg mb-3 text-blue-900">
              Upload XML
            </h3>

            <p className="text-gray-500">
              Upload laporan DMARC XML dengan mudah dan cepat untuk dianalisis.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2">
            
            <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-600 transition duration-300">
              <span className="text-blue-600 group-hover:text-white text-2xl">📊</span>
            </div>

            <h3 className="font-bold text-lg mb-3 text-blue-900">
              Visualisasi Data
            </h3>

            <p className="text-gray-500">
              Data ditampilkan dalam grafik yang mudah dipahami dan informatif.
            </p>
          </div>

          <div className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2">
            
            <div className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-600 transition duration-300">
              <span className="text-blue-600 group-hover:text-white text-2xl">🔐</span>
            </div>

            <h3 className="font-bold text-lg mb-3 text-blue-900">
              Analisis SPF & DKIM
            </h3>

            <p className="text-gray-500">
              Deteksi keamanan email dan validasi domain secara otomatis.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}