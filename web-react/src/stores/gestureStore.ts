import type { InteractionType } from '@typeScript/core/primitiveType';
import type { CtxType } from '@typeScript/descriptor/ctxType';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type ActiveGesture = {
  pointerId: number
  type: InteractionType
}

export type GestureStore = {
  gestureNodes: Record<number, ActiveGesture>

  increment: (ctx: CtxType, id: number) => void
  decrement: (id: number) => void
  isGestureActive: (type: InteractionType) => boolean
}


export const gestureStore = create<GestureStore>()(
  immer((set, get) => ({

    gestureNodes: {},

    increment: (ctx, id) => {
      if (get().gestureNodes[id]) return

      set(state => {
        state.gestureNodes[id] = {
          pointerId: id,
          type: ctx.type
        }
      })
    },

    decrement: (id) => {
      set(state => {
        delete state.gestureNodes[id]
      })
    },

    isGestureActive: (searchType) => {
      const gestures = Object.values(get().gestureNodes)
      return gestures.some(gesture => gesture.type === searchType)
    }
  })
  )
)