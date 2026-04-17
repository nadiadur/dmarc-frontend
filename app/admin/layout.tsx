"use client";

import SidebarAdmin from "@/components/admin/SidebarAdmin";
import NavbarAdmin from "@/components/admin/NavbarAdmin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <SidebarAdmin />

      <div className="flex-1 flex flex-col ml-64">

        <NavbarAdmin />

        <main className="mt-16 p-6">
          {children}
        </main>

      </div>
    </div>
  );
}