import type { InteractionType } from '../typing/core.types';
import type { CtxType } from '@interaction/types/Runtime.types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type ActiveGesture = {
  pointerId: number
  type: InteractionType
}

export type GestureStore = {
  activeGesture: InteractionType | 'none'
  gestureNodes: Record<number, ActiveGesture>

  increment: (ctx: CtxType, id: number) => void
  decrement: (id: number) => void
}


export const gestureStore = create<GestureStore>()(
  immer((set, get) => ({

    gestureNodes: {},

    activeGesture: 'none',

    increment: (ctx, id) => {
      if (get().gestureNodes[id]) return

      set(state => {
        state.gestureNodes[id] = {
          pointerId: id,
          type: ctx.type
        }
        state.activeGesture = ctx.type
      })
    },

    decrement: (id) => {
      set(state => {
        delete state.gestureNodes[id]
        const remaining = Object.values(state.gestureNodes)

        state.activeGesture =
          remaining[0]?.type ?? 'none'
      })
    }
  })
  )
)