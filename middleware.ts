import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const role = req.cookies.get("role")?.value;
  const token = req.cookies.get("access")?.value;
  const path = req.nextUrl.pathname;

  if (token && path === "/login" && role === "user") {
    return NextResponse.redirect(
      new URL("/user/dashboard", req.url)
    );
  }

  if (token && path === "/admin1/login" && role === "admin") {
    return NextResponse.redirect(
      new URL("/admin", req.url)
    );
  }

  if (path === "/login" || path === "/admin1/login") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  if (path.startsWith("/user") && role !== "user") {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
    "/profile/:path*",
    "/login",
    "/admin1/login",
  ],
};