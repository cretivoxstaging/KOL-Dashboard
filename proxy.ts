
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token');
  // Proteksi brute force login berbasis IP
  if (pathname === '/api/Login') {
    let ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const ipKey = ip.replace(/[^\w]/g, '_');
    const lockoutKey = `lockout_until_${ipKey}`;
    const lockoutUntil = request.cookies.get(lockoutKey)?.value;
    const now = Date.now();
    if (lockoutUntil) {
      const lockoutTime = parseInt(lockoutUntil, 10);
      if (!isNaN(lockoutTime) && lockoutTime > now) {
        const retryAfter = Math.ceil((lockoutTime - now) / 1000);
        return NextResponse.json(
          { success: false, message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.', retryAfter, ip },
          { status: 429 }
        );
      }
    }
  }

  // Jika user akses /dashboard tanpa token, redirect ke /login
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Jangan blokir halaman login
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/login'],
};
