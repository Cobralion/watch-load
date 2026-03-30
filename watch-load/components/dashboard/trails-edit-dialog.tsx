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
    return (
        <Dialog open={props.isOpen} onOpenChange={props.toggleModal}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {props.data == null ? 'Create' : 'Edit'} profile
                    </DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            defaultValue={props.data?.trailsId}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={() => props.toggleModal()}>
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
