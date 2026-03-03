import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "mmuster" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: unknown, req: unknown) {
  
        // TODO: Add logic
        return null;
      }
    }),
    // ...add more providers here
  ],
};

export default NextAuth(authOptions);

