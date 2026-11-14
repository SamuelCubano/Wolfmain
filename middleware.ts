import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

const PUBLIC_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/editor", "/dashboard", "/settings"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.includes(pathname);
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  let isAuthenticated = false;
  if (token && JWT_SECRET) {
    isAuthenticated = !!(await verifySessionToken(token, JWT_SECRET));
  }

  if (isAuthenticated && isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isAuthenticated && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|fonts).*)"],
};