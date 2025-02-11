import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Admin route protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallbackSecret") as { role: string };
      if (decoded.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("JWT verification error:", error);
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Parent route protection
  if (request.nextUrl.pathname.startsWith("/parent") && !token) {
    const url = new URL("/parent/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallbackSecret"
      ) as { role: string; isParent: boolean };

      if (request.nextUrl.pathname.startsWith("/parent") && !decoded.isParent) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("JWT verification error:", error);
      const url = new URL("/", request.url);
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
  matcher: ["/parent/:path*", "/admin/:path*"],
};
