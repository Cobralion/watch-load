'use client';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FieldGroup,
    Field,
    FieldLabel,
    FieldError,
    FieldDescription,
} from '@/components/ui/field';
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
import { Input } from '@/components/ui/input';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { createWorkspaceSchema } from '@/lib/validations/dashboard';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { createWorkspace } from '@/actions/workspace';
import { toast } from 'sonner';
import { Fragment } from 'react';
import { Controller } from 'react-hook-form';

type WorkspaceUser = {
    id: string;
    name: string | null;
    username: string;
};

type Props = {
    users: WorkspaceUser[];
};

// TODO: add red alrial filed on error
export default function NewWorkspaceCard({ users }: Props) {
    const anchor = useComboboxAnchor();
    const { form, action, handleSubmitWithAction, resetFormAndAction } =
        useHookFormAction(
            createWorkspace,
            standardSchemaResolver(createWorkspaceSchema),
            {
                formProps: {
                    defaultValues: {
                        name: '',
                        description: '',
                        slug: '',
                        memberIds: [],
                    },
                },
                actionProps: {
                    onSuccess: ({ data }) => {
                        toast.success(
                            `Successfully created workspace: ${data.workspace.name} at /${data.workspace.slug}`,
                            { position: 'top-right' }
                        );
                        resetFormAndAction();
                    },
                },
            }
        );

    const userById = new Map(users.map((u) => [u.id, u]));
    const displayName = (u: WorkspaceUser) => u.username;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Create Workspace</CardTitle>
                    <CardDescription>
                        Here you can create an new workspace.
                    </CardDescription>
                    <CardAction>
                        <Button
                            variant="destructive"
                            onClick={() => resetFormAndAction()}
                        >
                            Reset Input
                        </Button>
                    </CardAction>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitWithAction}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="new-workspace-workspace-name">
                                    <span>Workspace name</span>
                                    <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Input
                                    {...form.register('name')}
                                    id="new-workspace-workspace-name"
                                    placeholder="My Workspace"
                                    required
                                />
                                <FieldError
                                    errors={[form.formState.errors.name]}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="new-workspace-workspace-description">
                                    <span>Workspace description</span>
                                </FieldLabel>
                                <Input
                                    {...form.register('description')}
                                    id="new-workspace-workspace-description"
                                    placeholder=""
                                />
                                <FieldError
                                    errors={[form.formState.errors.description]}
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="new-workspace-workspace-slug">
                                    <span>Workspace slug</span>
                                    <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Input
                                    {...form.register('slug')}
                                    id="new-workspace-workspace-slug"
                                    placeholder="my-workspace"
                                    required
                                />
                                <FieldError
                                    errors={[form.formState.errors.slug]}
                                />
                            </Field>
                            <Field>
                                <FieldLabel>
                                    Additional worksapce members
                                </FieldLabel>
                                <FieldDescription>
                                    Here you can add additional workspace
                                    members to your workspace. You are a member
                                    by default.
                                </FieldDescription>
                                <Controller
                                    control={form.control}
                                    name="memberIds"
                                    render={({ field }) => (
                                        <Combobox
                                            multiple
                                            autoHighlight
                                            items={users.map((u) => u.id)}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <ComboboxChips
                                                ref={anchor}
                                                className="w-full"
                                            >
                                                <ComboboxValue>
                                                    {(values: string[]) => (
                                                        <Fragment>
                                                            {values.map(
                                                                (id) => {
                                                                    const user =
                                                                        userById.get(
                                                                            id
                                                                        );
                                                                    if (!user)
                                                                        return null;
                                                                    return (
                                                                        <ComboboxChip
                                                                            key={
                                                                                id
                                                                            }
                                                                        >
                                                                            {displayName(
                                                                                user
                                                                            )}
                                                                        </ComboboxChip>
                                                                    );
                                                                }
                                                            )}
                                                            <ComboboxChipsInput />
                                                        </Fragment>
                                                    )}
                                                </ComboboxValue>
                                            </ComboboxChips>
                                            <ComboboxContent anchor={anchor}>
                                                <ComboboxEmpty>
                                                    No users found.
                                                </ComboboxEmpty>
                                                <ComboboxList>
                                                    {(id: string) => {
                                                        const user =
                                                            userById.get(id);
                                                        if (!user) return null;
                                                        return (
                                                            <ComboboxItem
                                                                key={id}
                                                                value={id}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span>
                                                                        {displayName(
                                                                            user
                                                                        )}
                                                                    </span>
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
                                <FieldError
                                    errors={[form.formState.errors.memberIds]}
                                />
                            </Field>
                            {action.result?.serverError && (
                                <p className="text-sm font-medium text-red-500">
                                    {action.result.serverError}
                                </p>
                            )}

                            <Field orientation="horizontal">
                                <Button type="submit">
                                    {action.isPending
                                        ? 'Creating...'
                                        : 'Create Workspace'}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}
