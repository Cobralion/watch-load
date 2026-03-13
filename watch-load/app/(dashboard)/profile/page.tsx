import { Separator } from '@/components/ui/separator';
import { SessionProvider } from 'next-auth/react';
import AccountInformation from '@/components/profile/account-information';
import ChangePassword from '@/components/profile/change-password';

export default function ProfilePage() {
    return (
        <div className="flex min-h-screen items-start justify-center">
            <div className="w-full max-w-lg space-y-6">
                {/* Page title */}
                <div>
                    <h1 className="text-2xl font-semibold">Profile</h1>
                    <p className="mt-1 text-sm">
                        Manage your account settings and change your password.
                    </p>
                </div>

                <Separator className="bg-neutral-200" />

                {/* Account Information */}
                <SessionProvider>
                    <AccountInformation />
                    <ChangePassword />
                </SessionProvider>
            </div>
        </div>
    );
}
