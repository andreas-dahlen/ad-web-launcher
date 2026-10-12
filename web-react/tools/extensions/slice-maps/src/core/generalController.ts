import { resolveConfigIdentity } from '../identity/configIdentity.ts';
import normalizeGlob from '../normalize/glob.ts';
import { deactivate } from '../operations/deactivate.ts';
import { requestGlob } from '../operations/glob.ts';
// import { resolveActiveIdentity } from '../operations/identity.ts';
// import { requestOperation } from '../operations/requestOperation.ts';
import type { Scope, Slice } from '../types/dataStructure.types.ts';
import type { FilterController } from './filterController.ts';
import type { MapController } from './mapController.ts';

export function createGeneralController(
  {
    loader,
    cache,
    output,
    appState,
    updateTree
  }: Scope,
  map: MapController,
  filter: FilterController
) {
  const target = loader.getExcludeConfigTarget()

  void output

  async function startup(): Promise<void> {
    const cachedLocalExclude = loader.getPersistedExclude()
    if (cachedLocalExclude) {
      await deactivate(cachedLocalExclude, target)
      await loader.setPersistedExclude(undefined)
    }
    await resolveConfigIdentity(appState, cache, loader)
    updateTree()
  }

  async function changeConfig(slice: Slice): Promise<void> {
    if (appState.getActiveConfig()?.id === slice.id) return

    const identity = {
      type: slice.type,
      id: slice.id
    }

    appState.setActiveConfig(identity)
    await loader.setPersistedActiveConfig(identity)

    updateTree()
  }
  // async function explorerConfig(absolutePaths: string[]): Promise<void> {
  //   const identity = await resolveActiveIdentity(appState, cache)
  //   if (!identity) return
  //   updateTree()
  //   const operation = await requestOperation(identity)
  //   if (!operation) return

  //   switch (operation) {
  //     case 'include':
  //       await map.include(absolutePaths)
  //       break
  //     case 'exclude':
  //       await map.exclude(absolutePaths)
  //       break
  //     case 'addExclude':
  //       await filter.addExclude(absolutePaths)
  //       break
  //     case 'removeExclude':
  //       await filter.removeExclude(absolutePaths)
  //       break
  //   }
  // }

  async function addGlob(slice: Slice): Promise<void> {
    const pattern = await requestGlob()
    if (!pattern) return

    const paths = normalizeGlob(pattern, loader.fileTree())
    if (slice.type === 'map') {
      await map.update(slice, paths, '[ADD] user adds')
    } else if (slice.type === 'filter') {
      await filter.update(slice, paths, '[EXCLUDE] user excludes')
    }
  }

  return {
    startup,
    changeConfig,
    // explorerConfig,
    addGlob
  }
}