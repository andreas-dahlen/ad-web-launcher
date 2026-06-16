import { gestureStore, type GestureStore } from '../../stores/gesture.store'
import { useShallow } from 'zustand/shallow'



export const useGestureStore = () => {

  return gestureStore(
    useShallow((s: GestureStore) => ({
      activeGesture: s.activeGesture,
      isLongPress: Object.values(s.gestureNodes).some(g => g.isLongPress)
    })) //TODO: useSHallow is useless unless this expands.
  )
}