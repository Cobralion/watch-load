import { auth } from '@/lib/auth';
import { getWithingsAuthUrl } from '@/lib/withings/oauth';
import { NextResponse } from 'next/server';

async function GET() {
    const session = await auth();
    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const authUrl = await getWithingsAuthUrl(userId); // TODO: remove demo mode when ready

    return NextResponse.redirect(authUrl);
}

export { GET };
