"use client";

import { usePathname } from "next/navigation";

type Props = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
};

export default function SidebarItem({ icon, label, onClick, href }: Props) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-lg w-full text-left transition-all duration-200 active:scale-95
        text-base
        ${
          isActive
            ? "bg-indigo-50 text-indigo-600 font-semibold border-l-4 border-indigo-500"
            : "text-gray-600 hover:bg-gray-100 hover:text-indigo-500"
        }
      `}
    >
      <span className="w-6 h-6 flex items-center justify-center">
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}