"use client";

import { useRouter } from "next/navigation";

export default function ToolsPage() {
  const router = useRouter();

  const tools = [
    {
      title: "Domain Checker",
      path: "/tools/domain-checker",
    },
    {
      title: "DMARC Checker",
      path: "/tools/dmarc-checker",
    },
    {
      title: "SPF Checker",
      path: "/tools/spf-checker",
    },
    {
      title: "DKIM Checker",
      path: "/tools/dkim-checker",
    },
  ];

  return (
    <div className="bg-gray-100 py-16 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto text-center">

        <h1 className="text-4xl font-bold text-blue-900 mb-10">
          Tools DMARC
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {tools.map((tool, i) => (
            <div
              key={i}
              onClick={() => router.push(tool.path)}
              className="cursor-pointer bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-blue-900">
                {tool.title}
              </h2>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}