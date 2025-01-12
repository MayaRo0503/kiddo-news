import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (request.nextUrl.pathname.startsWith("/parent") && !token) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallbackSecret"
      ) as { isParent: boolean };
      if (request.nextUrl.pathname.startsWith("/parent") && !decoded.isParent) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("JWT verification error:", error);
      const url = new URL("/auth", request.url);
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export function authenticateToken(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret"
    );

    return decoded;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export const config = {
  matcher: ["/parent/:path*"],
};
