import type { InteractionType } from '../typing/core.types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type ActiveGesture = {
  pointerId: number
  type: InteractionType
  isLongPress: boolean
}

export type GestureStore = {
  gestureNodes: Record<number, ActiveGesture>

  activeGesture: InteractionType | 'none'

  increment: (type: InteractionType, id: number) => void
  decrement: (id: number) => void
  setLongPress: (id: number) => void
}


export const gestureStore = create<GestureStore>()(
  immer((set, get) => ({

    gestureNodes: {},

    activeGesture: 'none',

    increment: (type, id) => {
      if (get().gestureNodes[id]) return

      set(state => {
        state.gestureNodes[id] = {
          pointerId: id,
          type: type,
          isLongPress: false
        }
        state.activeGesture = type
      })
    },

    decrement: (id) => {
      set(state => {
        delete state.gestureNodes[id]
        const remaining = Object.values(state.gestureNodes)
        state.activeGesture =
          remaining[0]?.type ?? 'none'
      })
    },

    setLongPress: (id) => {
      set(state => {
        const s = state.gestureNodes[id]
        if (!s) return
        s.isLongPress = true
      })
    },
  })
  )
)
