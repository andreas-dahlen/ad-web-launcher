import { createLane } from '@data/dataGenerator'
import type { Axis1D, PlusMinusOne } from '@typing/core.types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export type Scene = {
  sceneId: string
  props?: Record<string, unknown>
}

export type Lane = {
  laneId: string
  axis: "horizontal" | "vertical"

  scenes: Record<string, Scene> // keys = sceneId
  sceneOrder: string[]          // array of sceneIds

  lockNextAt?: number
  lockPrevAt?: number
}

export type LaneSystem = {
  lanes: Record<string, Lane> // keys = laneId
  laneOrder: string[]         // array of laneIds
}

export type LayoutStore = {
  vertical: LaneSystem
  horizontal: LaneSystem

  // init: (defaults: { vertical: LaneSystem, horizontal: LaneSystem }) => void
  overrideToDefaults: (defaults: { vertical: LaneSystem, horizontal: LaneSystem }) => void

  addLane: (axis: Axis1D) => void
  deleteLane: (axis: Axis1D, laneId: string) => void
  moveLane: (axis: Axis1D, laneId: string, dir: PlusMinusOne) => void

  addScene: (axis: Axis1D, laneId: string) => void
  deleteScene: (axis: Axis1D, laneId: string, sceneId: string) => void
  moveScene: (axis: Axis1D, laneId: string, sceneId: string, dir: PlusMinusOne) => void
}

export const layoutStore = create<LayoutStore>()(
  persist(
    immer((set) => ({

      vertical: { lanes: {}, laneOrder: [] },
      horizontal: { lanes: {}, laneOrder: [] },

      overrideToDefaults: (defaults) => {
        set(s => {
          s.vertical = defaults.vertical
          s.horizontal = defaults.horizontal
        })
      },

      addLane: (axis) => {
        const newLane = createLane(axis)
        set(s => {
          const sys = getSystem(s, axis)

          sys.lanes[newLane.laneId] = {
            laneId: newLane.laneId,
            axis,
            scenes: newLane.scenes,
            sceneOrder: newLane.sceneOrder
          }

          sys.laneOrder.push(newLane.laneId)
        })
      },

      deleteLane: (axis, laneId) => {
        set(s => {
          const sys = getSystem(s, axis)
          if (sys.laneOrder.length <= 1) return
          delete sys.lanes[laneId]
          sys.laneOrder = sys.laneOrder.filter(x => x !== laneId)
        })
      },

      moveLane: (axis, laneId, dir) => {
        set(s => {
          const sys = getSystem(s, axis)
          moveByDir(sys.laneOrder, laneId, dir)
        })
      },

      addScene: (axis, laneId) => {
        const sceneId = createId()
        set(s => {
          const sys = getSystem(s, axis)
          const lane = sys.lanes[laneId]
          if (!lane) return

          lane.scenes[sceneId] = { sceneId }
          lane.sceneOrder.push(sceneId)
        })
      },

      deleteScene: (axis, laneId, sceneId) => {
        set(s => {
          const sys = getSystem(s, axis)
          const lane = sys.lanes[laneId]
          if (!lane) return
          if (lane.sceneOrder.length <= 1) return

          delete lane.scenes[sceneId]
          lane.sceneOrder = lane.sceneOrder.filter(x => x !== sceneId)
        })
      },

      moveScene: (axis, laneId, sceneId, dir) => {
        set(s => {
          const sys = getSystem(s, axis)
          const lane = sys.lanes[laneId]
          if (!lane) return

          moveByDir(lane.sceneOrder, sceneId, dir)
        })
      }

    })),
    {
      name: "Layout",
    }
  )
)

const createId = () => crypto.randomUUID()

const getSystem = (s: LayoutStore, axis: Axis1D) =>
  axis === "horizontal" ? s.horizontal : s.vertical

const moveByDir = (order: string[], id: string, dir: PlusMinusOne) => {
  const index = order.indexOf(id)
  if (index === -1) return

  const newIndex = index + dir
  if (newIndex < 0 || newIndex >= order.length) return

  order.splice(index, 1)
  order.splice(newIndex, 0, id)
}