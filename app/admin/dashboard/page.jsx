"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("access");
    const role = Cookies.get("role");
    if (!token || role !== "admin") {
      router.push("/admin1/login");
    }
  }, [router]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Welcome Admin 👋
      </h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Users</p>
          <h2 className="text-2xl font-bold">120</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Reports</p>
          <h2 className="text-2xl font-bold">45</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Issues</p>
          <h2 className="text-2xl font-bold">8</h2>
        </div>

      </div>
    </div>
  );
}