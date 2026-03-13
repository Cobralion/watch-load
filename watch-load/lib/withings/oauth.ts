export function getWithingsAuthUrl(userId: string, mode: 'demo' | '' = '') {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.WITHINGS_CLIENT_ID!,
        redirect_uri: process.env.WITHINGS_REDIRECT_URI!,
        scope: 'user.metrics,user.activity',
        state: userId,
        mode: mode,
    });

    return `https://account.withings.com/oauth2_user/authorize2?${params.toString()}`;
}
