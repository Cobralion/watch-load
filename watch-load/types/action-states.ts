type ActionStates = {
    success: boolean;
    message?: string;
};

type SyncHeartActionState = ActionStates;
type TrailsChangeActionState = ActionStates;



export type { ActionStates, SyncHeartActionState, TrailsChangeActionState };
