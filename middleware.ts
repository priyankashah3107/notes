import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Allow WebSocket connections
    if (req.nextUrl.pathname.startsWith("/api/socket")) {
      return NextResponse.next();
    }
  },
  {
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/notes/:path*", "/api/socket"],
}; 