'use client';

import * as React from 'react';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Watch } from 'lucide-react';
import { APPLICATION_NAME, APPLICATION_VERSION } from '@/constants/constants';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

type Workspace = {
    id: string;
    name: string;
    description: string | null;
    slug: string;
    showProtected: boolean;
};

export function AppSidebar({
    workspaces,
    ...props
}: React.ComponentProps<typeof Sidebar> & { workspaces: Workspace[] }) {
    const { data } = useSession();
    const pathname = usePathname();

    return (
        <Sidebar variant="floating" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <div>
                                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Watch className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-medium">
                                        {APPLICATION_NAME}
                                    </span>
                                    <span className="">
                                        {APPLICATION_VERSION}
                                    </span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu className="gap-2">
                        <SidebarMenuItem key="dashboard">
                            <SidebarMenuButton asChild>
                                <a href="/dashboard" className="font-medium">
                                    Dashboard
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    {(data?.user?.role === 'ADMIN') && (
                        <SidebarMenu className="gap-2">
                            <SidebarMenuItem key="admin">
                                <SidebarMenuButton asChild>
                                    <a href="/admin" className="font-medium">
                                        Admin Panel
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    )}
                </SidebarGroup>

                {workspaces.map((ws) => (
                    <SidebarGroup key={ws.id} className="pt-0 pb-2">
                        <SidebarGroupLabel>{ws.name}</SidebarGroupLabel>
                        <SidebarMenu className="gap-1">
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={pathname.startsWith(
                                        `/workspace/${ws.slug}`
                                    )}
                                >
                                    <a href={`/workspace/${ws.slug}`}>
                                        <span>Workspace</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>

                            {ws.showProtected && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(
                                            `/workspace/${ws.slug}/connected-devices`
                                        )}
                                    >
                                        <a
                                            href={`/workspace/${ws.slug}/connected-devices`}
                                        >
                                            <span>Connected Devices</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}

                            {ws.showProtected && (
                                <SidebarMenuItem>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname.startsWith(
                                            `/workspace/${ws.slug}/settings`
                                        )}
                                    >
                                        <a
                                            href={`/workspace/${ws.slug}/settings`}
                                        >
                                            <span>Settings</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
