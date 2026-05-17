type ActionStates = {
    success: boolean;
    message?: string;
};

type SyncHeartActionState = ActionStates;
type TrialsChangeActionState = ActionStates;

export type { ActionStates, SyncHeartActionState, TrialsChangeActionState };
