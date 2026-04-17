"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  AlertCircle,
} from "lucide-react";

type ItemProps = {
  icon: React.ReactNode;
  label: string;
  path: string;
};

function SidebarItem({ icon, label, path }: ItemProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = pathname === path;

  return (
    <button
      onClick={() => router.push(path)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
      ${
        isActive
          ? "bg-gray-900 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function SidebarAdmin() {
  return (
    <aside className="w-64 h-screen bg-white border-r fixed left-0 top-0 flex flex-col">

      {/* HEADER */}
      <div className="flex items-center gap-3 px-6 py-5 border-b">
        <div className="bg-black text-white font-bold px-2 py-1 rounded">
          AD
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Admin Panel
        </h2>
      </div>

      <nav className="flex flex-col px-4 py-6 gap-2">

        <SidebarItem
          icon={<LayoutDashboard className="w-5 h-5" />}
          label="Dashboard"
          path="/admin/dashboard"
        />

        <p className="text-xs text-gray-400 mt-6 mb-2 px-2 font-semibold">
          MANAGEMENT
        </p>

        <SidebarItem
          icon={<Users className="w-5 h-5" />}
          label="Users"
          path="/admin/users"
        />

        <SidebarItem
          icon={<FileText className="w-5 h-5" />}
          label="Reports"
          path="/admin/reports"
        />

        <SidebarItem
          icon={<Shield className="w-5 h-5" />}
          label="Security"
          path="/admin/security"
        />

        <SidebarItem
          icon={<AlertCircle className="w-5 h-5" />}
          label="Issues"
          path="/admin/issues"
        />

      </nav>

      <div className="mt-auto px-4 pb-6 text-xs text-gray-400">
        Admin v1.0
      </div>

    </aside>
  );
}