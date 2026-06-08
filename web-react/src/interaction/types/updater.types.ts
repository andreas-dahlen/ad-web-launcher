/* -------------------------
        Custom Event typing
    -------------------------- */
// export type ReactionEvent = CustomEvent<CtxType>

import type { EventType } from '@typing/core.types';

export type ReactionEvent = CustomEvent<EventType>