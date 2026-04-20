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
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Workspace } from '@/types/resolvedWorkspace';

export default function ManageWorkspaceCard({
    workspace,
}: {
    workspace: Workspace;
}) {
    const { form, action, handleSubmitWithAction } = useHookFormAction(
        manageWorkspace,
        standardSchemaResolver(manageWorkspaceSchema),
        {
            formProps: {
                values: {
                    workspaceId: workspace.id,
                    name: workspace.name,
                    description: workspace.description ?? '',
                },
            },
            actionProps: {},
        }
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Workspace</CardTitle>
                <CardDescription>
                    Here you can manage your workspace.
                </CardDescription>
                {/* TODO: Implement delete workspace functionality and uncomment the code below */}
                {/*<CardAction>*/}
                {/*    <DeleteWorkspaceDialog*/}
                {/*        workspaceSlug={workspace.slug}*/}
                {/*        workspaceName={workspace.name}*/}
                {/*        onDelete={() => {*/}
                {/*            alert('This feature hasn\'t been implemented yet.');*/}
                {/*        }}*/}
                {/*    ></DeleteWorkspaceDialog>*/}
                {/*</CardAction>*/}
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

                        {action.result?.serverError && (
                            <p className="text-sm font-medium text-red-500">
                                {action.result.serverError}
                            </p>
                        )}

                        <Field
                            orientation="horizontal"
                            className="flex justify-end"
                        >
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
