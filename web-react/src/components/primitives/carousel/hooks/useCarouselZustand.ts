import { carouselStore } from '@interaction/zunstand/carouselState'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

export const useCarouselZustand = (id: string) => {
  useEffect(() => {
    carouselStore.getState().init(id)
  }, [id])

  return carouselStore(
    useShallow(s => s.carouselStore[id] ?? {
      index: 0,
      count: 0,
      offset: 0,
      dragging: false,
      size: 0,
      settling: false
    })
  )
}
// export const useCarouselZustand = (id: string) => {
//   useEffect(() => {
//     carouselStore.getState().init(id)
//   }, [id])

//   return carouselStore(
//     useShallow(s => {
//       const c = s.carouselStore[id]

//       let index = 0, count = 0, offset = 0, dragging = false, size = { x: 0, y: 0 }
//       // Guard: if the carousel hasn't been initialized yet

//       if (c) {
//         index = c.index
//         count = c.count
//         offset = c.offset
//         dragging = c.dragging
//         size = c.size
//       }

//       return {
//         index,
//         count,
//         offset,
//         dragging,
//         size
//       }
//     })
//   )
// }