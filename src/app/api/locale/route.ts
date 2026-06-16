import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") ?? undefined;
  const next = url.searchParams.get("next") || "/";
  const response = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", request.url));
  if (isLocale(locale)) {
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}

export async function POST(request: Request) {
  const { locale } = await request.json();
  if (!isLocale(locale)) return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
