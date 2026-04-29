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
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { createWorkspaceSchema } from '@/lib/validations/workspace';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import { createWorkspace } from '@/actions/workspace';
import { toast } from 'sonner';

// TODO: add red alrial filed on error
export default function NewWorkspaceCard() {
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

    return (
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
    );
}
