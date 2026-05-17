export async function register() {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;

    const proxyUrl =
        process.env.HTTPS_PROXY ||
        process.env.https_proxy ||
        process.env.HTTP_PROXY ||
        process.env.http_proxy;

    if (!proxyUrl) {
        console.log('[instrumentation] No proxy configured');
        return;
    }

    const { ProxyAgent, setGlobalDispatcher } = await import('undici');

    setGlobalDispatcher(new ProxyAgent(proxyUrl));

    const noProxy = process.env.NO_PROXY || process.env.no_proxy || '(none)';
    console.log(`[instrumentation] HTTP proxy enabled: ${proxyUrl}`);
    console.log(`[instrumentation] NO_PROXY: ${noProxy}`);
}
