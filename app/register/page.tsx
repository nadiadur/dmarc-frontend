"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const showAlert = (
    title: string,
    text: string,
    icon: "success" | "error" | "warning" | "info" = "info"
  ) => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: "#2563eb",
    });
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password minimal 8 karakter";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password harus memiliki huruf kapital";
    }

    if (!/[a-z]/.test(password)) {
      return "Password harus memiliki huruf kecil";
    }

    if (!/[0-9]/.test(password)) {
      return "Password harus memiliki angka";
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password harus memiliki simbol";
    }

    return "";
  };

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const passwordValidation = validatePassword(password);

    if (passwordValidation) {
      setPasswordError(passwordValidation);

      showAlert(
        "Password Lemah",
        passwordValidation,
        "warning"
      );

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      console.log("STATUS:", res.status);
      console.log("DATA:", data);

      if (!res.ok) {
        showAlert(
          "Register Gagal",
          data.detail || data.email?.[0] || data.name?.[0] || "Gagal register!",
          "error"
        );

        setLoading(false);
        return;
      }

      showAlert(
        "Berhasil",
        "Register berhasil! Silahkan login.",
        "success"
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("Register error:", error);

      showAlert(
        "Server Error",
        "Terjadi kesalahan pada server.",
        "error"
      );

      setLoading(false);
    }
  }

  return (
    <div
      className={`min-h-screen flex overflow-hidden transition-all duration-500 ${
        isLeaving ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
      }`}
    >
      <div className="w-[45%] relative flex flex-col justify-center px-16 bg-gradient-to-b from-blue-700 to-blue-400 text-white">
        <h1
          onClick={() => router.push("/")}
          className="absolute top-6 left-10 text-xl font-semibold cursor-pointer"
        >
          Dmarclytics
        </h1>

        <div>
          <h2 className="text-3xl font-bold mb-4">
            BERGABUNG DENGAN KAMI! 🚀
          </h2>

          <p>
            Buat akun Anda dan mulai perjalanan bersama kami untuk <br />
            mengelola domain dan laporan DMARC Anda dengan mudah
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
              className={`w-full px-4 py-3 rounded-full border outline-none ${
                passwordError ? "border-red-500" : ""
              }`}
              value={password}
              onChange={(e) => {
                const value = e.target.value;
                setPassword(value);
                setPasswordError(validatePassword(value));
              }}
              required
            />

            {password && (
              <div className="text-left text-sm mt-1 space-y-1">
                <p className={password.length >= 8 ? "text-green-600" : "text-red-500"}>
                  • Minimal 8 karakter
                </p>

                <p className={/[A-Z]/.test(password) ? "text-green-600" : "text-red-500"}>
                  • Memiliki huruf kapital
                </p>

                <p className={/[a-z]/.test(password) ? "text-green-600" : "text-red-500"}>
                  • Memiliki huruf kecil
                </p>

                <p className={/[0-9]/.test(password) ? "text-green-600" : "text-red-500"}>
                  • Memiliki angka
                </p>

                <p
                  className={
                    /[!@#$%^&*(),.?":{}|<>]/.test(password)
                      ? "text-green-600"
                      : "text-red-500"
                  }
                >
                  • Memiliki simbol
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full transition disabled:opacity-70"
              disabled={loading || !!passwordError}
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