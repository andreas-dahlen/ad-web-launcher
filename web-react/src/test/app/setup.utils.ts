import { resetInteractionStores } from '@test/testUtils/storeReset.utils'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  resetInteractionStores()
})