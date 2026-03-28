// import { immer } from "zustand/middleware/immer"
// // import { shallow } from "zustand/shallow"
// import { createWithEqualityFn } from 'zustand/traditional'

// type Carousel = {
//   index: number
//   offset: number
//   dragging: boolean
//   count: number
// }

// type Store = {
//   carouselStore: Record<string, Carousel>
//   initCarousel: (id: string) => void
// }

// export const useStore = createWithEqualityFn<Store>()(
//   immer((set, get) => ({

//     /* =========================================================
//        Carousel stuff
//     ========================================================= */
//     carouselStore: {},

//     //tsx only!
//     initCarousel: (id) => {
//       if (get().carouselStore[id]) return

//       set(state => {
//         state.carouselStore[id] = {
//           index: 0,
//           count: 0,
//           offset: 0,
//           dragging: false,
//         }
//       })
//     },
//   }))
// )

// export const getCarousel = (id: string) => {
//   const c = useStore.getState().carouselStore[id]
//   if (!c) throw new Error(`Carousel ${id} not initialized`)
//   return c
// }

// export const mutateCarousel = (id: string, fn: (c: Carousel) => void) => {
//   useStore.setState(state => {
//     const c = state.carouselStore[id]
//     if (!c) throw new Error(`Carousel ${id} not initialized`)
//     fn(c)
//   })
// }
// /* =========================================================
// API
// ========================================================= */
// // const c = getCarousel(id)

// // mutateCarousel(id, c => {
//   // c.offset = newOffset
//   // c.dragging = true
// // })

// /* =========================================================
// HOOKS
// ========================================================= */

// // export const subscribeToCarouselMotion = (id: string) =>
// //   useStore(
// //     s => {
// //       const c = s.carouselStore[id]
// //       return { offset: c.offset, dragging: c.dragging }
// //     },
// //     shallow
// //   )

// // export const subscribeToCarouselScene = (id: string) =>
// //   useStore(
// //     s => {
// //       const c = s.carouselStore[id]
// //       return { index: c.index, count: c.count }
// //     },
// //     shallow
// //   )