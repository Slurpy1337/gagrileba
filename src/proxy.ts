import { NextResponse, type NextRequest } from "next/server";

function adminLoginPath() {
  const path = process.env.ADMIN_LOGIN_PATH || "/gagrileba-admin";
  return path.startsWith("/") ? path : `/${path}`;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const loginPath = adminLoginPath();
  const isAdmin = pathname.startsWith("/admin");
  const isInternalLogin = pathname === "/admin/login";
  const isConfiguredLogin = pathname === loginPath;

  if (isConfiguredLogin) {
    return NextResponse.rewrite(new URL("/admin/login", request.url));
  }

  if (isInternalLogin && process.env.NODE_ENV === "production" && loginPath !== "/admin/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAdmin && !isInternalLogin && !request.cookies.get("admin_session")) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
