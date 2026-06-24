import ContentLayer from "./layers/ContentLayer.tsx"
import OverlayLayer from "./layers/OverlayLayer.tsx"
import BaseLayer from './layers/BaseLayer.tsx'
import { useLayoutEffect } from 'react'
import { sizeStore } from '../shared/state/stores/size.store.ts'
import AlertLayer from '@app/layers/AlertLayer.tsx'
import { gestureStore } from '../shared/state/stores/gesture.store.ts'

export default function Root() {

  const activeGesture = gestureStore(s => s.activeGesture)
  const isLongPress = gestureStore(s => s.isLongPress)

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      sizeStore.getState().update(width, height)
    })

    observer.observe(document.documentElement)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="theme"
      data-theme="default"
      data-active-gesture={activeGesture}
      data-active-long-press={isLongPress}
    >

      <BaseLayer />
      <ContentLayer />
      <OverlayLayer />
      <AlertLayer />
    </div>
  )
}