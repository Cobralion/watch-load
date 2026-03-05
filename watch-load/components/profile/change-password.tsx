'use client';
import { Eye, Lock } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ChangePassword() {
  return (
    <Card>
      <CardHeader className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-neutral-400" />
          <CardTitle>Change Password</CardTitle>
        </div>
        <CardDescription>
          Leave blank if you don&apos;t want to change your password.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5">
        {[
          { id: 'current-password', label: 'Current Password' },
          { id: 'new-password', label: 'New Password' },
          { id: 'confirm-password', label: 'Confirm New Password' },
        ].map(({ id, label }) => (
          <div key={id} className="space-y-1.5">
            <Label
              htmlFor={id}
              className="text-xs font-medium text-neutral-600"
            >
              {label}
            </Label>
            <div className="relative">
              <Input id={id} type="password" />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-600"
                tabIndex={-1}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
