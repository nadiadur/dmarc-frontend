"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function UserLoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const token = Cookies.get("access");

    if (token) {
      router.replace("/user/dashboard");
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    Cookies.remove("access");
    Cookies.remove("refresh");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login gagal");
        setLoading(false);
        return;
      }

      if (data.role !== "user") {
        alert("Akses ditolak!");

        Cookies.remove("access");
        Cookies.remove("refresh");
        Cookies.remove("user_id");
        Cookies.remove("role");
        Cookies.remove("username");

        setLoading(false);
        return;
      }

      const cookieOptions = {
        path: "/",
        sameSite: "lax" as const,
      };

      Cookies.set("access", data.access, cookieOptions);
      Cookies.set("refresh", data.refresh, cookieOptions);
      Cookies.set("role", "user", cookieOptions);
      Cookies.set("email", data.email, cookieOptions);
      Cookies.set("user_id", data.user_id, cookieOptions);
      Cookies.set("username", data.name, cookieOptions);

      window.dispatchEvent(new Event("authChange"));

      setIsLeaving(true);

      setTimeout(() => {
        router.replace("/user/dashboard");
      }, 300);
    } catch (error) {
      console.error("Login error:", error);
      alert("Terjadi kesalahan server");
      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen flex overflow-hidden transition-all duration-500 ${
        isLeaving
          ? "-translate-x-full opacity-0"
          : "translate-x-0 opacity-100"
      }`}
    >
      {/* LEFT */}
      <div className="w-[45%] bg-white flex flex-col justify-center px-16 relative">
        
        {/* LOGO / BRAND */}
        <h1
          onClick={() => router.push("/")}
          className="absolute top-6 left-10 text-xl font-semibold text-blue-600 cursor-pointer hover:text-blue-800 transition"
        >
          Dmarclytics
        </h1>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 leading-snug">
            BERGABUNG DENGAN KAMI! 
          </h2>

          <p className="text-gray-500 leading-relaxed">
            Buat akun Anda dan mulai perjalanan bersama kami
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-[55%] flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-400">
        <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl w-[400px] text-center shadow-xl">
          
          <h2 className="text-2xl font-semibold text-white mb-6">
            LOGIN
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* USERNAME */}
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-blue-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            {/* PASSWORD */}
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* BUTTON LOGIN */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition disabled:opacity-70"
            >
              {loading ? "Loading..." : "Login"}
            </button>

            

          {/* REGISTER */}
          <p className="text-sm text-gray-200 mt-6 text-center">
            Belum punya akun?{" "}
            <span
              onClick={() => {
                setIsLeaving(true);

                setTimeout(() => {
                  router.push("/register");
                }, 300);
              }}
              className="text-white font-semibold cursor-pointer underline"
            >
              Daftar
            </span>
          </p>
          {/* LUPA PASSWORD */}
            <div className="text-center mt-1">
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-blue-200 hover:text-white transition"
              >
                Lupa sandi?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}