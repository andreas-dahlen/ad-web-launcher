import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { carouselStore, type CarouselBinding, type CarouselStore, type RingState } from './carousel.store'
import { debugRegisterBinding, debugUnregisterBinding } from '../../../test/functions.debug'

const NODE_1 = { nodeIdx: 0, sceneIdx: 0 }
const NODE_2 = { nodeIdx: 1, sceneIdx: 1 }
const NODE_3 = { nodeIdx: 2, sceneIdx: 2 }
const NODES = {
  nodes: [
    NODE_1,
    NODE_2,
    NODE_3
  ]
}

export const carousel_DEFAULTS = {
  index: 0,
  count: 0,
  liveOffset: 0,
  dragging: false,
  layout: {
    containerSize: { width: 0, height: 0 },
    itemSize: { width: 0, height: 0 }
  },
  settling: false,
  pendingDir: null,
  ring: {
    ...NODES,
    currentNode: 0
  } as RingState
} satisfies CarouselBinding

export const useCarouselStore = (id: string) => {

  useEffect(() => {
    debugRegisterBinding(id, 'useCarouselStore')
    carouselStore.getState().init(id, carousel_DEFAULTS)
    return () => {
      debugUnregisterBinding(id, 'useCarouselStore')
      carouselStore.getState().delete(id)
    }
  }, [id])

  return carouselStore(
    useShallow((s: CarouselStore) => s.bindings[id] ?? carousel_DEFAULTS)
  ) //TODO remove useShallow?
}