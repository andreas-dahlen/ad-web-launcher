import { extractDomMeta } from '@interaction/input/domMeta'
import { metaSeedByType } from '@test/fixtures/meta.fixture'
import type { InteractionType } from '../../shared/types/core.types'

type MetaDataset = Record<string, string>
export function createInteractionElement(type: InteractionType, overrides: MetaDataset = {}) {
  const el = document.createElement('div')

  const mockBase = metaSeedByType[type]

  Object.assign(el.dataset, { ...mockBase, ...overrides })

  return el
}

export function createEl() {
  return document.createElement('div')

}

export function createMetaByType(type: InteractionType) {
  const el = createInteractionElement(type)
  const meta = extractDomMeta(el)
  if (!meta) throw new Error('Invalid meta')

  return meta
}


// export function createAndResolveMetaByType(type: InteractionType) {
//   const el = createElWithMetaByType(type)
//   const result = extractDomMeta(el)

//   expect(result).not.toBeNull()
//   if (!result) throw new Error('Expected meta but got null')

//   expect(result.el).toBe(el)

//   return result
// }