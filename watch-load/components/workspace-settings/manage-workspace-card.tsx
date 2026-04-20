'use client';

import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { manageWorkspace } from '@/actions/workspace';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { manageWorkspaceSchema } from '@/lib/validations/dashboard';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Workspace } from '@/types/resolvedWorkspace';
import { WorkspaceRole } from '@/generated/prisma/enums';
import MemberCombobox from '@/components/member-combobox';

export type WorkspaceUserWithRole = {
    id: string;
    name: string | null;
    username: string;
    workspaceRole: WorkspaceRole | null;
};

export default function ManageWorkspaceCard({
    users,
    workspace,
    allUsers,
    currentUserId,
}: {
    workspace: Workspace;
    users: WorkspaceUserWithRole[];
    allUsers: WorkspaceUserWithRole[];
    currentUserId: string;
}) {
    const { form, action, handleSubmitWithAction, resetFormAndAction } =
        useHookFormAction(
            manageWorkspace.bind(null, workspace.id),
            standardSchemaResolver(manageWorkspaceSchema),
            {
                formProps: {
                    values: {
                        name: workspace.name,
                        description: workspace.description ?? '',
                        adminIds: users
                            .filter(
                                (u) =>
                                    u.workspaceRole ===
                                        WorkspaceRole.WORKSPACE_ADMIN &&
                                    u.id !== currentUserId
                            )
                            .map((u) => u.id),
                        memberIds: users
                            .filter(
                                (u) =>
                                    u.workspaceRole !==
                                        WorkspaceRole.WORKSPACE_ADMIN
                            )
                            .map((u) => u.id),
                    },
                },
                actionProps: {
                },
            }
        );

    const currentUser = users.find((u) => u.id === currentUserId);

    const onSubmit = form.handleSubmit((data) => {
        const submitData = {
            ...data,
            adminIds: [...data.adminIds, currentUserId],
        };
        action.execute(submitData);
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Workspace</CardTitle>
                <CardDescription>
                    Here you can manage your workspace.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="new-workspace-workspace-name">
                                <span>Workspace name</span>
                                <span className="text-red-500">*</span>
                            </FieldLabel>
                            <Input
                                {...form.register('name')}
                                id="new-workspace-workspace-name"
                                required
                            />
                            <FieldError errors={[form.formState.errors.name]} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="new-workspace-workspace-description">
                                <span>Workspace description</span>
                            </FieldLabel>
                            <Input
                                {...form.register('description')}
                                id="new-workspace-workspace-description"
                            />
                            <FieldError
                                errors={[form.formState.errors.description]}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="new-workspace-workspace-slug">
                                <span>Workspace slug</span>
                            </FieldLabel>
                            <Input
                                id="new-workspace-workspace-slug"
                                defaultValue={workspace.slug}
                                disabled
                            />
                        </Field>

                        <MemberCombobox
                            label="Admins"
                            description="Admins can manage workspace settings and members."
                            fieldName="adminIds"
                            allUsers={allUsers}
                            currentUserId={currentUserId}
                            lockedUser={currentUser}
                            form={form}
                            errorField={form.formState.errors.adminIds}
                        />

                        <MemberCombobox
                            label="Members"
                            description="Members have access to the workspace but cannot change settings."
                            fieldName="memberIds"
                            allUsers={allUsers}
                            currentUserId={currentUserId}
                            form={form}
                            errorField={form.formState.errors.memberIds}
                        />

                        {action.result?.serverError && (
                            <p className="text-sm font-medium text-red-500">
                                {action.result.serverError}
                            </p>
                        )}

                        <Field orientation="horizontal">
                            <Button type="submit">
                                {action.isPending
                                    ? 'Saving...'
                                    : 'Save Workspace'}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
