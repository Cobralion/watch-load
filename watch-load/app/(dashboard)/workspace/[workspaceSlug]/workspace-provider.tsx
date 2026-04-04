'use client';
import { createContext, useContext, ReactNode } from 'react';
import { WorkspaceContext } from '@/types/workspace';


const Context = createContext<WorkspaceContext | null>(null);

export function WorkspaceProvider({
    workspace,
    role,
    isGlobalAdmin,
    children,
}: WorkspaceContext & { children: ReactNode }) {

    return (<Context.Provider value={{workspace, role, isGlobalAdmin}}>{children}</Context.Provider>);
}

export function useWorkspace() {
    const context = useContext(Context);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}