import crypto from 'crypto';

type Signature = {
    nonce: string;
    signature: string;
};

async function createNonce(): Promise<string | null> {
    const action: string = 'getnonce';
    const client_id = process.env.WITHINGS_CLIENT_ID || '';
    const timestamp: string = Date.now().toString();
    const data = `${action},${client_id},${timestamp}`;

    const signature = crypto
        .createHmac('sha256', process.env.WITHINGS_CLIENT_SECRET!)
        .update(data)
        .digest('hex');

    const response = await fetch('https://wbsapi.withings.net/v2/signature', {
        method: 'POST',
        body: new URLSearchParams({
            action,
            client_id,
            timestamp,
            signature,
        }),
    });

    if (!response.ok) {
        return null;
    }
    const { status, body } = await response.json();
    if (status !== 0) {
        return null;
    }
    return body.nonce;
}

async function createSignature(action: string): Promise<Signature> {
    const clientId = process.env.WITHINGS_CLIENT_ID;

    const nonce = await createNonce();
    if (!nonce) {
        throw Error("Can't create a nonce");
    }
    const data = `${action},${clientId},${nonce}`;

    const signature = crypto
        .createHmac('sha256', process.env.WITHINGS_CLIENT_SECRET!)
        .update(data)
        .digest('hex');

    return { nonce, signature };
}
