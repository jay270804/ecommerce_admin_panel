import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login'];
const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public paths to pass through
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. Get the token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;

  if (!accessToken) {
    // Redirect to login if no token is found
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Verify the token and check the role
  try {
    const { payload } = await jwtVerify(accessToken, JWT_SECRET);

    if (payload.role !== 'admin') {
      // If the role is not 'admin', redirect to login
      console.warn('Unauthorized access attempt by non-admin user:', payload);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (error) {
    // If token verification fails, redirect to login
    console.error('JWT Verification Error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. If verification is successful, proceed
  return NextResponse.next();
}

// 4. Simplified Matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};