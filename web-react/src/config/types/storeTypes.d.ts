
declare global {
  // ----------------------
  // laneData
  // ----------------------
  interface CarouselLane {
    index: number
    count: number
    offset: number
    size: Vec2
    dragging: boolean
    settling: boolean
    pendingDir: Direction | null
    lockPrevAt: number | null
    lockNextAt: number | null
    currentScenes: number[]
  }

  type CarouselInteractiveData = { type: 'carousel'; store: CarouselLane }
  type SliderInteractiveData = { type: 'slider'; store: SliderLane }
  type DragInteractiveData = { type: 'drag'; store: DragLane }

  type InteractiveData = CarouselInteractiveData | SliderInteractiveData | DragInteractiveData
  
  // Full interactive: data + live DOM refs (readonly)
  type Reactive<T = unknown> = {
    type: ReactiveType
    id: string
    data: T
  }
  type ReactiveType = "carousel" | "sizeState"  // can extend
  
  interface ReactiveDataMap {
    carousel: CarouselState
    sizeState: SizeState
  }
  // ----------------------
  // Zustand store
  // ----------------------
interface ReactiveStore {
  reactives: Record<string, Reactive<ReactiveDataMap[ReactiveType]>>  // key = `${type}:${id}`

  add: <T extends ReactiveType>(reactive: Reactive<ReactiveDataMap[T]>) => void
  remove: (type: ReactiveType, id: string) => void
  get: <T extends ReactiveType>(
    type: T,
    id: string
  ) => Reactive<unknown>
}
}
export {}