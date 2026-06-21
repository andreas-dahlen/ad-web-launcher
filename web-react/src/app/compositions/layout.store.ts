import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type Scene = {
  id: string
  props?: Record<string, unknown>
}

type Lane = {
  id: string
  axis: "horizontal" | "vertical"

  scenes: Record<string, Scene>
  sceneOrder: string[]

  lockNextAt?: number
  lockPrevAt?: number
}

export type LaneSystem = {
  lanes: Record<string, Lane>
  laneOrder: string[]
}

export type LayoutStore = {
  vertical: LaneSystem
  horizontal: LaneSystem
  // verticalLanes: Record<string, HorizontalLane>
  init: (defaults: { vertical: LaneSystem, horizontal: LaneSystem }) => void
  deleteHorizontal: (id: string) => void
  addHorizontal: () => void
  moveHorizontalScene: (id: string, from: number, to: number) => void
}



export const layoutStore = create<LayoutStore>()(
  persist(
    immer((set, get) => ({

      vertical: { lanes: {}, laneOrder: [] },
      horizontal: { lanes: {}, laneOrder: [] },

      init: (defaults) => {

        const hasAny =
          Object.keys(get().vertical.lanes).length > 0 ||
          Object.keys(get().horizontal.lanes).length > 0

        if (hasAny) return

        set(s => {
          s.vertical = defaults.vertical
          s.horizontal = defaults.horizontal
        })
      },
      deleteHorizontal: (id) => {
        set(s => {
          delete s.horizontal.lanes[id]
          s.horizontal.laneOrder = s.horizontal.laneOrder.filter(x => x !== id)
        })
      },
      addHorizontal: () => {
        const id = createLaneId()
        set(s => {

          s.horizontal.lanes[id] = {
            id,
            axis: "horizontal",
            scenes: {},
            sceneOrder: []
          }
          s.horizontal.laneOrder.push(id)
        })
      },
      moveHorizontalScene: (id, from, to) => {
        set(s => {
          const lane = s.horizontal.lanes[id]
          if (!lane) return

          const order = lane.sceneOrder

          if (
            from < 0 ||
            from >= order.length ||
            to < 0 ||
            to >= order.length
          ) {
            return
          }

          const [sceneId] = order.splice(from, 1)
          order.splice(to, 0, sceneId)
        })
      }
    })),
    { name: "Layout" }
  )
)

const createLaneId = () => crypto.randomUUID()