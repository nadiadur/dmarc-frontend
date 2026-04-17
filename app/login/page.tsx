"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UserLoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Username atau password salah");
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

      Cookies.set("access", data.access, { path: "/" });
      Cookies.set("refresh", data.refresh, { path: "/" });
      Cookies.set("role", "user", { path: "/" });
      Cookies.set("email", data.email, { path: "/" });
      Cookies.set("user_id", data.user_id, { path: "/" });
      Cookies.set("username", data.name, { path: "/" });

      setIsLeaving(true);
      await new Promise((r) => setTimeout(r, 400));
      router.push("/user/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      alert("Terjadi kesalahan server");
      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen flex overflow-hidden transition-all duration-500 ${
        isLeaving ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div className="w-[45%] bg-white flex flex-col justify-center px-16 relative">

        <h1 className="absolute top-6 left-10 text-xl font-semibold text-blue-600">
          Dmarclytics
        </h1>

        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            WELCOME BACK !
          </h2>

          <p className="text-gray-500">
            Login to continue your journey with us
          </p>
        </div>
      </div>

      <div className="w-[55%] flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-400">

        <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl w-[400px] text-center shadow-xl animate-[fadeSlide_1s_ease]">

          <h2 className="text-2xl font-semibold text-white mb-6">
            LOGIN
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">

            <input
              type="text"
              placeholder="Nama"
              className="w-full px-4 py-3 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-blue-300"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-white/80 outline-none focus:ring-2 focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition"
            >
              {loading ? "Loading..." : "Login"}
            </button>

          </form>

          <p className="text-sm text-gray-200 mt-6">
            Belum punya akun?{" "}
            <span
              onClick={() => {
                setIsLeaving(true);
                setTimeout(() => {
                  router.push("/register");
                }, 400);
              }}
              className="text-white font-semibold cursor-pointer underline"
            >
              Daftar
            </span>
          </p>

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}