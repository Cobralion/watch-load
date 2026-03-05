import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

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

        console.log('Auth authorize credentials: {}', credentials);

        if (credentials.username && credentials.username === 'admin') {
          user = { id: '1', name: 'Admin' };
        }
        return user;
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
