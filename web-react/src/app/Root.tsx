import ContentLayer from "./layers/ContentLayer.tsx"
import OverlayLayer from "./layers/OverlayLayer.tsx"
import BaseLayer from './layers/BaseLayer.tsx'
import { useGestureStore } from '../hooks/useGestureStore.ts'


export default function Root() {

  const { activeGesture } = useGestureStore()

  return (
    <div className='theme' data-theme="default" data-active-gesture={activeGesture}>
      <BaseLayer />
      <ContentLayer />
      <OverlayLayer />
    </div>
  )
}