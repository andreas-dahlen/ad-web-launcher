import { gestureStore, type GestureStore } from '../stores/gestureStore'
import { useShallow } from 'zustand/shallow'



export const useGestureStore = () => {

  return gestureStore(
    useShallow((s: GestureStore) => ({
      gestureNodes: s.gestureNodes,
      isGestureActive: s.isGestureActive
    }))
  )
}