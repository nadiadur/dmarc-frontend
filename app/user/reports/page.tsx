export default function ReportsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">

      <main className="p-6">

        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            DMARC Reports 📊
          </h2>
          <p className="text-gray-600">
            Ringkasan laporan keamanan email dan domain kamu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition">
            <h2 className="text-gray-600">Total Reports</h2>
            <p className="text-3xl font-bold mt-2 text-blue-600">4</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition">
            <h2 className="text-gray-600">Status</h2>
            <p className="text-2xl font-bold mt-2 text-green-600">
              Aman
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition">
            <h2 className="text-gray-600">Last Update</h2>
            <p className="text-xl font-semibold mt-2">
              Hari ini
            </p>
          </div>

        </div>

        <div className="mt-8 bg-white p-6 rounded-xl shadow border">
          <h3 className="text-xl font-semibold mb-3">
            Detail Laporan
          </h3>

          <p className="text-gray-600">
            Di sini nanti kamu bisa menampilkan data report DMARC dari backend Django seperti list email, status SPF, DKIM, dan DMARC policy.
          </p>
        </div>

      </main>
    </div>
  );
}