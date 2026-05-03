"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);


  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("http://localhost:8000/api/auth/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      name,
      email,
      password
    })
    });

    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("DATA:", data);

    if (!res.ok) {
      alert(data.detail || "Gagal register!");
      setLoading(false);
      return;
    }

    alert("Register berhasil! Silahkan login.");
    router.push("/login");

    setLoading(false);
  }

 return (
  <div
    className={`min-h-screen flex overflow-hidden transition-all duration-500 ${
      isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
    }`}
  >
    <div className="w-[45%] relative flex flex-col justify-center px-16 bg-gradient-to-b from-blue-700 to-blue-400 text-white">
      
      <h1 onClick={() => router.push("/")}
       className="absolute top-6 left-10 text-xl font-semibold">
        Dmarclytics
      </h1>

      <div>
        <h2 className="text-3xl font-bold mb-4">
          BERGABUNG DENGAN KAMI! 🚀
        </h2>

        <p>
          Buat akun Anda dan mulai perjalanan bersama kami untuk <br></br> mengelola domain dan laporan DMARC Anda dengan mudah
        </p>
      </div>
    </div>

    <div className="w-[55%] bg-white flex items-center justify-center relative border-l border-gray-200">
      
      <div className="bg-white p-10 rounded-xl shadow-xl w-[420px] text-center animate-[fadeSlide_1s_ease]">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">
          REGISTER
        </h2>

        <p className="text-gray-500 text-sm mb-6">
          Create your account
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nama lengkap"
            className="w-full px-4 py-3 rounded-full border outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Masukkan email"
            className="w-full px-4 py-3 rounded-full border outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Buat password"
            className="w-full px-4 py-3 rounded-full border outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="button"
            onClick={handleRegister}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full transition"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          Sudah punya akun?{" "}
          <span
            onClick={() => {
            setIsLeaving(true);
            setTimeout(() => {
              router.replace("/login");
            }, 400);
          }}
            className="text-blue-600 cursor-pointer underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  </div>
);
}
