import { appStore, type AppStore } from '../stores/appStore'
import { useShallow } from 'zustand/shallow'

export const useAppStore = () => {

  return appStore(
    useShallow((s: AppStore) => ({
      loading: s.loading ?? true,
      setLoading: s.setLoading
    }))
  )
}