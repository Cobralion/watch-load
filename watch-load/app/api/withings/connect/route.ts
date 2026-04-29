import { getWithingsAuthUrl } from '@/lib/withings/oauth';
import { NextRequest, NextResponse } from 'next/server';
import { resolveWorkspaceRawNoAuthFromId } from '@/lib/workspace';
import { auth } from '@/lib/auth';
import * as crypto from 'node:crypto';
import { env } from '@/env';
import { cookies } from 'next/headers';

async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.redirect('/login');
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspace');
    if (!workspaceId) {
        return new Response('Not Found', { status: 404 });
    }

    const result = await resolveWorkspaceRawNoAuthFromId(
        session.user.id,
        session.user.role,
        workspaceId
    );
    if (result instanceof NextResponse) {
        return result;
    }

    const { role } = result;

    if (role !== 'ADMIN') return new Response('Forbidden', { status: 403 });

    const state = crypto.randomBytes(32).toString('hex');

    const cookieStore = await cookies();

    cookieStore.set('withings_oauth_state', state, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        path: '/api/withings/callback',
        maxAge: 60 * 5, // 5 minutes
    });

    cookieStore.set('withings_oauth_workspace', workspaceId, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        path: '/api/withings/callback',
        maxAge: 60 * 5, // 5 minutes
    });

    const authUrl = await getWithingsAuthUrl(state);
    return NextResponse.redirect(authUrl);
}

export { GET };
