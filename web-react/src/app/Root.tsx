import ContentLayer from "./layers/ContentLayer.tsx"
import OverlayLayer from "./layers/OverlayLayer.tsx"
import BaseLayer from './layers/BaseLayer.tsx'
import { useGestureStore } from '../hooks/useGestureStore.ts'
import { useLayoutEffect } from 'react'
import { sizeStore } from '../stores/sizeStore.ts'


export default function Root() {

  const { activeGesture } = useGestureStore()

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      sizeStore.getState().update(width, height)
    })

    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [])

  return (
    <div className='theme' data-theme="default" data-active-gesture={activeGesture}>
      <BaseLayer />
      <ContentLayer />
      <OverlayLayer />
    </div>
  )
}