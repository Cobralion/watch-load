import bcrypt from 'bcryptjs';
import {
    InvalidCredentialsError,
    ResetCredentialsError,
} from '@/types/errors';
import type { GlobalRole } from '@/generated/prisma/enums';

/**
 * Precomputed bcrypt hash (cost 12) used when no valid password is available,
 * so login always runs a password comparison and mitigates user enumeration via timing.
 */
export const DUMMY_PASSWORD_HASH =
    '$2b$12$elBFtxOvcA29f4AGccAVZO1Ll.ZKzhXKvM8rgAvXZHKzdcZLsNAWe';

export type AuthUserRecord = {
    id: string;
    name: string | null;
    username: string;
    password: string | null;
    role: GlobalRole;
    resetToken: string | null;
};

export async function verifyCredentials(
    password: string,
    user: AuthUserRecord | null
): Promise<AuthUserRecord> {
    const hash =
        user?.password && !user.resetToken
            ? user.password
            : DUMMY_PASSWORD_HASH;

    const isMatch = await bcrypt.compare(password, hash);

    if (!user) {
        throw new InvalidCredentialsError();
    }

    if (!user.password || user.resetToken) {
        throw new ResetCredentialsError();
    }

    if (!isMatch) {
        throw new InvalidCredentialsError();
    }

    return user;
}
