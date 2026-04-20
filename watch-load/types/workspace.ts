// TODO: remove
export type WorkspaceUser = {
    id: string;
    name: string | null;
    username: string;
};

export type WorkspaceMember = {
    id: string;
    username: string;
    name: string;
    isWorkspaceAdmin: boolean;
};
