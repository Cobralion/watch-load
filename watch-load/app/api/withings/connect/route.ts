import { getWithingsAuthUrl } from '@/lib/withings/oauth';
import { NextRequest, NextResponse } from 'next/server';
import { resolveWorkspaceRaw } from '@/lib/workspace';

async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('workspace');
    if (!slug) {
        return new Response('Not Found', { status: 404 });
    }

    const result = await resolveWorkspaceRaw(slug); // TODO: use id instead of slug
    if('error' in result) {
        return new Response(result.error, { status: result.status });
    }
    const workspace = result.data;

    if(workspace.role !== 'ADMIN')
        return new Response('Forbidden', { status: 403 });

    const authUrl = await getWithingsAuthUrl(workspace.workspace.id, workspace.user.id);
    return NextResponse.redirect(authUrl);
}

export { GET };
