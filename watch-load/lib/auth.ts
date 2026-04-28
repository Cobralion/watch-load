import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import {
    InvalidCredentialsError,
    ResetCredentialsError,
    ServerCredentialsError,
} from '@/types/errors';
import bcrypt from 'bcryptjs';
import { RequiredRole } from '@/lib/safe-action';
import { env } from '@/env';
import { GlobalRole } from '@/generated/prisma/enums';

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
    credentials: Partial<Record<'username' | 'password', unknown>>,
    request: Request
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

    let result: {
        id: string;
        username: string;
        password: string | null;
        role: GlobalRole;
        name: string | null;
        resetToken: string | null;
        resetTokenExpiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
    } | null = null;
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

    if (!result) {
        console.error('[AUTH] Invalid credentials - user not found');
        throw new InvalidCredentialsError();
    }

    if(!result.password || result.resetToken) {
        console.error('[AUTH] User must reset password.');
        throw new ResetCredentialsError();
    }

    // TODO: compare against dummy if user is not found for security
    const isMatch = await bcrypt.compare(password, result.password);
    if (!isMatch) {
        console.error('[AUTH] Invalid credentials - wrong password');
        throw new InvalidCredentialsError();
    }

    return {
        id: result.id,
        name: result.name,
        role: result.role,
        username: username,
    };
}
