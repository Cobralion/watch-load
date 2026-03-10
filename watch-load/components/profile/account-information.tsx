'use client';
import { User } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';

export default function AccountInformation() {
  return (
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

      <CardContent className="space-y-4 px-5 pb-5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-xs font-medium text-neutral-600"
          >
            Full Name
          </Label>
          <Input id="name" defaultValue="Jane Doe" disabled/>
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
          <Label className="text-xs font-medium text-neutral-600">Role</Label>
          <div className="flex h-9 cursor-not-allowed items-center gap-2 rounded-md border px-3">
            <Badge className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 select-none hover:bg-green-100">
              admin
            </Badge>
          </div>
          <p className="text-[11px] text-neutral-400">
            Role is managed by your organization admin.
          </p>
        </div>

        <div className="flex justify-start pt-1">
          <Button className="cursor-pointer">Save changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
