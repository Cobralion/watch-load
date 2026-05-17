'use client';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { LocationOption } from '@/types/workspace';
import { useOptimisticAction } from 'next-safe-action/hooks';
import { editLocation } from '@/actions/heart';
import { toast } from 'sonner';

interface Props {
    id: string;
    workspaceId: string;
    locationId?: string;
    possibleWorkspaceLocations: LocationOption[];
}

export default function LocationSelect({
    id,
    workspaceId,
    locationId,
    possibleWorkspaceLocations,
}: Props) {
    const { execute, optimisticState, isExecuting } = useOptimisticAction(
        editLocation,
        {
            // The current server state
            currentState: locationId,
            updateFn: (currentValue, input) => {
                return input.locationId;
            },
            onSuccess: ({ data }) => {
                toast.success(`Location for ${data.id} successfully updated.`, {
                    position: 'top-right',
                });
            },
            onError: () => {
                toast.error(`Updating location failed.`, {
                    position: 'top-right',
                });
            },
        }
    );

    return (
        <Select
            value={optimisticState}
            onValueChange={(value) =>
                execute({ id, workspaceId, locationId: value })
            }
            disabled={isExecuting}
        >
            <SelectTrigger className="w-full max-w-48">
                <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {possibleWorkspaceLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                            {location.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
