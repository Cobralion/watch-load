import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import {
    InvalidCredentialsError,
    ResetCredentialsError,
    ServerCredentialsError,
} from '@/types/errors';
import { verifyCredentials } from '@/lib/auth-credentials';
import { env } from '@/env';

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: env.NODE_ENV !== 'production',
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                username: {},
                password: {},
            },
            authorize: authorize,
        }),
    ],
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.username = user.username;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string; // TODO: make typesafe
                session.user.username = token.username as string;
            }
            return session;
        },
    },
});

async function authorize(
    credentials: Partial<Record<'username' | 'password', unknown>>
): Promise<User | null> {
    if (!credentials) {
        console.error('[AUTH] No credentials provided');
        throw new InvalidCredentialsError();
    }
    const { username, password } = credentials as {
        username: string;
        password: string;
    };

    if (!username || !password) {
        console.error('[AUTH] Missing username or password');
        throw new InvalidCredentialsError();
    }

    let result;
    try {
        result = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });
    } catch (error) {
        console.error('[AUTH] Database error during authentication: ', error);
        throw new ServerCredentialsError();
    }

    try {
        const user = await verifyCredentials(password, result);
        return {
            id: user.id,
            name: user.name,
            role: user.role,
            username: user.username,
        };
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            console.error('[AUTH] Invalid credentials');
            throw error;
        }
        if (error instanceof ResetCredentialsError) {
            console.error('[AUTH] User must reset password');
            throw error;
        }
        throw error;
    }
}
