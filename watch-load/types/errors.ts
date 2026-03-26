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

export {
    InvalidCredentialsError,
    ServerCredentialsError,
    EncryptionError,
    RefreshTokenError,
};
