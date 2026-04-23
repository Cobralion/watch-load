import { NextRequest, NextResponse } from 'next/server';
import { handleWithingsCallback } from '@/lib/withings/oauth';
import { auth } from '@/lib/auth';
import { StatusActionError } from '@/types/errors';
import {
    resolveWorkspaceFromId,
} from '@/lib/workspace';
import {cookies} from "next/headers";

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
        return new Response(`A error occurred while authenticating: ${error}`, {
            status: 400,
        });
    }

    if (!code || !state) {
        return new Response('Bad Request', { status: 400 });
    }

    const cookieStore = await cookies();
    const originalState = cookieStore.get('withings_oauth_state')?.value;
    if (!originalState || originalState !== state) {
        console.error(
            `State mismatch in Withings OAuth callback. Potential CSRF attack detected.`
        );
        return new Response('Forbidden', { status: 403 });
    }
    req.cookies.delete('withings_oauth_state');

    const workspaceId = cookieStore.get('withings_oauth_workspace')?.value;
    if (!workspaceId) {
        console.error(`WorkspaceId cookie missing.`);
        return new Response('Bad Request', { status: 400 });
    }
    req.cookies.delete('withings_oauth_workspace');
    const {
        workspace: { slug },
        role,
    } = await resolveWorkspaceFromId(workspaceId);

    if (role !== 'ADMIN') {
        return new Response('Forbidden', { status: 403 });
    }

    try {
        await handleWithingsCallback(code, workspaceId);
    } catch (error) {
        if (error instanceof StatusActionError) {
            if (error.status === 401) {
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
