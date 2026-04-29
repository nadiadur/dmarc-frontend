"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { FileCheck, ShieldCheck, AlertCircle } from "lucide-react";
import { ReactNode } from "react";

type UserCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
};

type DashboardData = {
  summary: {
    total_reports: number;
    pass_rate_30d: number;
    failed_messages_30d: number;
  };
};

export default function UserDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔥 1. PROTEKSI LOGIN (WAJIB)
  useEffect(() => {
    const t = Cookies.get("access") ?? null;
    const role = Cookies.get("role");

    if (!t || role !== "user") {
      window.location.replace("/login"); // ✅ hard redirect
      return;
    }

    setToken(t);
  }, []);

  // 🔥 2. FETCH DATA
  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/dashboard/overview/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 🔥 token expired / invalid
        if (res.status === 401) {
          Cookies.remove("access");
          Cookies.remove("role");
          window.location.replace("/login");
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  // 🔥 3. JANGAN RENDER kalau belum valid
  if (!token) return null;

  // 🔄 loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
              value={String(data?.summary?.total_reports ?? 0)}
              icon={<FileCheck className="w-8 h-8 text-blue-500" />}
            />

            <UserCard
              title="Security Passed"
              value={`${data?.summary?.pass_rate_30d ?? 0}%`}
              icon={<ShieldCheck className="w-8 h-8 text-green-500" />}
            />

            <UserCard
              title="Issues Found"
              value={String(data?.summary?.failed_messages_30d ?? 0)}
              icon={<AlertCircle className="w-8 h-8 text-red-500" />}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

function UserCard({ title, value, icon }: UserCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}