import normalizeGlob from '../normalize/glob.ts';
import { deactivate } from '../operations/deactivate.ts';
import { requestGlob } from '../operations/glob.ts';
import { resolveActiveIdentity } from '../operations/identity.ts';
import { requestOperation } from '../operations/requestOperation.ts';
import type { Scope, Slice } from '../types/dataStructure.types.ts';
import type { FilterController } from './filterController.ts';
import type { MapController } from './mapController.ts';
import * as vscode from 'vscode'
import type { VisualController } from './visualController.ts';

export function createGeneralController(
  {
    loader,
    cache,
    output,
    appState,
    updateTree
  }: Scope,
  map: MapController,
  filter: FilterController,
  visuals: VisualController) {
  const target = loader.getExcludeConfigTarget()

  void output

  async function startup(): Promise<void> {
    visuals.setTreeView()
    const cachedLocalExclude = cache.getRecoveryExclude()
    if (!cachedLocalExclude) return

    await deactivate(cachedLocalExclude, target)
    await cache.setRecoveryExclude(undefined)
  }

  function toggleConfig(slice: Slice): void {
    if (appState.getActiveConfig()?.id === slice.id) {
      appState.setActiveConfig(undefined)
    } else {
      appState.setActiveConfig({
        type: slice.type,
        id: slice.id,
      })
    }
    updateTree()
  }

  async function explorerConfig(uris: vscode.Uri[]): Promise<void> {
    const identity = await resolveActiveIdentity(appState, cache)
    if (!identity) return
    updateTree()
    const operation = await requestOperation(identity)
    if (!operation) return

    switch (operation) {
      case 'include':
        await map.include(uris)
        break
      case 'exclude':
        await map.exclude(uris)
        break
      case 'addExclude':
        await filter.addExclude(uris)
        break
      case 'removeExclude':
        await filter.removeExclude(uris)
        break
    }
  }

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
    toggleConfig,
    explorerConfig,
    addGlob
  }
}