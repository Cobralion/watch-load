import { PasswordResetForm } from '@/components/password-reset-form';
import { prisma } from '@/lib/prisma';
import { sha256Hex } from '@/lib/utils';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
    // TODO: redesign error
    const error = (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <h1>Link is invalid!</h1>
            </div>
        </div>
    );

    let { username, reset_token } = await searchParams;

    if (!username || !reset_token) {
        return error;
    }

    username = Array.isArray(username) ? username[0] : username;
    reset_token = Array.isArray(reset_token) ? reset_token[0] : reset_token;

    const user = await prisma.user.findFirst({
        where: { username: username },
        select: { username: true, resetToken: true, resetTokenExpiresAt: true },
    });

    const reset_tokenHash = sha256Hex(reset_token);
    if (
        !user ||
        reset_tokenHash !== user.resetToken ||
        user.resetTokenExpiresAt < new Date()
    ) {
        return error;
    }

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <PasswordResetForm username={username} resetToken={reset_token} />
            </div>
        </div>
    );
}
