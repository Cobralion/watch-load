import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogState } from '@/types/dialog/dialog-state';
import { EcgData } from '@/components/dashboard/ecg-data-table';
import { create } from 'zustand';
import { useEffect, useState, useTransition } from 'react';
import { editTrailsId } from '@/actions/heart';
import { FORMAT_DATE } from '@/lib/utils';
import { TrailsChangeActionState } from '@/types/action-states';

export const useTrailsDialogState = create<DialogState<EcgData>>((set) => ({
    isOpen: false,
    toggleModal: () =>
        set((state: DialogState<EcgData>) => ({ isOpen: !state.isOpen })),
    data: null,
    setData: (data: EcgData) => set(() => ({ data: data })),
}));

export default function EditTrailsDialog(
    props: Pick<DialogState<EcgData>, 'isOpen' | 'data' | 'toggleModal'>
) {
    const [trailsId, setTrailsId] = useState<string>(
        props.data?.trailsId ?? ''
    );
    const [error, setError] = useState<TrailsChangeActionState | null>(null);

    const [saveTransition, startSaveTransition] = useTransition();

    const handleSave = async () => {
        startSaveTransition(async () => {
            const data = { ...props.data!, trailsId: trailsId }; // TODO: check that data is not null
            if (trailsId === props.data?.trailsId) {
                props.toggleModal();
                return;
            }

            const result = await editTrailsId(data);
            if (!result.success) {
                setError(result);
                return;
            }
            props.toggleModal();
        });
    };

    return (
        <Dialog open={props.isOpen} onOpenChange={props.toggleModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit trails ID</DialogTitle>
                    <DialogDescription>
                        Edit the trails ID for the ECG measurement from
                        <span>
                            {' '}
                            {FORMAT_DATE.format(props.data?.createdAt)}
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Trails ID
                        </Label>
                        <Input
                            id="name"
                            defaultValue={trailsId}
                            onChange={(e) => setTrailsId(e.target.value)}
                            className="col-span-3"
                            aria-invalid={error ? 'true' : 'false'}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <div className={"flex flex-col gap-2 w-full"}>
                        {error && (
                            <div
                                className={`rounded-md p-4 ${
                                    error.success
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                <p className="text-sm">{error.message}</p>
                            </div>
                        )}
                        <Button
                            className="cursor-pointer"
                            type="submit"
                            onClick={() => handleSave()}
                        >
                            {saveTransition ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
