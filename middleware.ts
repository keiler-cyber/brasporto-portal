import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('bp_auth');
  if (!auth || auth.value !== 'ok') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/conferente/:path*', '/conferente'],
};
