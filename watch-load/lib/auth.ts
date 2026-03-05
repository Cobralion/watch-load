import NextAuth, { CredentialsSignin, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { InvalidCredentialsError, ServerCredentialsError } from '@/types/auth-errors';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user: User | null = null;

        CredentialsSignin;

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

        let result: any;
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

        if(!result) {
          console.error('[AUTH] User not found: ', username);
          throw new InvalidCredentialsError();
        }

        const isMatch = await bcrypt.compare(password, result.password);
        if(!isMatch) {
          console.error('[AUTH] Wrong password for ', username);
          throw new InvalidCredentialsError();
        }

        return {
          id: result.id,
          name: result.name
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
  },
});
