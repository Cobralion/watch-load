import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            role: string;
            username: string;
            id: string;
        } & DefaultSession['user'];
    }

    interface User {
        username: string;
        role: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        username: string;
        role: string;
        id: string;
    }
}
