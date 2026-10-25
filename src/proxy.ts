import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth: proxy } = NextAuth(authConfig);

export default proxy((request) => {
  if (request.auth?.user) return NextResponse.next();

  const loginUrl = new URL("/login", request.nextUrl);
  loginUrl.searchParams.set(
    "callbackUrl",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/orders/:path*",
    "/production-planning/:path*",
    "/products/:path*",
    "/resources/:path*",
    "/settings/:path*",
    "/simulations/:path*",
  ],
};
