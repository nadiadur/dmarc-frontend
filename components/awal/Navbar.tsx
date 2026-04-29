"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [isLogin, setIsLogin] = useState(false);

  // ✅ cek login dari cookies
  useEffect(() => {
    const checkLogin = () => {
      const token = Cookies.get("access"); // 🔥 FIX
      setIsLogin(!!token);
    };

    checkLogin();

    // 🔥 listen perubahan login/logout
    window.addEventListener("authChange", checkLogin);

    return () => {
      window.removeEventListener("authChange", checkLogin);
    };
  }, []);

  // ✅ scroll fix
  const scrollTo = (id: string) => {
    if (pathname !== "/") {
      router.push(`/#${id}`);

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <>
      {/* TOP BAR */}
      <div className="w-full bg-blue-950 text-white text-sm">
        <div className="max-w-6xl mx-auto flex justify-end gap-6 py-2 px-4">

          {/* 🔥 SIGN IN / MASUK */}
          <span
            onClick={() =>
              router.push(isLogin ? "/user/dashboard" : "/login")
            }
            className="cursor-pointer hover:text-gray-300 transition"
          >
            {isLogin ? "Dashboard" : "Masuk"}
          </span>

          {/* CONTACT */}
          <span
            onClick={() => scrollTo("contact")}
            className="cursor-pointer hover:text-gray-300 transition"
          >
            Kontak
          </span>

        </div>
      </div>

      {/* NAVBAR */}
      <nav className="w-full sticky top-0 z-50 bg-blue-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <div className="max-w-6xl mx-auto flex items-center px-6 py-4">

          {/* LOGO */}
          <div className="flex-1">
            <h1
              onClick={() => scrollTo("hero")}
              className="font-bold text-xl cursor-pointer hover:text-gray-300 transition"
            >
              Dmarclytics
            </h1>
          </div>

          {/* MENU */}
          <ul className="flex-1 flex justify-center gap-10 font-medium items-center">

            <li
              onClick={() => scrollTo("hero")}
              className="cursor-pointer relative group"
            >
              <span className="hover:text-gray-300 transition">Beranda</span>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all group-hover:w-full"></span>
            </li>

            <li
              onClick={() => scrollTo("features")}
              className="cursor-pointer relative group"
            >
              <span className="hover:text-gray-300 transition">Fitur</span>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all group-hover:w-full"></span>
            </li>

            {/* TOOLS */}
            <li className="relative group cursor-pointer">
              <span className="hover:text-gray-300 transition flex items-center gap-1">
                Alat ▾
              </span>

              <div className="absolute left-0 mt-3 w-56 bg-white text-black rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">

                <ul className="py-2 text-sm">
                  <li
                    onClick={() => router.push("/tools/domain-checker")}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    Cek Domain 
                  </li>

                  <li
                    onClick={() => router.push("/tools/spf-checker")}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    Cek SPF 
                  </li>
                </ul>

              </div>
            </li>

          </ul>

          <div className="flex-1"></div>

        </div>
      </nav>
    </>
  );
}