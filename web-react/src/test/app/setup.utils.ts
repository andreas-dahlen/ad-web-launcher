import { resetInteractionStores } from '@test/testUtils/storeReset.utils.ts'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
  resetInteractionStores()
})