
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'


export type AlertStore = {
  open: boolean
  message: string
  onConfirm: (() => void) | null
  onCancel: (() => void) | null

  show: (opts: {
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  }) => void

  hide: () => void
}

export const alertStore = create<AlertStore>()(
  immer((set) => ({

    open: false,
    message: "",
    onConfirm: null,
    onCancel: null,

    show: ({ message, onConfirm, onCancel }) =>
      set(() => ({
        open: true,
        message,
        onConfirm,
        onCancel: onCancel ?? null,
      })),

    hide: () =>
      set(() => ({
        open: false,
        message: "",
        onConfirm: null,
        onCancel: null
      }))
  }))
)