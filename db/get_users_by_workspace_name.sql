SELECT u.id              AS user_id,
       u.name            AS user_name,
       w.name            AS workspace_name,
       wm.workspace_role AS workspace_role
FROM "users" u
         JOIN "memberships" wm ON wm."user_id" = u.id
         JOIN "workspaces" w ON w.id = wm."workspace_id"
WHERE w.name = 'my workspace'
ORDER BY w.name, u.name;