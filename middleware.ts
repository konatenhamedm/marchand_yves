import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Skip middleware during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next();
  }

  let token = null;
  
  try {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  } catch (error) {
    // Silent JWT errors
  }
  
  const path = req.nextUrl.pathname;

  // Paths that a logged-in user shouldn't visit
  const publicPaths = ["/login", "/", "/reset", "/otp", "/new_account"];
  const isAuthRoute = publicPaths.includes(path);

  // If the user is logged in and trying to access an auth/public route, redirect to /dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Paths that require authentication
  // Rather than manually listing all models, we just check if it's an API route or static asset.
  // NextJS middleware matcher already ignores static files.
  // So for any path that is not an auth route (and we are here), it requires authentication.
  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on paths that aren't API routes, static assets, or next internals
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpeg|.*\\.png|.*\\.jpg|.*\\.svg).*)"],
};