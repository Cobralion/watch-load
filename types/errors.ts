import { CredentialsSignin } from 'next-auth';

class InvalidCredentialsError extends CredentialsSignin {
    code = 'invalid_credentials';
}

class ServerCredentialsError extends CredentialsSignin {
    code = 'server_error';
}

class ResetCredentialsError extends CredentialsSignin {
    code = 'reset_error';
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

abstract class StatusActionError extends ActionError {
    status: number;
    constructor(
        name: string,
        status: number,
        message: string,
        options?: ErrorOptions
    ) {
        super(message, options);
        this.name = name;
        this.status = status;
    }
}

class NotFoundError extends StatusActionError {
    constructor() {
        super('NotFoundError', 404, 'Not Found');
    }
}

class UnauthorizedError extends StatusActionError {
    constructor() {
        super('UnauthorizedError', 401, 'Unauthorized');
    }
}

class ForbiddenError extends StatusActionError {
    constructor() {
        super('ForbiddenError', 403, 'Forbidden');
    }
}

class BadRequestError extends StatusActionError {
    constructor() {
        super('BadRequestError', 400, 'Bad request');
    }
}

class BadGatewayError extends StatusActionError {
    constructor() {
        super('BadGatewayError', 502, 'Bad Gateway');
    }
}

class InternalServerError extends StatusActionError {
    constructor() {
        super('InternalServerError', 500, 'Internal Server Error');
    }
}

export {
    InvalidCredentialsError,
    ServerCredentialsError,
    ResetCredentialsError,
    EncryptionError,
    RefreshTokenError,
    HeartListError,
    HeartGetError,
    SyncHeartError,
    APIFetchError,
    NoAccessTokenError,
    WorkspaceError,
    ActionError,
    StatusActionError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    BadRequestError,
    BadGatewayError,
    InternalServerError,
};
