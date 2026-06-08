import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type AppStore = {
  loading: boolean
  setLoading: (value: boolean) => void
}

export const appStore = create<AppStore>()(
  immer(set => ({

    loading: true,

    setLoading: (value) => {
      set(s => {
        s.loading = value
      })
    }
  }))
)