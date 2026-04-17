"use client";

import { useSyncExternalStore, useState, useRef, useEffect } from "react";
import Cookies from "js-cookie";
import Link from "next/link";

function getCookieSnapshot() {
  return Cookies.get("username") ?? "User";
}
function getServerSnapshot() {
  return "User";
}

function getEmailSnapshot() {
  return Cookies.get("email") ?? "";
}
function getEmailServerSnapshot() {
  return "";
}

export default function Navbar() {
  const name = useSyncExternalStore(
    () => () => {},
    getCookieSnapshot,
    getServerSnapshot
  );

  const email = useSyncExternalStore(
    () => () => {},
    getEmailSnapshot,
    getEmailServerSnapshot
  );

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* 🔹 LOGOUT */
  function handleLogout() {
    Cookies.remove("access");
    Cookies.remove("refresh");
    Cookies.remove("user_id");
    Cookies.remove("role");
    Cookies.remove("username");
    Cookies.remove("email");

    window.location.href = "/login";
  }

  return (
    <div className="fixed top-0 left-64 right-0 z-50 flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 shadow-sm">
      
      <h2 className="text-2xl font-bold text-gray-800">
        Dashboard User
      </h2>

      <div className="relative" ref={dropdownRef}>
        
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          <span className="text-base font-medium text-gray-800">
            {name}
          </span>

          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute right-2 top-12 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs text-gray-400">Signed in as</p>
              <p className="text-sm font-medium text-gray-700 truncate">
                {email}
              </p>
            </div>

            <Link href="/profile">
              <div className="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer">
                Profile
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v4m0 4h.01M6.938 4.938a10 10 0 1010.124 0"
                />
              </svg>

              Log Out
            </button>

          </div>
        )}
      </div>
    </div>
  );
}