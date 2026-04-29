'use client';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { WorkspaceContext } from '@/types/resolvedWorkspace';

const Context = createContext<WorkspaceContext | null>(null);

export function WorkspaceProvider({
    workspace,
    role,
    isGlobalAdmin,
    children,
}: WorkspaceContext & { children: ReactNode }) {
    const contextValues = useMemo(
        () => ({ workspace, role, isGlobalAdmin }),
        [workspace, role, isGlobalAdmin]
    );

    return (
        <Context.Provider value={contextValues}>{children}</Context.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(Context);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
