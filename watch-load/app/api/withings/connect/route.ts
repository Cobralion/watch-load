'use server';

import { auth } from '@/lib/auth';
import { getWithingsAuthUrl } from '@/lib/withings/oauth';
import { redirect } from 'next/navigation';

async function GET() {
    const session = await auth();
    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const authUrl = getWithingsAuthUrl(userId, 'demo'); // TODO: remove demo mode when ready

    redirect(authUrl);
}

export { GET };
