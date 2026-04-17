import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from '@/components/ui/combobox';
import { WorkspaceUser } from '@/types/workspace';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
} from '@/components/ui/field';
import { Controller } from 'react-hook-form';
import { Fragment } from 'react';
import { WorkspaceUserWithRole } from '@/components/workspace/manage-workspace-card';

export default function MemberCombobox({
    label,
    description,
    fieldName,
    allUsers,
    currentUserId,
    lockedUser,
    form,
    errorField,
}: {
    label: string;
    description: string;
    fieldName: 'adminIds' | 'memberIds';
    allUsers: WorkspaceUserWithRole[];
    currentUserId: string;
    lockedUser?: WorkspaceUserWithRole;
    form: any;
    errorField: any;
}) {
    const anchor = useComboboxAnchor();
    const allUserById = new Map(allUsers.map((u) => [u.id, u]));
    const selectableUsers = allUsers.filter((u) => u.id !== currentUserId);
    const displayName = (u: WorkspaceUser) => u.username;

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            <FieldDescription>{description}</FieldDescription>
            <Controller
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                    <Combobox
                        multiple
                        autoHighlight
                        items={selectableUsers.map((u) => u.id)}
                        value={field.value}
                        onValueChange={field.onChange}
                    >
                        <ComboboxChips ref={anchor} className="w-full">
                            {lockedUser && (
                                <ComboboxChip
                                    key={lockedUser.id}
                                    className="pointer-events-none cursor-default opacity-75"
                                    // Render without a remove button by omitting onRemove
                                >
                                    {displayName(lockedUser)}
                                    <span className="ml-1 text-[10px] opacity-60">
                                        (you)
                                    </span>
                                </ComboboxChip>
                            )}
                            <ComboboxValue>
                                {(values: string[]) => (
                                    <Fragment>
                                        {values.map((id) => {
                                            const user = allUserById.get(id);
                                            if (!user) return null;
                                            return (
                                                <ComboboxChip key={id}>
                                                    {displayName(user)}
                                                </ComboboxChip>
                                            );
                                        })}
                                        <ComboboxChipsInput />
                                    </Fragment>
                                )}
                            </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent anchor={anchor}>
                            <ComboboxEmpty>No users found.</ComboboxEmpty>
                            <ComboboxList>
                                {(id: string) => {
                                    const user = allUserById.get(id);
                                    if (!user) return null;
                                    return (
                                        <ComboboxItem key={id} value={id}>
                                            <div className="flex flex-col">
                                                <span>{displayName(user)}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {user.name ??
                                                        'No name found.'}
                                                </span>
                                            </div>
                                        </ComboboxItem>
                                    );
                                }}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                )}
            />
            <FieldError errors={[errorField]} />
        </Field>
    );
}