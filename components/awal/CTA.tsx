"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function CTA() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(false);

  // ✅ cek login
  useEffect(() => {
    const checkLogin = () => {
      const token = Cookies.get("access");
      setIsLogin(!!token);
    };

    checkLogin();

    // 🔥 biar auto update setelah login/logout
    window.addEventListener("authChange", checkLogin);

    return () => {
      window.removeEventListener("authChange", checkLogin);
    };
  }, []);

  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">

        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Amankan Email Domain Anda
        </h2>

        <p className="text-gray-300 mb-6 text-sm md:text-base">
          Mulai analisis DMARC dan tingkatkan keamanan email Anda dengan mudah.
        </p>

        <div className="flex justify-center gap-3">

          {/* ✅ BUTTON FIX */}
          <button
            onClick={() =>
              router.push(isLogin ? "/user/dashboard" : "/login")
            }
            className="bg-white text-blue-900 px-5 py-2.5 rounded-md font-medium hover:bg-gray-200 transition"
          >
            {isLogin ? "Ke Dashboard" : "Mulai Sekarang"}
          </button>

          <button
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="border border-white px-5 py-2.5 rounded-md font-medium hover:bg-white hover:text-blue-900 transition"
          >
            Lihat Fitur
          </button>

        </div>

      </div>
    </section>
  );
}