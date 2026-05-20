import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';



export type GestureStore = {
  activeSwipes: number

  increment: () => void
  decrement: () => void
}


export const gestureStore = create<GestureStore>()(
  immer((set) => ({

    activeSwipes: 0,

    increment: () => {
      set(state => {
        state.activeSwipes++
      })
    },
    decrement: () => {
      set(state => {
        state.activeSwipes = Math.max(0, state.activeSwipes - 1)
      })
    }
  })
  )
)