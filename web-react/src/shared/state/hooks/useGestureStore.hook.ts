import { gestureStore, type GestureStore } from '../../stores/gesture.store'
import { useShallow } from 'zustand/shallow'



export const useGestureStore = () => {

  return gestureStore(
    useShallow((s: GestureStore) => ({
      activeGesture: s.activeGesture
    })) //TODO: useSHallow is useless unless this expands.
  )
}