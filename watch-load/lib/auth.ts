import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import {
    InvalidCredentialsError,
    ServerCredentialsError,
} from '@/types/errors';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    debug: true, // TODO: change to false in production
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                username: {},
                password: {},
            },
            authorize: async (credentials) => {
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
                    name: string | null;
                    username: string;
                    password: string;
                    role: string;
                } | null = null;
                try {
                    result = await prisma.user.findUnique({
                        where: {
                            username: username,
                        },
                    });
                } catch (error) {
                    console.error(
                        '[AUTH] Database error during authentication: ',
                        error
                    );
                    throw new ServerCredentialsError();
                }

                if (!result) {
                    console.error(
                        '[AUTH] Invalid credentials - user not found'
                    );
                    throw new InvalidCredentialsError();
                }

                // TODO: compare against dummy if user is not found for security
                const isMatch = await bcrypt.compare(password, result.password);
                if (!isMatch) {
                    console.error(
                        '[AUTH] Invalid credentials - wrong password'
                    );
                    throw new InvalidCredentialsError();
                }

                return {
                    id: result.id,
                    name: result.name,
                    role: result.role,
                    username: username,
                };
            },
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
                session.user.role = token.role as string;
                session.user.username = token.username as string;
            }
            return session;
        },
    },
});
