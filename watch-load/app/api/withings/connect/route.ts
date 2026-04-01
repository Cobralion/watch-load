import { auth } from '@/lib/auth';
import { getWithingsAuthUrl } from '@/lib/withings/oauth';
import { NextResponse } from 'next/server';

async function GET() {
    const session = await auth();
    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    // TODO: get the workspace id from the query params, check if user is allowed to access the workspace, then pass it to the getWithingsAuthUrl function
    const userId = session.user.id;
    const authUrl = await getWithingsAuthUrl(workspaceId);

    return NextResponse.redirect(authUrl);
}

export { GET };
