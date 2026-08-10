import { resetInteractionStores } from '@test/utils/storeReset.utils'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  resetInteractionStores()
})