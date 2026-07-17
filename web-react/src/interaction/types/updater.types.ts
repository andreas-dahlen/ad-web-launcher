/* -------------------------
        Custom Event typing
    -------------------------- */
// export type ReactionEvent = CustomEvent<CtxType>

import type { EventType } from '../../shared/types/core.types';

export type ReactionEvent = CustomEvent<EventType>