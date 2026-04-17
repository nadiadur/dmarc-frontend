"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavbarAdmin() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  

  function handleLogout() {
    Cookies.remove("access");
    Cookies.remove("refresh");
    Cookies.remove("role");
    Cookies.remove("user_id");
    router.push("/login");
  }

  return (
    <div className="fixed top-0 left-64 right-0 z-50 flex justify-between items-center px-8 py-[22px] bg-white border-b shadow-sm">

      <h2 className="text-xl font-bold text-gray-800">
        Dashboard Admin
      </h2>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-700 font-semibold"
        >
          admin ▾
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-md">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}