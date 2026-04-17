"use client";

import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const scrollTo = (id: string) => {
    if (pathname !== "/") {
      router.push(`/#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <div className="w-full bg-blue-950 text-white text-sm">
        <div className="max-w-6xl mx-auto flex justify-end gap-6 py-2 px-4">
          <span
            onClick={() => router.push("/login")}
            className="cursor-pointer hover:text-gray-300 transition duration-300"
          >
            Sign In
          </span>
          <span className="cursor-pointer hover:text-gray-300 transition duration-300">
            Get Support
          </span>
        </div>
      </div>

      <nav className="w-full sticky top-0 z-50 bg-blue-900 text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
          
          <h1
            onClick={() => scrollTo("hero")}
            className="font-bold text-xl cursor-pointer hover:text-gray-300 transition duration-300"
          >
            Dmarclytics
          </h1>

          <ul className="hidden md:flex gap-8 font-medium items-center">

            <li
              onClick={() => scrollTo("hero")}
              className="cursor-pointer relative group"
            >
              <span className="hover:text-gray-300 transition duration-300">
                Home
              </span>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </li>

            <li
              onClick={() => scrollTo("features")}
              className="cursor-pointer relative group"
            >
              <span className="hover:text-gray-300 transition duration-300">
                Features
              </span>
              <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
            </li>

            <li className="relative group cursor-pointer">
              <span className="hover:text-gray-300 transition duration-300 flex items-center gap-1">
                Tools ▾
              </span>

              <div className="absolute left-0 mt-3 w-56 bg-white text-black rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">

                <ul className="py-2 text-sm">

                  <li
                    onClick={() => router.push("/tools/domain-checker")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Domain Checker
                  </li>

                  <li
                    onClick={() => router.push("/tools/dmarc-checker")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    DMARC Checker
                  </li>

                  <li
                    onClick={() => router.push("/tools/spf-checker")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    SPF Checker
                  </li>

                  <li
                    onClick={() => router.push("/tools/dkim-checker")}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    DKIM Checker
                  </li>

                </ul>
              </div>
            </li>

          </ul>

          <button
            onClick={() => router.push("/login")}
            className="bg-white text-blue-900 px-5 py-2 rounded-lg hover:bg-gray-200 transition duration-300 shadow-sm"
          >
            Login
          </button>

        </div>
      </nav>
    </>
  );
}