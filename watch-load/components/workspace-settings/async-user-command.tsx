'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { searchUser } from '@/actions/workspace';
import {
    Command,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

export type User = { id: string; name: string; username: string };

interface AsyncUserSearchProps {
    selected: string | null;
    onChange: (selected: string | null) => void;
    workspaceId: string;
}

export function AsyncUserSearch({
    selected,
    onChange,
    workspaceId,
}: AsyncUserSearchProps) {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);

    const { execute, isExecuting, result } = useAction(searchUser, {
        onSuccess: ({ data }) => {
            if (data && data.length > 0) {
                setUsers(
                    data.map((u) => ({
                        id: u.id,
                        name: u.name ?? u.username,
                        username: u.username,
                    }))
                );
            }
        },
        onError: ({ error }) => {
            console.error('Search failed:', error.serverError);
            setUsers([]);
        },
    });

    useEffect(() => {
        if (query.trim() === '') {
            setUsers([]);
            return;
        }

        const timer = setTimeout(() => {
            // Execute the action with the type-safe payload
            execute({ workspaceId, query });
        }, 300);

        return () => clearTimeout(timer);
    }, [query, execute]);

    const toggleSelection = (userId: string) => {
        if (selected === userId) {
            onChange(null);
        } else {
            onChange(userId);
        }
    };

    return (
        <Command shouldFilter={false} className="rounded-lg border shadow-md">
            <CommandInput
                placeholder="Search by name or username..."
                value={query}
                onValueChange={setQuery}
            />

            <CommandList>
                {isExecuting && (
                    <div className="text-muted-foreground p-4 text-center text-sm">
                        Searching network...
                    </div>
                )}

                {result.serverError && !isExecuting && (
                    <div className="text-destructive p-4 text-center text-sm">
                        {result.serverError}
                    </div>
                )}

                {!isExecuting &&
                    !result.serverError &&
                    users.length === 0 &&
                    query.trim() !== '' && (
                        <CommandEmpty>
                            No users found matching {query}.
                        </CommandEmpty>
                    )}

                {!isExecuting && users.length > 0 && (
                    <CommandGroup heading="Results">
                        {users.map((user) => (
                            <CommandItem
                                key={user.id}
                                onSelect={() => toggleSelection(user.id)}
                            >
                                <div
                                    className={cn(
                                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                                        selected && selected === user.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'opacity-50 [&_svg]:invisible'
                                    )}
                                >
                                    <Check className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span>{user.name}</span>
                                    <span className="text-muted-foreground text-xs">
                                        {user.username}
                                    </span>
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </Command>
    );
}
