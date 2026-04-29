"use client";
import { useEffect, useState } from "react";

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#071a3d] text-white pt-14 pb-8 relative">

      {/* KONTAK */}
      <div className="text-center mb-10 px-6">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">
          Butuh Bantuan dengan DMARC?
        </h2>

        <div id="contact" className="flex justify-center items-center gap-6 flex-wrap text-gray-400">
          <p className="hover:text-white transition">
            support@dmarclytics.com
          </p>
          <span className="hidden md:inline text-gray-600">|</span>
          <p className="hover:text-white transition">
            +62 812-3456-7890
          </p>
        </div>
      </div>

      <div className="w-full h-[1px] bg-blue-800 mb-10"></div>

      {/* GRID FOOTER */}
     <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">

      {/* BRAND */}
      <div className="flex flex-col h-full">
        <h1 className="text-lg font-bold mb-3">Dmarclytics</h1>
        <p className="text-gray-400 leading-relaxed">
          Platform untuk analisis dan pemantauan DMARC secara mudah, aman, dan efisien.
        </p>
      </div>

      {/* ALAT */}
      <div className="flex flex-col h-full">
        <h3 className="font-semibold mb-3">Alat</h3>
        <ul className="space-y-2 text-gray-400">
          <li className="hover:text-white transition cursor-pointer">
            Pemeriksa Domain
          </li>
          <li className="hover:text-white transition cursor-pointer">
            Pemeriksa SPF
          </li>
        </ul>
      </div>

      {/* PLATFORM */}
      <div className="flex flex-col h-full">
        <h3 className="font-semibold mb-3">Platform</h3>
        <ul className="space-y-2 text-gray-400">
          <li className="hover:text-white transition cursor-pointer">
            XML Analyzer 
          </li>
          <li className="hover:text-white transition cursor-pointer">
            Monitoring
          </li>
        </ul>
      </div>

    </div>

      {/* COPYRIGHT */}
      <div className="text-center text-gray-500 mt-10 text-sm">
        © 2026 Dmarclytics. All rights reserved.
      </div>

      {/* BACK TO TOP */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300
        ${showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        ↑
      </button>

    </footer>
  );
}