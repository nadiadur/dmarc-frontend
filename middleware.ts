import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  const token = req.cookies.get("access")?.value;
  const path = req.nextUrl.pathname;

  // ===========================================
  // 1. Kalau sudah login, jangan ke login lagi
  // ===========================================
  if (token && path === "/login" && role === "user") {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  if (token && path === "/admin1/login" && role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // ===========================================
  // 2. Halaman login boleh diakses kalau belum login
  // ===========================================
  if (path === "/login" || path === "/admin1/login") {
    return NextResponse.next();
  }

  // ===========================================
  // 3. Kalau belum login → paksa ke login user
  // ===========================================
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ===========================================
  // 4. Proteksi halaman admin
  // ===========================================
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ===========================================
  // 5. Proteksi halaman user
  // ===========================================
  if (path.startsWith("/user") && role !== "user") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/admin1/login",
  ],
};