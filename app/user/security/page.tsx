export default function SecurityPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      <main className="p-6">

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            Security Analysis 🛡
          </h2>
          <p className="text-gray-600">
            Analisis keamanan email dan domain DMARC kamu
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">

          <h3 className="text-lg font-semibold mb-4 text-green-600">
            ✔ System Secure
          </h3>

          <div className="space-y-2 text-gray-700">
            <p>🛡 Status: Secure</p>
            <p>✔ SPF: Valid</p>
            <p>✔ DKIM: Valid</p>
            <p>✔ DMARC: Active</p>
          </div>

        </div>

        <div className="mt-6 bg-white p-6 rounded-xl shadow border">
          <h3 className="text-lg font-semibold mb-2">
            Penjelasan
          </h3>

          <p className="text-gray-600">
            Sistem keamanan email kamu sudah berjalan dengan baik. Semua record (SPF, DKIM, DMARC) terkonfigurasi dengan benar untuk mencegah spoofing dan phishing.
          </p>
        </div>

      </main>
    </div>
  );
}