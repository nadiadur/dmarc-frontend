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
    <footer className="bg-[#071a3d] text-white pt-20 pb-10 relative">

      <div className="text-center mb-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Make Your DMARC Journey Simple With EasyDMARC
        </h2>

        <div className="flex justify-center gap-4 flex-wrap">
          <button className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-900 transition duration-300">
            Contact Us
          </button>

          <button className="bg-white text-blue-900 px-6 py-3 rounded-lg hover:bg-gray-200 transition duration-300">
            Start Free Trial
          </button>
        </div>
      </div>

      <div className="w-full h-[1px] bg-blue-800 mb-12"></div>

      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-5 gap-10 text-sm">

        <div>
          <h1 className="text-lg font-bold mb-4">DMARC</h1>
          <p className="text-gray-400">
            Platform untuk analisis dan monitoring DMARC secara mudah dan aman.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Tools</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">DMARC Checker</li>
            <li className="hover:text-white cursor-pointer">SPF Checker</li>
            <li className="hover:text-white cursor-pointer">DKIM Checker</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Platform</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">XML Analyzer</li>
            <li className="hover:text-white cursor-pointer">GeoMaps</li>
            <li className="hover:text-white cursor-pointer">Monitoring</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Solutions</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">Enterprise</li>
            <li className="hover:text-white cursor-pointer">Startup</li>
            <li className="hover:text-white cursor-pointer">Marketing</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Company</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="hover:text-white cursor-pointer">About</li>
            <li className="hover:text-white cursor-pointer">Careers</li>
          </ul>
        </div>

      </div>

      <div className="text-center text-gray-400 mt-12 text-sm">
        © 2026 DMARC Report. All rights reserved.
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2
        ${showTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        ↑ Back to Top
      </button>

    </footer>
  );
}