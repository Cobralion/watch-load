import { getWithingsAuthUrl } from '@/lib/withings/oauth';
import { NextRequest, NextResponse } from 'next/server';
import { resolveWorkspaceRawNoAuthFromId } from '@/lib/workspace';
import { auth } from '@/lib/auth';

// TODO: to action
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

    const authUrl = await getWithingsAuthUrl(workspaceId, session.user.id);
    return NextResponse.redirect(authUrl);
}

export { GET };
