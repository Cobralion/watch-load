'use client';

import { Eye, EyeOff, User, Lock } from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import { ProfileFormData, profileSchema } from '@/lib/validations/profile';
import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useSession } from 'next-auth/react';

export default function ProfileSettings() {
    const { data: sessionData } = useSession();

    const [showPasswords, setShowPasswords] = useState({
        'current-password': false,
        'new-password': false,
        'confirm-password': false,
    });

    const togglePassword = (id: string) =>
        setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: standardSchemaResolver(profileSchema),
        defaultValues: {
            name: sessionData?.user?.name || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    return (
        <>
            <Card>
                {/* Header */}
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-neutral-400" />
                        <CardTitle>Account Information</CardTitle>
                    </div>
                    <CardDescription>
                        Update your username and display name.
                    </CardDescription>
                </CardHeader>

                {/* Account Information */}
                <CardContent className="space-y-4 px-5 pb-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <Label
                            htmlFor="name"
                            className="text-xs font-medium text-neutral-600"
                        >
                            Full Name
                        </Label>
                        <Input id="name" defaultValue="Jane Doe" />
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-neutral-600">
                            Username
                        </Label>
                        <div className="flex h-9 cursor-not-allowed items-center gap-2 rounded-md border px-3 text-neutral-400 select-none">
                            jdoe
                        </div>
                        <p className="text-[11px] text-neutral-400">
                            Username is managed by your organization admin.
                        </p>
                    </div>

                    {/* Role */}
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-neutral-600">
                            Role
                        </Label>
                        <div className="flex h-9 cursor-not-allowed items-center gap-2 rounded-md border px-3">
                            <Badge className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 select-none hover:bg-green-100">
                                admin
                            </Badge>
                        </div>
                        <p className="text-[11px] text-neutral-400">
                            Role is managed by your organization admin.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader className="px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-neutral-400" />
                        <CardTitle>Change Password</CardTitle>
                    </div>
                    <CardDescription>
                        Leave blank if you don&apos;t want to change your
                        password.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-5 pb-5">
                    {[
                        { id: 'current-password', label: 'Current Password' },
                        { id: 'new-password', label: 'New Password' },
                        {
                            id: 'confirm-password',
                            label: 'Confirm New Password',
                        },
                    ].map(({ id, label }) => (
                        <div key={id} className="space-y-1.5">
                            <Label
                                htmlFor={id}
                                className="text-xs font-medium text-neutral-600"
                            >
                                {label}
                            </Label>
                            <div className="relative">
                                <Input
                                    id={id}
                                    type={
                                        showPasswords[id] ? 'text' : 'password'
                                    }
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                                    tabIndex={-1}
                                >
                                    {showPasswords[id] ? (
                                        <EyeOff
                                            onClick={() => togglePassword(id)}
                                            className="h-4 w-4 cursor-pointer"
                                        />
                                    ) : (
                                        <Eye
                                            onClick={() => togglePassword(id)}
                                            className="h-4 w-4 cursor-pointer"
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Save button */}
            <div className="flex justify-end pt-1">
                <Button className="cursor-pointer">Save changes</Button>
            </div>
        </>
    );
}
