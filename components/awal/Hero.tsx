"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const router = useRouter();
  const [domain, setDomain] = useState("");

  const handleScan = () => {
    if (!domain) return alert("Masukkan domain dulu!");
    console.log(domain);
  };

  return (
    <section
      id="hero"
      className="h-screen flex items-center pt-20 scroll-mt-20 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/50 to-transparent"></div>

      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-10 p-6 text-white">

        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Monitor DMARC Report dengan Mudah
          </h1>

          <p className="text-gray-200">
            Analisis laporan DMARC, deteksi spoofing, dan tingkatkan keamanan email domain Anda.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg transition duration-300 shadow-md hover:scale-105 active:scale-95"
          >
            Coba Sekarang
          </button>
        </div>

        <div className="flex items-center gap-4">
  
  <input
    type="text"
    value={domain}
    onChange={(e) => setDomain(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleScan()}
    placeholder="Type your domain (e.g. example.com)"
    className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[0_0_20px_rgba(255,255,255,0.15)] focus:shadow-[0_0_25px_rgba(255,255,255,0.35)] transition duration-300"
  />

  <button
    onClick={handleScan}
    className="px-6 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md transition duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
  >
    Scan Domain
  </button>

</div>
      </div>
    </section>
  );
}