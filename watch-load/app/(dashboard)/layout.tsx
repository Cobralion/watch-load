import { AppSidebar } from '@/components/app-sidebar';
import Profile from '@/components/profile';
import { Separator } from '@/components/ui/separator';
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { listSidebarItems } from '@/actions/sidebar';
import { SessionProvider } from 'next-auth/react';

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const result = await listSidebarItems();
    const workspaces = result?.data ?? [];

    return (
        <SessionProvider>
            <SidebarProvider
                style={
                    {
                        '--sidebar-width': '19rem',
                    } as React.CSSProperties
                }
            >
                <AppSidebar workspaces={workspaces} />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                        />
                        <Link
                            href="/dashboard"
                            className="text-primary cursor-pointer text-lg font-semibold tracking-tight select-none"
                        >
                            WATCH LOAD
                        </Link>
                        <div className="flex-1" />
                        <Profile />
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </SessionProvider>
    );
}
