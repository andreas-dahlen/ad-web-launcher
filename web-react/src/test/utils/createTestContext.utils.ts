import { testBuildDesc } from '../testAPI'
import { createMetaByType } from '@test/app/interaction/builders/domAndMeta.factory'
import { resetInteractionStores } from '@test/utils/storeReset.utils'

import { seedStoreByType } from '@test/utils/storeSeed.utils'
import type { InteractionType } from '../../shared/types/core.types'

export function createMetaContext(type: Exclude<InteractionType, "button">) {
  const id = "test"

  resetInteractionStores()

  seedStoreByType(type, id)

  const meta = createMetaByType(type)

  return { id, meta, builder: { capabilities: testBuildDesc.buildCapabilities(meta), x: 0, y: 0, pointerId: 0 } }
}