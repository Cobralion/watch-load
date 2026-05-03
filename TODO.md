# TODO

## Security

- [ ] **Compare password against a dummy hash when user is not found**
  `lib/auth.ts:94` — If a login attempt is made with a username that does not exist, the code currently returns early before running `bcrypt.compare`. This creates a timing-based user-enumeration vulnerability. Always run a dummy compare so the response time is the same whether or not the user exists.

- [ ] **Verify that a heart measurement belongs to the requesting user before updating**
  `actions/heart.ts:58` — `updateMany` filters only by `id`. A workspace admin could potentially update a measurement that belongs to a different workspace. Add a `workspaceId` filter to the `where` clause.

## Multi-Device / Multiple Withings Connections

- [ ] **Support multiple Withings device connections per workspace (heart sync)**
  `lib/withings/heart.ts:28` — `findFirst` picks an arbitrary connection. When multiple connections per workspace are supported, this should iterate over all connections or accept a connection identifier.

- [ ] **Support multiple Withings device connections per workspace (token refresh)**
  `lib/withings/token-managment.ts:19` — Same as above; `refreshWithingsToken` always refreshes the first connection found for a workspace.

- [ ] **Revoke only the relevant device connection on disconnect**
  `lib/withings/oauth.ts:143` — `disconnectDevice` currently revokes all connections for a workspace. Once multiple connections are supported it should target only the specific connection being removed.

## Token / Auth Robustness

- [ ] **Lock token refresh so only one concurrent refresh runs at a time**
  `lib/withings/token-managment.ts:13` — Under concurrent requests, multiple callers can race to refresh the same Withings token. The first to succeed will invalidate the refresh token, causing all others to fail. A database-level advisory lock or a distributed mutex should guard this.

- [ ] **Handle specific Withings token-refresh error codes (e.g. expired refresh token)**
  `lib/withings/token-managment.ts:69` — The current check only tests `status !== 0`. Distinguishing error codes (like an expired or revoked refresh token) would allow more targeted recovery, such as prompting the user to reconnect their device.

- [ ] **Make session role assignment type-safe**
  `lib/auth.ts:37` — `token.role` is cast with `as string`. It should be typed against `GlobalRole` from the Prisma schema to prevent silent mismatches if the enum changes.

## UX / Error Handling

- [ ] **Redirect user to connect page with error message on Withings callback failure**
  `app/api/withings/callback/route.ts:19` — When the Withings OAuth callback receives an `error` query param, the route currently returns a plain 400 text response. It should redirect back to the device-connect UI with the error surfaced as a user-facing message.

- [ ] **Show success message after password reset**
  `components/reset-password-form.tsx:46` — After a successful password reset the form gives no feedback. A toast or inline success message should be shown.

- [ ] **Show validation error on the form field when no user is selected in the add-user dialog**
  `components/workspace-settings/new-user-dialog-box.tsx:36` — When `handleSubmit` is called with no user selected, it silently returns. It should instead display an inline error on the user picker so the user understands what is required.

- [ ] **Show red error state on the workspace name field when creation fails**
  `components/dashboard/new-workspace-card.tsx:24` — On a failed `createWorkspace` action the error is likely shown as a toast (via `sonner`) but the input field itself has no visual error state. An "aria-invalid" / red-border treatment would improve accessibility and clarity.

- [ ] **Implement a proper Not Found error page for workspace routes**
  `app/(dashboard)/workspace/error.tsx:5` — The current error boundary is a generic catch-all. Navigating to a workspace slug that does not exist should render a dedicated 404 page rather than falling through to the generic error boundary.

- [ ] **Implement redirect on the UI when a workspace action returns Unauthorized**
  `actions/workspace.ts:22` — `createWorkspace` (and related actions) throw/return an unauthorized error but the calling UI does not redirect or surface it clearly. The client should redirect to `/` or show a meaningful message.

## Features / Completeness

- [ ] **Implement delete-workspace functionality**
  `components/workspace-settings/manage-workspace-card.tsx:51` — The `DeleteWorkspaceDialog` component is referenced but commented out. The server action and UI need to be wired up before this can be enabled.

- [ ] **Allow users to remove themselves from a workspace**
  `actions/workspace.ts:149` — `removeUser` currently only lets admins remove other users. Self-removal should be permitted with appropriate confirmation.

- [ ] **Add sorting to the workspace user data table**
  `components/workspace-settings/manage-workspace-user-data-table.tsx:34` — `sorting` state is initialised but not connected to a `setSorting` setter, so column-header sorting is non-functional.

## Performance / Architecture

- [ ] **Handle large numbers of heart measurements with pagination or cursor-based loading**
  `app/(dashboard)/workspace/[workspaceSlug]/page.tsx:10` — `findMany` fetches all measurements for a workspace with no limit. For workspaces with many measurements this will be slow and memory-intensive. Add pagination or a cursor.

- [ ] **Handle null/undefined fields when mapping heart measurements**
  `app/(dashboard)/workspace/[workspaceSlug]/page.tsx:21` — Optional Prisma fields are mapped without null-guards. Add explicit fallbacks or narrow the types.

- [ ] **Remove duplicate `resolveWorkspaceFromSlug` call on workspace page**
  `app/(dashboard)/workspace/[workspaceSlug]/page.tsx:46` — The workspace page calls `resolveWorkspaceFromSlug` even though the layout and workspace-provider already call it. Because it is React-cached the extra call is cheap, but the comment notes intent to eventually remove it.

- [ ] **Migrate `disconnect-devices` action to the standard safe-action architecture**
  `actions/disconnect-devices.ts:10` — This action is not wrapped the same way as others (e.g. missing `requiredRole` metadata pattern). Align it with the `actionClient` conventions used elsewhere.

- [ ] **Infer the `requiredRole` schema from the Prisma `GlobalRole` enum**
  `lib/safe-action.ts:8` — `requiredRoleSchema` is a manually maintained `z.enum(['USER', 'ADMIN'])`. It should be derived from the Prisma-generated `GlobalRole` enum so it stays in sync automatically.

- [ ] **Decide whether `revalidatePath` after heart sync is still needed**
  `actions/heart.ts:36` — The `revalidatePath` call after syncing heart data was marked as potentially unnecessary. Verify whether Next.js cache invalidation is still required here or if it can be removed.
