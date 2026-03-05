import { auth } from '@/auth';
import { NextAuthRequest } from 'next-auth';

export const proxy = auth((req: NextAuthRequest) => {
  if (!req.auth && req.nextUrl.pathname !== '/login') {
    const loginPage = new URL('/login', req.nextUrl.origin);
    return Response.redirect(loginPage);
  }

  // User is authenticated
  if (req.nextUrl.pathname === '/') {
    const dashboard = new URL('/dashboard', req.nextUrl.origin);
    return Response.redirect(dashboard);
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
