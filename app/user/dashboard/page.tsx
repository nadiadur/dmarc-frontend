"use client";

import Cookies from "js-cookie";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileCheck, ShieldCheck, AlertCircle } from "lucide-react";
import { ReactNode } from "react";

type UserCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
};

export default function UserDashboard() {
  const router = useRouter();


  useEffect(() => {
    const token = Cookies.get("access");
    const role = Cookies.get("role");

    if (!token || role !== "user") {
      router.push("/unauthorized");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">


      <div className="flex-1 flex flex-col">

        <main className="p-6">

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back 👋
            </h2>
            <p className="text-gray-600">
              Ringkasan aktivitas DMARC kamu hari ini
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <UserCard
              title="Total Reports"
              value="4"
              icon={<FileCheck className="w-8 h-8 text-blue-500" />}
            />

            <UserCard
              title="Security Passed"
              value="3"
              icon={<ShieldCheck className="w-8 h-8 text-green-500" />}
            />

            <UserCard
              title="Issues Found"
              value="1"
              icon={<AlertCircle className="w-8 h-8 text-red-500" />}
            />

          </div>

          <section className="mt-10 bg-white rounded-xl p-6 shadow border">
            <h3 className="text-xl font-semibold mb-4">
              Recent Activity
            </h3>

            <p className="text-gray-600">
              Aktivitas terbaru DMARC akan muncul di sini, termasuk log email, status domain, dan hasil analisis keamanan.
            </p>
          </section>

        </main>
      </div>
    </div>
  );
}

function UserCard({ title, value, icon }: UserCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}