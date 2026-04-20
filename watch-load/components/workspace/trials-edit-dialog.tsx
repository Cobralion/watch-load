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
import { EcgData } from '@/components/workspace/ecg-data-columns';
import { create } from 'zustand';
import { useState } from 'react';
import { editTrialsId } from '@/actions/heart';
import { FORMAT_DATE } from '@/lib/utils';
import { useAction } from 'next-safe-action/hooks';
import { useWorkspace } from '@/app/(dashboard)/workspace/[workspaceSlug]/workspace-provider';
import { toast } from 'sonner';

export const useTrialsDialogState = create<DialogState<EcgData>>((set) => ({
    isOpen: false,
    toggleModal: () =>
        set((state: DialogState<EcgData>) => ({ isOpen: !state.isOpen })),
    data: null,
    setData: (data: EcgData) => set(() => ({ data: data })),
}));

export default function EditTrailsDialog(
    props: Pick<DialogState<EcgData>, 'isOpen' | 'data' | 'toggleModal'>
) {
    const [trialsId, setTrialsId] = useState<string>(
        props.data?.trialsId ?? ''
    );
    const workspace = useWorkspace();
    // const [error, setError] = useState<TrailsChangeActionState | null>(null);
    //
    // const [saveTransition, startSaveTransition] = useTransition();
    //
    // const handleSave = async () => {
    //     startSaveTransition(async () => {
    //         const data = { ...props.data!, trailsId: trailsId }; // TODO: check that data is not null
    //         if (trailsId === props.data?.trailsId) {
    //             props.toggleModal();
    //             return;
    //         }
    //
    //         const result = await editTrailsId(data);
    //         if (!result.success) {
    //             setError(result);
    //             return;
    //         }
    //         props.toggleModal();
    //     });
    // };

    const { execute, result, isExecuting } = useAction(editTrialsId, {
        onSuccess: () => {
            props.toggleModal();
        },
        onError: ({ error }) => {
            if (error.serverError) {
                toast.error(error.serverError, { position: 'top-right' });
            }

            if (error.validationErrors) {
                error.validationErrors.trialsId?._errors?.forEach((err) =>
                    toast.error(err, { position: 'top-right' })
                );
            }
        },
    });

    return (
        <Dialog open={props.isOpen} onOpenChange={props.toggleModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit trials ID</DialogTitle>
                    <DialogDescription>
                        Edit the trials ID for the ECG measurement from
                        <span>
                            {' '}
                            {FORMAT_DATE.format(props.data?.timestamp)}
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Trials ID
                        </Label>
                        <Input
                            id="name"
                            defaultValue={trialsId}
                            onChange={(e) => setTrialsId(e.target.value)}
                            className="col-span-3"
                            aria-invalid={result.serverError ? 'true' : 'false'}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <div className={'flex w-full flex-col gap-2'}>
                        {result.serverError && (
                            <div
                                className={`rounded-md p-4 ${
                                    !result.serverError
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                <p className="text-sm">{result.serverError}</p>
                            </div>
                        )}
                        <Button
                            className="cursor-pointer"
                            type="submit"
                            onClick={() =>
                                execute({
                                    trialsId: trialsId,
                                    id: props.data!.id,
                                    workspaceId: workspace.workspace.id,
                                })
                            }
                        >
                            {isExecuting ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
