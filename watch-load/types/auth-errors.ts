import { CredentialsSignin } from 'next-auth';

class InvalidCredentialsError extends CredentialsSignin {
    code = 'invalid_credentials';
}

class ServerCredentialsError extends CredentialsSignin {
    code = 'server_error';
}

export { InvalidCredentialsError, ServerCredentialsError };
