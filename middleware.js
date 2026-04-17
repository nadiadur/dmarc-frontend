import { NextResponse } from "next/server";

export function middleware(req) {
  const role = req.cookies.get("role")?.value;
  const token = req.cookies.get("access")?.value;

  const path = req.nextUrl.pathname;

  // ===========================================
  // 1. Halaman login user & admin bebas diakses
  // ===========================================
  if (path === "/login" || path === "/admin1/login") {
    return NextResponse.next();
  }

  // ===========================================
  // 2. Jika tidak ada token → redirect ke login user
  // ===========================================
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ===========================================
  // 3. Admin tidak boleh akses login user
  // ===========================================
  if (path === "/login" && role === "admin") {
    return NextResponse.redirect(new URL("/admin1/login", req.url));
  }

  // ===========================================
  // 4. User tidak boleh akses login admin
  // ===========================================
  if (path === "/admin1/login" && role === "user") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ===========================================
  // 5. Proteksi halaman admin
  // ===========================================
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // ===========================================
  // 6. Proteksi halaman user
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
    "/admin1/login"
  ],
};
