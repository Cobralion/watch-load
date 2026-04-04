import { auth } from '@/lib/auth';
import { NextAuthRequest } from 'next-auth';

export const proxy = auth((req: NextAuthRequest) => {
    const dashboard = new URL('/dashboard', req.nextUrl.origin);
    const loginPage = new URL('/login', req.nextUrl.origin);

    // User is not authenticated
    if (!req.auth) {
        if (req.nextUrl.pathname !== '/login') {
            return Response.redirect(loginPage);
        }
    }

    // User is authenticated
    if (req.auth) {
        if (req.nextUrl.pathname === '/login') {
            const dashboard = new URL('/dashboard', req.nextUrl.origin);
            return Response.redirect(dashboard);
        }

        if (
            req.nextUrl.pathname === '/' ||
            req.nextUrl.pathname === '/workspace'
        ) {
            return Response.redirect(dashboard);
        }
    }
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
