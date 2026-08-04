import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/app/dashboard': ['admin'],
  '/app/employees': ['admin', 'hr'],
  '/app/departments': ['admin', 'hr'],
  '/app/attendances': ['admin', 'hr'],
  '/app/shifts': ['admin', 'hr', 'technician'],
  '/app/leave-requests': ['admin', 'hr'],
  '/app/attendances-policy': ['admin', 'hr'],
  '/app/attendances-summary': ['admin', 'hr'],
  '/app/projects': ['admin', 'sale'],
  '/app/project-tasks': ['admin', 'sale', 'technician'],
  '/app/suggestions': ['admin', 'hr', 'sale', 'technician'],
};

const DEFAULT_PAGES: Record<string, string> = {
  admin: '/app/dashboard',
  hr: '/app/employees',
  sale: '/app/projects',
  technician: '/app/shifts',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const xtAuthCookie = request.cookies.get('xt-auth')?.value;
  let userRoles: string[] = [];

  if (xtAuthCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(xtAuthCookie));
      if (Array.isArray(parsed.roles)) {
        userRoles = parsed.roles.map((r: any) => {
          const code = typeof r === 'string' ? r : r?.code;
          return code === 'super' ? 'admin' : code;
        });
      }
    } catch (e) {
      // Bỏ qua lỗi parse JSON
    }
  }

  // 1. Nếu đã đăng nhập mà cố tình vào lại trang /signin -> redirect về trang mặc định của role
  if (pathname === '/signin') {
    if (userRoles.length > 0) {
      const primaryRole = userRoles[0];
      const redirectUrl = DEFAULT_PAGES[primaryRole] || '/app/dashboard';
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
        const primaryRole = userRoles[0];
        const redirectUrl = DEFAULT_PAGES[primaryRole] || '/app/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/signin'],
};
