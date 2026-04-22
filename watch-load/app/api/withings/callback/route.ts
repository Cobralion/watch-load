import { NextRequest, NextResponse } from 'next/server';
import { handleWithingsCallback } from '@/lib/withings/oauth';
import { auth } from '@/lib/auth';
import { StatusActionError } from '@/types/errors';

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.redirect(new URL(`/login`, req.url));
    }

    const error = req.nextUrl.searchParams.get('error');
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');

    if (error) {
        // TODO: redirect the user to the connect site and show them the error
        return new Response(`A error occurred while authenticating: ${error}`, { status: 400 });
    }

    if (!code || !state) {
        return new Response('Bad Request', { status: 400 });
    }

    let slug: string;
    try {
        slug = await handleWithingsCallback(code, state);
    } catch (error) {
        if(error instanceof StatusActionError) {
            if(error.status === 401) {
                return NextResponse.redirect(new URL(`/login`, req.url));
            }
            return new Response(error.message, { status: error.status });
        }
        return new Response('Internal Server Error', { status: 500 });
    }

    return NextResponse.redirect(
        new URL(`/workspace/${slug}/connected-devices`, req.url)
    );
}
