export default function DashboardPreview() {
  return (
    
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 mb-16">
    <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
  </div>
      
      <div className="max-w-7xl mx-auto px-6">
         
        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT */}
          <div className="lg:sticky lg:top-24 h-fit">

            <h2 className="text-5xl font-bold text-blue-900 leading-tight mb-6">
              Frequently <br /> Asked Questions
            </h2>

            <p className="text-gray-500 text-lg leading-relaxed">
              Berikut penjelasan mengenai tag DMARC yang digunakan
              untuk membantu proses autentikasi dan keamanan email domain.
            </p>

          </div>

          {/* RIGHT */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">

              {/* HEADER */}
              <div className="px-8 py-6 border-b bg-gray-50">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">
                  Penjelasan Tag DMARC
                </h3>

                <p className="text-gray-500">
                  Sistem akan menampilkan beberapa tag DMARC berikut.
                </p>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold w-40">
                        TAG
                      </th>

                      <th className="text-left px-6 py-4 font-semibold">
                        DESKRIPSI TAG
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        v
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Versi DMARC.
                        </span>{" "}
                        Tag ini menunjukkan versi DMARC yang digunakan.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        p
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Kebijakan DMARC.
                        </span>{" "}
                        Menentukan tindakan yang dilakukan jika email gagal
                        melewati autentikasi DMARC.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        rua
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Alamat laporan agregat.
                        </span>{" "}
                        Digunakan untuk menerima laporan XML DMARC.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        ruf
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Alamat laporan forensik.
                        </span>{" "}
                        Digunakan untuk menerima laporan detail kegagalan email.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        sp
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Kebijakan subdomain.
                        </span>{" "}
                        Menentukan aturan DMARC yang berlaku untuk subdomain.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        adkim
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Mode alignment DKIM.
                        </span>{" "}
                        Mengatur kecocokan domain pada autentikasi DKIM.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        aspf
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Mode alignment SPF.
                        </span>{" "}
                        Mengatur kecocokan domain pada autentikasi SPF.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        fo
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Opsi laporan kegagalan.
                        </span>{" "}
                        Menentukan kapan laporan forensik akan dikirim.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        pct
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Persentase kebijakan.
                        </span>{" "}
                        Menentukan persentase email yang dikenakan kebijakan DMARC.
                      </td>
                    </tr>

                    <tr>
                      <td className="px-6 py-5 font-medium text-gray-700">
                        ri
                      </td>

                      <td className="px-6 py-5 text-gray-600 leading-relaxed">
                        <span className="font-semibold">
                          Interval laporan.
                        </span>{" "}
                        Menentukan seberapa sering laporan DMARC dikirim.
                      </td>
                    </tr>

                  </tbody>

                </table>

              </div>
            </div>

          </div>

        </div>

        

      </div>

    </section>
  );
}