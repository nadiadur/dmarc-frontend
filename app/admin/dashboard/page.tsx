"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/api";

interface DashboardData {
  total_users: number;
  total_reports: number;
  total_issues: number;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData>({
    total_users: 0,
    total_reports: 0,
    total_issues: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("access");
    const role = Cookies.get("role");

    if (!token || role !== "admin") {
      router.push("/admin1/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await api.get<DashboardData>("/dashboard/");
        setData(res.data);
      } catch (err: unknown) {
        console.error("Gagal load dashboard", err);

        // casting aman
        const error = err as {
          response?: { status?: number };
        };

        if (error.response?.status === 401) {
          Cookies.remove("access");
          router.push("/admin1/login");
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Welcome Admin 👋
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-2xl font-bold">
            {data.total_users ?? 0}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Reports</p>
          <h2 className="text-2xl font-bold">
            {data.total_reports ?? 0}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Issues</p>
          <h2 className="text-2xl font-bold">
            {data.total_issues ?? 0}
          </h2>
        </div>

      </div>
    </div>
  );
}