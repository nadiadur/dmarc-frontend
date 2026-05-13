"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/auth/admin1/login/`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, password }),
  }
);
   

      let data;
      try {
        data = await res.json();
      } catch {
        setErrorMsg("Server error, coba lagi.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.detail || "Nama atau password salah");
        setLoading(false);
        return;
      }

      if (data.role !== "admin") {
        setErrorMsg("Akun ini bukan admin!");
        setLoading(false);
        return;
      }

      Cookies.set("access", data.access);
      Cookies.set("refresh", data.refresh);
      Cookies.set("role", data.role);
      Cookies.set("user_id", data.user_id);

      setLoading(false);
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Terjadi kesalahan saat login.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden">

      <div className="w-[50%] bg-black text-white flex flex-col justify-center px-16 animate-[fadeInLeft_0.8s_ease]">
        <h1 className="text-xl font-semibold mb-6">DMARC ADMIN</h1>

        <h2 className="text-4xl font-bold mb-4">
          Welcome Back 👋
        </h2>

        <p className="text-gray-400">
          Login sebagai admin untuk mengelola sistem dan monitoring DMARC.
        </p>
      </div>

      <div className="w-[50%] flex items-center justify-center bg-gray-100 animate-[fadeInRight_0.8s_ease]">

        <div className="w-[420px] bg-white p-10 rounded-2xl shadow-xl">

          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            Login Admin
          </h2>

          <p className="text-gray-500 text-sm text-center mb-6">
            Masukkan akun admin
          </p>

          {errorMsg && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-600 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="text"
              placeholder="Nama admin"
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className={`w-full bg-black hover:bg-gray-900 text-white py-3 rounded-lg transition ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </button>

          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>

    </div>
  );
}
