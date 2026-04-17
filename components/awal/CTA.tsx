"use client";
import { useRouter } from "next/navigation";

export default function CTA() {
  const router = useRouter();

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

          <button
            onClick={() => router.push("/login")}
            className="bg-white text-blue-900 px-5 py-2.5 rounded-md font-medium hover:bg-gray-200 transition"
          >
            Mulai Sekarang
          </button>

          <button
            onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            className="border border-white px-5 py-2.5 rounded-md font-medium hover:bg-white hover:text-blue-900 transition"
          >
            Lihat Fitur
          </button>

        </div>

      </div>
    </section>
  );
}