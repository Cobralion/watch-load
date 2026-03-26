import { CredentialsSignin } from 'next-auth';

class InvalidCredentialsError extends CredentialsSignin {
    code = 'invalid_credentials';
}

class ServerCredentialsError extends CredentialsSignin {
    code = 'server_error';
}

class EncryptionError extends Error {}

class RefreshTokenError extends Error {
    constructor(message?: string) {
        super(`Failed to refresh token: ${message}`);
    }
}

class HeartListError extends Error {
    constructor(message?: string) {
        super(`Failed to list ECGs: ${message}`);
    }
}

class HeartGetError extends Error {
    constructor(message?: string) {
        super(`Failed to get ECG: ${message}`);
    }
}

class SyncHeartError extends Error {
    constructor(message?: string) {
        super(`Failed to sync ECGs: ${message}`);
    }
}

export {
    InvalidCredentialsError,
    ServerCredentialsError,
    EncryptionError,
    RefreshTokenError,
    HeartListError,
    HeartGetError,
    SyncHeartError,
};
