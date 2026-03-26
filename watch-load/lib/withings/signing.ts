import crypto from 'crypto';
import { env } from '@/env/server';
import { WITHINGS_SIGNATURE_URL } from '@/lib/withings/api-urls';

type Signature = {
    nonce: string;
    signature: string;
};

async function createNonce(): Promise<string> {
    const action: string = 'getnonce';
    const client_id = env.WITHINGS_CLIENT_ID || '';
    const timestamp: string = Math.floor(Date.now() / 1000).toString();
    const data = `${action},${client_id},${timestamp}`;

    const signature = crypto
        .createHmac('sha256', env.WITHINGS_CLIENT_SECRET)
        .update(data)
        .digest('hex');

    const response = await fetch(WITHINGS_SIGNATURE_URL, {
        method: 'POST',
        body: new URLSearchParams({
            action,
            client_id,
            timestamp,
            signature,
        }),
    });

    if (!response.ok) {
        throw Error('Could not create Nonce!');
    }
    const { status, body } = await response.json();
    if (status !== 0) {
        throw Error('Could not create Nonce!');
    }
    return body.nonce;
}

async function createSignature(action: string): Promise<Signature> {
    const clientId = env.WITHINGS_CLIENT_ID;
    const nonce = await createNonce();
    const data = `${action},${clientId},${nonce}`;

    const signature = crypto
        .createHmac('sha256', env.WITHINGS_CLIENT_SECRET)
        .update(data)
        .digest('hex');

    return { nonce, signature };
}

export { createSignature };
