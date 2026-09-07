import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rawSidebarSections } from './config/sidebar';

const ROUTE_PERMISSIONS: Record<string, string[]> = {};
for (const section of rawSidebarSections) {
  for (const item of section.items) {
    if (item.href && item.roles) {
      ROUTE_PERMISSIONS[item.href] = item.roles;
    }
    if (item.subItems) {
      for (const sub of item.subItems) {
        if (sub.href && sub.roles) {
          ROUTE_PERMISSIONS[sub.href] = sub.roles;
        }
      }
    }
  }
}



export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const xtAuthCookie = request.cookies.get('xt-auth')?.value;
  let userRoles: string[] = [];

  if (xtAuthCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(xtAuthCookie));
      if (Array.isArray(parsed.roles)) {
        userRoles = parsed.roles.map((r: any) => {
          return typeof r === 'string' ? r : r?.code;
        });
      }
    } catch (e) {
      // Bỏ qua lỗi parse JSON
    }
  }

  console.log(`[Proxy] Pathname: ${pathname}`);
  console.log(`[Proxy] Raw Cookie: ${xtAuthCookie}`);
  console.log(`[Proxy] parsed userRoles:`, userRoles);

  // 1. Nếu đã đăng nhập mà cố tình vào lại trang /signin -> redirect về trang mặc định của role
  if (pathname === '/signin') {
    if (userRoles.length > 0) {
      const redirectUrl = '/app/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // 2. Kiểm tra các route /app
  if (pathname.startsWith('/app')) {
    // Chưa đăng nhập -> Chuyển hướng về trang signin
    if (userRoles.length === 0) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }

    // Kiểm tra quyền truy cập route
    const allowedRoles = ROUTE_PERMISSIONS[pathname];
    if (allowedRoles) {
      const hasPermission = userRoles.some((role) => allowedRoles.includes(role));
      if (!hasPermission) {
        const redirectUrl = '/app/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/signin'],
};
