import { testBuildDesc } from '../testApi.ts'
import { createMetaByType } from '@test/app/interaction/builders/domAndMeta.factory.ts'
import { resetInteractionStores } from '@test/testUtils/storeReset.utils.ts'

import { seedStoreByType } from '@test/testUtils/storeSeed.utils.ts'
import type { InteractionType } from '../../shared/types/core.types.ts'

export function createMetaContext(type: Exclude<InteractionType, "button">) {
  const id = "test"

  resetInteractionStores()

  seedStoreByType(type, id)

  const meta = createMetaByType(type)

  return { id, meta, builder: { capabilities: testBuildDesc.buildCapabilities(meta), x: 0, y: 0, pointerId: 0 } }
}