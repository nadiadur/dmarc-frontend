"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar />

      <div className="flex-1 flex flex-col ml-64 transition-all duration-300">

        <Navbar />
        

        <main className="p-6 mt-16">
          {children}
        </main>

      </div>
    </div>
  );
}