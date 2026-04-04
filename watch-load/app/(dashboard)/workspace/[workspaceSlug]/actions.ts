'use server';
import { resolveWorkspace } from '@/lib/workspace';
import { ActionError } from '@/types/errors';

// // TODO: for updating fucntion.... use next safe actions
// export async function updateWorkspace(slug: string, data: {name: string}) {
//     const {workspace, membership} = await resolveWorkspace(slug);
//
//     if (!membership.workspaceRole !== 'WORKSPACE_ADMIN') {
//         throw new ActionError('Forbidden');
//     }
//
//     return {
//
//     };
// }