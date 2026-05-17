import { ResetPasswordForm } from '@/components/reset-password-form';
import { prisma } from '@/lib/prisma';
import { sha256Hex } from '@/lib/utils';
import ResetPasswordError from '@/components/reset-password-error';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Page({ searchParams }: PageProps) {
    let { username, reset_token } = await searchParams;

    if (!username || !reset_token) {
        return (
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <ResetPasswordError message="Invalid reset link." />
                </div>
            </div>
        );
    }

    username = Array.isArray(username) ? username[0] : username;
    reset_token = Array.isArray(reset_token) ? reset_token[0] : reset_token;

    const hashedToken = sha256Hex(reset_token);
    const user = await prisma.user.findFirst({
        where: {
            username,
            resetToken: hashedToken,
            resetTokenExpiresAt: { gt: new Date() },
        },
        select: { id: true },
    });

    if (!user) {
        return (
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm">
                    <ResetPasswordError message="This reset link is invalid or has expired. Ask your administrator for a new one." />
                </div>
            </div>
        );
    }
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ResetPasswordForm
                    resetToken={reset_token}
                    username={username}
                />
            </div>
        </div>
    );
}
