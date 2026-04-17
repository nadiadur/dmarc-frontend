export default function IssuesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">


      <main className="p-6">

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            System Issues ⚠
          </h2>
          <p className="text-gray-600">
            Masalah yang terdeteksi pada sistem DMARC kamu
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border">

          <h3 className="text-lg font-semibold mb-4 text-red-600">
            ⚠ Issue Detected
          </h3>

          <div className="space-y-2 text-gray-700">
            <p>• Total Issue: 1</p>
            <p>• SPF record belum optimal</p>
            <p>• Status: Perlu perbaikan</p>
          </div>

        </div>

        <div className="mt-6 bg-white p-6 rounded-xl shadow border">
          <h3 className="text-lg font-semibold mb-2">
            Rekomendasi
          </h3>

          <p className="text-gray-600">
            Perbaiki konfigurasi SPF untuk meningkatkan keamanan email dan mengurangi risiko spoofing.
          </p>
        </div>

      </main>
    </div>
  );
}