import * as jose from 'jose';

export async function getWithingsAuthUrl(
    userId: string,
    mode: 'demo' | '' = ''
) {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.WITHINGS_CLIENT_ID!,
        redirect_uri: process.env.WITHINGS_REDIRECT_URI!,
        scope: 'user.metrics,user.activity',
        state: await createStateJWT(userId),
        mode: mode,
    });

    return `https://account.withings.com/oauth2_user/authorize2?${params.toString()}`;
}

export async function createStateJWT(userId: string): Promise<string> {
    const secret = new TextEncoder().encode(process.env.APP_SECRET!);
    const alg = 'HS256';
    const data = { userId: userId };

    const jwt = await new jose.SignJWT(data)
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setIssuer(process.env.APP_ISSUER!)
        .setAudience(process.env.APP_AUDIENCE!)
        .setExpirationTime('5min')
        .sign(secret);

    console.log('Generated JWT:', jwt);

    return jwt;
}

export async function verifyStateJWT(jwt: string): Promise<string | null> {
    const secret = new TextEncoder().encode(process.env.APP_SECRET!);

    try {
        const { payload } = await jose.jwtVerify(jwt, secret, {
            issuer: process.env.APP_ISSUER!,
            audience: process.env.APP_AUDIENCE!,
        });

        return payload.userId as string;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}
