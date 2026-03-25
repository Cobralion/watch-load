import { env } from '@/env/server';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { EncryptionError } from '@/types/encryption-error';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export function encryptToken(token: string): string {
    const key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
    if (!key || key.length !== 32) {
        throw new EncryptionError(
            'Encryption key must be a 32-byte hex string!'
        );
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(payload: string): string {
    const key = Buffer.from(env.ENCRYPTION_KEY!, 'hex');
    if (!key || key.length !== 32) {
        throw new EncryptionError(
            'Encryption key must be a 32-byte hex string!'
        );
    }

    const parts = payload.split(':');
    if (parts.length !== 3)
        throw new EncryptionError('Invalid payload format.');

    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8'); // Will throw if Auth Tag validation fails

    return decrypted;
}
