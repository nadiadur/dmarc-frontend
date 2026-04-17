"use client";
 
import { useRouter } from "next/navigation";
import { User, FileCheck, ShieldCheck, AlertCircle } from "lucide-react";
import SidebarItem from "./SidebarItem";
 
export default function Sidebar() {
  const router = useRouter();
 
 
  return (
  <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r flex flex-col">    
    <div className="flex items-center gap-4 px-8 py-[22px] bg-indigo-600 text-white border-b border-indigo-500">
      <div className="bg-white text-indigo-600 font-bold px-2 py-1 rounded"> 
        RA
      </div>
      <h2 className="text-lg font-semibold">Dmarclytics</h2>
    </div>

    <nav className="flex flex-col px-4 py-6 text-gray-700 text-sm">

      
      <SidebarItem
        icon={<User className="w-6 h-6" />}
        label="Dashboard"
        href="/user/dashboard"
        onClick={() => router.push("/user/dashboard")}
      />

      <p className="mt-6 mb-2 text-xs text-gray-400 font-semibold">
        FEATURES
      </p>

      <SidebarItem
        icon={<FileCheck className="w-6 h-6" />}
        label="Reports"
        href="/user/reports"
        onClick={() => router.push("/user/reports")}
      />

      <SidebarItem
        icon={<ShieldCheck className="w-6 h-6" />}
        label="Security"
        href="/user/security"
        onClick={() => router.push("/user/security")}
      />

      <SidebarItem
        icon={<AlertCircle className="w-6 h-6" />}
        label="Issues"
        href="/user/issues"
        onClick={() => router.push("/user/issues")}
      />

    </nav>


  </aside>
);
}