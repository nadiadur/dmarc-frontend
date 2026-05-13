"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck, ShieldCheck, AlertCircle, Globe, Mail, RefreshCw, ArrowRight,
  Activity, Zap, Shield
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type DashboardData = {
  summary: {
    total_reports: number;
    pass_rate_30d: number;
    failed_messages_30d: number;
    total_messages_30d: number;
    suspicious_ips_30d: number;
    unread_alerts: number;
  };
  domains: { id: number; domain_name: string; is_verified: boolean }[];
  geo_data: {
    source_ip: string;
    geo_country: string;
    geo_city: string;
    is_suspicious: boolean;
    total: number;
  }[];
  recent_reports: {
    id: string;
    org_name: string;
    domain_policy: string;
    total_messages: number;
    passed_messages: number;
    failed_messages: number;
    status: string;
    date_begin: string;
  }[];
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getInsightLevel(passRate: number): {
  label: string; color: string; bg: string; border: string; icon: string; desc: string;
} {
  if (passRate >= 95) return {
    label: "Sangat Aman", color: "text-emerald-700", bg: "bg-emerald-50",
    border: "border-emerald-200", icon: "🛡️",
    desc: "Konfigurasi email kamu sudah sangat baik. Pertahankan!"
  };
  if (passRate >= 80) return {
    label: "Cukup Aman", color: "text-blue-700", bg: "bg-blue-50",
    border: "border-blue-200", icon: "✅",
    desc: "Sebagian besar email tervalidasi. Ada ruang untuk peningkatan."
  };
  if (passRate >= 50) return {
    label: "Perlu Perhatian", color: "text-yellow-700", bg: "bg-yellow-50",
    border: "border-yellow-200", icon: "⚠️",
    desc: "Cukup banyak email gagal validasi. Periksa konfigurasi SPF/DKIM."
  };
  return {
    label: "Berisiko Tinggi", color: "text-red-700", bg: "bg-red-50",
    border: "border-red-200", icon: "🚨",
    desc: "Banyak email gagal validasi. Segera periksa konfigurasi domain."
  };
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div className={`h-1.5 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function PassRateRing({ rate }: { rate: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (rate / 100) * circ;
  const color = rate >= 80 ? "#10b981" : rate >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="44" cy="44" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-bold text-gray-800">{rate}%</p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function UserDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = Cookies.get("access") ?? null;
    const role = Cookies.get("role");
    if (!t || role !== "user") {
      window.location.replace("/login");
      return;
    }
    setToken(t);
  }, []);

  const fetchDashboard = async (t: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/dashboard/overview/`,
  {
    headers: {
      Authorization: `Bearer ${t}`,
    },
  }
);
    
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchDashboard(token);
  }, [token]);

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  const s = data?.summary;
  const passRate = s?.pass_rate_30d ?? 0;
  const insight = getInsightLevel(passRate);
  const totalMsg = s?.total_messages_30d ?? 0;
  const failedMsg = s?.failed_messages_30d ?? 0;
  const passedMsg = totalMsg - failedMsg;
  const recentReports = data?.recent_reports ?? [];
  const domains = data?.domains ?? [];
  const geoData = data?.geo_data ?? [];
  const suspiciousIPs = geoData.filter(g => g.is_suspicious).slice(0, 5);
  const topCountries = Object.entries(
    geoData.reduce((acc, g) => {
      if (g.geo_country) acc[g.geo_country] = (acc[g.geo_country] || 0) + g.total;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Selamat Datang</h1>
            <p className="text-gray-500 mt-1">Ringkasan keamanan email domain kamu</p>
          </div>
          <button
            onClick={() => token && fetchDashboard(token, true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 bg-white border px-3 py-2 rounded-lg shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* ── Insight Banner ── */}
        <div className={`rounded-2xl border ${insight.border} ${insight.bg} p-5 mb-6 flex items-center gap-4`}>
          <span className="text-4xl">{insight.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold text-lg ${insight.color}`}>{insight.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${insight.bg} ${insight.color} border ${insight.border}`}>
                Pass Rate {passRate}%
              </span>
            </div>
            <p className={`text-sm ${insight.color} opacity-80`}>{insight.desc}</p>
          </div>
          <PassRateRing rate={passRate} />
        </div>

        {/* ── Alert banner ── */}
        {(s?.unread_alerts ?? 0) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div className="flex-1">
              <p className="font-semibold text-red-700">{s?.unread_alerts} alert belum dibaca</p>
              <p className="text-red-500 text-sm">Ada aktivitas mencurigakan yang perlu diperiksa</p>
            </div>
            <button
              onClick={() => router.push("/user/alerts")}
              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700"
            >
              Lihat <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              title: "Total Laporan", value: s?.total_reports ?? 0,
              icon: <FileCheck className="w-5 h-5" />, color: "text-blue-600",
              iconBg: "bg-blue-100", sub: "Semua laporan masuk"
            },
            {
              title: "Email Divalidasi", value: totalMsg.toLocaleString("id-ID"),
              icon: <Mail className="w-5 h-5" />, color: "text-indigo-600",
              iconBg: "bg-indigo-100", sub: "Total pesan 30 hari"
            },
            {
              title: "Gagal Validasi", value: failedMsg.toLocaleString("id-ID"),
              icon: <AlertCircle className="w-5 h-5" />, color: "text-red-500",
              iconBg: "bg-red-100", sub: "SPF/DKIM gagal"
            },
            {
              title: "IP Mencurigakan", value: s?.suspicious_ips_30d ?? 0,
              icon: <Globe className="w-5 h-5" />, color: "text-orange-500",
              iconBg: "bg-orange-100", sub: "IP unik terdeteksi"
            },
          ].map((c) => (
            <div key={c.title} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{c.title}</p>
                <div className={`w-8 h-8 ${c.iconBg} ${c.color} rounded-lg flex items-center justify-center`}>
                  {c.icon}
                </div>
              </div>
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-gray-400 text-xs mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Distribusi + Domain ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Distribusi Validasi */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-gray-700">Distribusi Validasi Email</h3>
            </div>

            {totalMsg > 0 ? (
              <>
                <div className="flex rounded-full overflow-hidden h-5 mb-4">
                  <div
                    className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all duration-700"
                    style={{ width: `${passRate}%` }}
                  >
                    {passRate >= 20 && `${passRate}%`}
                  </div>
                  <div
                    className="bg-red-400 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${100 - passRate}%` }}
                  >
                    {(100 - passRate) >= 20 && `${(100 - passRate).toFixed(1)}%`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs text-emerald-600 font-medium">PASS</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">{passedMsg.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-emerald-500 mt-0.5">Email tervalidasi</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-500 font-medium">FAIL</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{failedMsg.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-red-400 mt-0.5">Email gagal validasi</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Mail className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada data email</p>
                <p className="text-xs mt-1">Data akan muncul setelah laporan DMARC masuk</p>
              </div>
            )}

            {/* Rekomendasi */}
            {totalMsg > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">💡 Rekomendasi</p>
                <div className="space-y-1.5">
                  {passRate < 100 && (
                    <p className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-yellow-500 mt-0.5">•</span>
                      Periksa konfigurasi SPF record — pastikan semua server pengirim email terdaftar
                    </p>
                  )}
                  {passRate < 80 && (
                    <p className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-orange-500 mt-0.5">•</span>
                      Verifikasi DKIM selector dan private key di mail server kamu
                    </p>
                  )}
                  {passRate < 50 && (
                    <p className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5">•</span>
                      Pertimbangkan untuk menggunakan policy <strong>quarantine</strong> setelah fix
                    </p>
                  )}
                  {passRate >= 95 && (
                    <p className="text-xs text-gray-600 flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      Konfigurasi sudah bagus! Pertimbangkan upgrade ke policy <strong>reject</strong>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Domain Status */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-700">Domain Terdaftar</h3>
              </div>
              <button
                onClick={() => router.push("/user/domain")}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Kelola <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {domains.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Globe className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada domain</p>
                <button
                  onClick={() => router.push("/user/domains")}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  + Tambah domain
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {domains.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${d.is_verified ? "bg-emerald-500" : "bg-yellow-400"}`} />
                      <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">{d.domain_name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      d.is_verified ? "bg-emerald-100 text-emerald-600" : "bg-yellow-100 text-yellow-600"
                    }`}>
                      {d.is_verified ? "Aktif" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Reports + Suspicious IPs ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Recent Reports */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-gray-700">Laporan Terbaru</h3>
              </div>
              <button
                onClick={() => router.push("/user/reports")}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Lihat semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentReports.length === 0 ? (
              <div className="p-10 text-center text-gray-400">
                <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Belum ada laporan masuk</p>
                <p className="text-xs mt-1">Laporan DMARC akan muncul di sini</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentReports.map((r) => {
                  const rPassRate = r.total_messages > 0
                    ? Math.round((r.passed_messages / r.total_messages) * 100) : 0;
                  return (
                    <div key={r.id} className="px-5 py-3 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{r.org_name || r.domain_policy || "-"}</p>
                          <p className="text-xs text-gray-400">{r.domain_policy}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${rPassRate >= 80 ? "text-emerald-600" : "text-red-500"}`}>
                            {rPassRate}%
                          </p>
                          <p className="text-xs text-gray-400">{r.total_messages} pesan</p>
                        </div>
                      </div>
                      <MiniBar value={r.passed_messages} max={r.total_messages} color="bg-emerald-400" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Suspicious IPs + Top Countries */}
          <div className="space-y-4">

            {/* Suspicious IPs */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-orange-400" />
                <h3 className="font-semibold text-gray-700">IP Mencurigakan</h3>
              </div>
              {suspiciousIPs.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">🎉 Tidak ada IP mencurigakan</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {suspiciousIPs.map((ip, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-red-50 border border-red-100">
                      <div>
                        <p className="text-xs font-mono font-semibold text-red-700">{ip.source_ip}</p>
                        <p className="text-xs text-red-400">{ip.geo_city || ip.geo_country || "Unknown"}</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        {ip.total}x
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Countries */}
            {topCountries.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <h3 className="font-semibold text-gray-700">Asal Email</h3>
                </div>
                <div className="space-y-2">
                  {topCountries.map(([country, count], i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{country}</span>
                        <span className="text-gray-400 font-medium">{count}</span>
                      </div>
                      <MiniBar
                        value={count}
                        max={topCountries[0][1]}
                        color={i === 0 ? "bg-blue-500" : "bg-blue-300"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-700 mb-4">⚡ Aksi Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Lihat Laporan", icon: "📊", path: "/user/reports", color: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" },
              { label: "Kelola Domain", icon: "🌐", path: "/user/domain", color: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200" },
              { label: "Cek Alert", icon: "🚨", path: "/user/alerts", color: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200" },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => router.push(a.path)}
                className={`flex items-center gap-2 p-3 rounded-xl border font-medium text-sm transition ${a.color}`}
              >
                <span>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
