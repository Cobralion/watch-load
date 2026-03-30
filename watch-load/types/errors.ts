import { CredentialsSignin } from 'next-auth';

class InvalidCredentialsError extends CredentialsSignin {
    code = 'invalid_credentials';
}

class ServerCredentialsError extends CredentialsSignin {
    code = 'server_error';
}

class EncryptionError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'EncryptionError';
    }
}

class RefreshTokenError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'RefreshTokenError';
    }
}

class HeartListError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'HeartListError';
    }
}

class HeartGetError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'HeartGetError';
    }
}

class SyncHeartError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'SyncHeartError';
    }
}
class APIFetchError extends SyncHeartError {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'APIFetchError';
    }
}

class NoAccessTokenError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'NoAccessTokenError';
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
    APIFetchError,
    NoAccessTokenError,
};
