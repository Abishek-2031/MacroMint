import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('mm_token')?.value;

  const protectedRoutes = ['/dashboard', '/onboarding', '/store', '/checkout'];
  const authRoutes = ['/login', '/register'];

  if (protectedRoutes.some(r => pathname.startsWith(r))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (authRoutes.some(r => pathname.startsWith(r))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/store/:path*', '/checkout/:path*', '/login', '/register'],
};

