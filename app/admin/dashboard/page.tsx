"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import api from "@/lib/api";

import {
  Users,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Mail,
  Clock3,
} from "lucide-react";

interface AdminDashboardData {
  total_users: number;
  total_admin: number;
  total_regular_users: number;
  today_users: number;
  recent_users: RecentUser[];
}

interface RecentUser {
  id: number;
  user_id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

function StatCard({
  title,
  value,
  sub,
  icon,
  color,
  iconBg,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
          {title}
        </p>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${color}`}
        >
          {icon}
        </div>
      </div>

      <h2 className={`text-3xl font-bold ${color}`}>
        {value}
      </h2>

      {sub && (
        <p className="text-gray-400 text-xs mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();

  const [data, setData] = useState<AdminDashboardData | null>(null);

  const [users, setUsers] = useState<RecentUser[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const usersPerPage = 5;

  const indexOfLastUser = currentPage * usersPerPage;

  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = users.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const totalPages = Math.ceil(users.length / usersPerPage);

  const fetchAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);

    try {
      const res = await api.get("/auth/admin-dashboard/");

      console.log(res.data);

      setData(res.data);

      setUsers(
        Array.isArray(res.data.recent_users)
          ? res.data.recent_users
          : []
      );
    } catch (err: unknown) {
      console.error("Gagal memuat dashboard", err);

      const error = err as {
        response?: { status?: number };
      };

      if (error.response?.status === 401) {
        Cookies.remove("access");
        Cookies.remove("refresh");
        Cookies.remove("role");

        router.push("/admin1/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    const token = Cookies.get("access");
    const role = Cookies.get("role");

    if (!token || role !== "admin") {
      router.push("/admin1/login");
      return;
    }

    fetchAll();
  }, [fetchAll, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-gray-500">
            Memuat dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard 🛡️
            </h1>

            <p className="text-gray-500 mt-1">
              Monitoring dan manajemen sistem
            </p>
          </div>

          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* STAT CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          <StatCard
            title="Total User"
            value={data?.total_users ?? 0}
            sub="Semua akun terdaftar"
            icon={<Users className="w-5 h-5" />}
            color="text-indigo-600"
            iconBg="bg-indigo-100"
          />

          <StatCard
            title="Admin"
            value={data?.total_admin ?? 0}
            sub="Administrator sistem"
            icon={<ShieldCheck className="w-5 h-5" />}
            color="text-purple-600"
            iconBg="bg-purple-100"
          />

          <StatCard
            title="Daftar Hari Ini"
            value={data?.today_users ?? 0}
            sub="User baru hari ini"
            icon={<Clock3 className="w-5 h-5" />}
            color="text-green-600"
            iconBg="bg-green-100"
          />

        </div>

        {/* USER TERBARU */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">

            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                User Terbaru
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Daftar akun terbaru yang terdaftar
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/users")}
              className="flex items-center gap-1 text-indigo-600 text-sm hover:underline"
            >
              Lihat Semua
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {users.length === 0 ? (
            <div className="p-10 text-center">

              <Users className="w-10 h-10 mx-auto text-gray-300 mb-3" />

              <p className="text-gray-500 text-sm">
                Belum ada user
              </p>

            </div>
          ) : (
            <>
              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-gray-50">

                    <tr className="text-left text-xs uppercase text-gray-500">

                      <th className="px-6 py-4">
                        Nama
                      </th>

                      <th className="px-6 py-4">
                        Email
                      </th>

                      <th className="px-6 py-4 text-center">
                        Role
                      </th>

                      <th className="px-6 py-4 text-center">
                        User ID
                      </th>

                      <th className="px-6 py-4 text-center">
                        Tanggal Daftar
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {currentUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-gray-100 hover:bg-gray-50 transition"
                      >

                        <td className="px-6 py-4 font-medium text-gray-800">
                          {user.name}
                        </td>

                        <td className="px-6 py-4 text-gray-500">

                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-300" />
                            {user.email}
                          </div>

                        </td>

                        <td className="px-6 py-4 text-center">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role}
                          </span>

                        </td>

                        <td className="px-6 py-4 text-center text-xs text-gray-400 font-mono">
                          {user.user_id}
                        </td>

                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">

                <p className="text-sm text-gray-500">
                  Halaman {currentPage} dari {totalPages}
                </p>

                <div className="flex items-center gap-2">

                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => prev - 1)
                    }
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-100"
                  >
                    Sebelumnya
                  </button>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setCurrentPage((prev) => prev + 1)
                    }
                    className="px-4 py-2 text-sm rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-100"
                  >
                    Selanjutnya
                  </button>

                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}