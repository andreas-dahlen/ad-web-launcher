
declare global {

  // ----------------------
  // All store data objects
  // ----------------------
  interface DragState {
    position: Vec2      // committed position
    offset: Vec2        // live offset during drag
    dragging: boolean
    minX?: number
    maxX?: number
    minY?: number
    maxY?: number
  }

  interface SliderState {
  value: number         // logical position
  offset: number        // live drag offset
  min: number
  max: number
  size: Vec2
  thumbSize?: Vec2
  dragging?: boolean
}

  interface CarouselState {
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

  interface SizeState {
    device: Device
    scale: number
    scaledWidth: number
    scaledHeight: number
  }
  // Full interactive: data + live DOM refs (readonly)
  type Reactive<T extends ReactiveType = ReactiveType> = {
    type: T
    id: string
    data: ReactiveDataMap[T]
  }

  type ReactiveType = keyof ReactiveDataMap

  interface ReactiveDataMap {
    sizeState: SizeState
    carousel: CarouselState
    drag: DragState
    slider: SliderState
  }
  // ----------------------
  // Zustand store
  // ----------------------
  interface ReactiveStore {
    reactives: Record<string, Reactive>  // key = `${type}:${id}`

    add: <T extends ReactiveType>(reactive: Reactive<T>) => void
    remove: (type: ReactiveType, id: string) => void
    get: <T extends ReactiveType>(
      type: T,
      id: string
    ) => Reactive | undefined
  }
}

export { }