import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Proxy chỉ chặn "chưa đăng nhập". Quyền vào từng trang do /me quyết định ở client
// (trang không đủ quyền hiện thông báo "chưa có quyền", không nằm ở đây).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isSignedIn = Boolean(request.cookies.get('xt-auth')?.value);

  // Đã đăng nhập mà vào lại /signin -> về trang tổng quan
  if (pathname === '/signin') {
    return isSignedIn ? NextResponse.redirect(new URL('/app/dashboard', request.url)) : NextResponse.next();
  }

  if (pathname.startsWith('/app') && !isSignedIn) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  const res = NextResponse.next();
  if (pathname.startsWith('/app')) {
    res.headers.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
    res.headers.set('CDN-Cache-Control', 'no-store');
    res.headers.set('Surrogate-Control', 'no-store');
  }
  return res;
}

export const config = {
  matcher: ['/app/:path*', '/signin'],
};
