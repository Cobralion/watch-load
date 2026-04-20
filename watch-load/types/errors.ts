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
class APIFetchError extends Error {
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

class WorkspaceError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'WorkspaceError';
        this.status = status;
    }
}

class ActionError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'ActionError';
    }
}

class NotFoundError extends ActionError {
    constructor(resource: string) {
        super(`${resource} not found`);
        this.name = 'NotFoundError';
    }
}

class UnauthorizedError extends ActionError {
    constructor() {
        super('You are not authorized to perform this action');
        this.name = 'UnauthorizedError';
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
    WorkspaceError,
    ActionError,
    NotFoundError,
    UnauthorizedError,
};
