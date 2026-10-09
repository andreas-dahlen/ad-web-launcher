import type { NormalizedPaths, Scope, SliceMap } from '../types/dataStructure.types.ts';
import { createDebug } from '../utils/debug.ts';
import { showMsg } from '../utils/showMsg.ts';
import { createMap } from '../processing/create.ts';
import { renameMap } from '../processing/rename.ts';
import { resetMap } from '../processing/reset.ts';
import { resolveMap } from '../core/normalizationApi.ts';
import { resolveActiveIdentity } from '../processing/identity.ts';
import * as vscode from 'vscode'
import { resolvePaths } from '../utils/formatPath.ts';

export type MapController = NonNullable<ReturnType<typeof createMapController>>
export function createMapController({
  loader,
  root,
  cache,
  output,
  treeChanged,
  appState,
  applyEffectiveSlice,
  resolveNothingActive
}: Scope
) {
  const debug = createDebug(output, "mapProvider")

  async function toggle(map: SliceMap): Promise<void> {
    if (appState.isActiveMap(map.id)) {
      await resolveDeactivation()
    } else {
      await resolveActivation(map)
    }
  }

  async function create(): Promise<void> {
    const map = await createMap(root)
    if (!map) return

    await cache.addMap(map)

    treeChanged.fire()
    output.appendLine(`[slice maps] map created ${map.name}`)
  }

  async function remove(map: SliceMap): Promise<void> {
    await cache.removeMap(map.id)

    if (appState.getActiveConfig()?.id === map.id) {
      appState.setActiveConfig(undefined)
    }

    if (appState.isActiveMap(map.id)) {
      appState.setActiveMap(undefined)

      if (appState.hasActiveFilter()) {
        await applyEffectiveSlice()
      } else {
        await resolveNothingActive()
      }
    }
    output.appendLine(`[slice maps] map removed`)
  }

  async function rename(map: SliceMap): Promise<void> {
    const name = await renameMap()
    if (!name) return

    await cache.renameMap(map.id, name)

    treeChanged.fire()
    output.appendLine(`[slice maps] map rename: ${name}`)
  }

  async function reset(map: SliceMap): Promise<void> {
    const newMap = resetMap(map)
    await cache.addMap(newMap)

    if (appState.isActiveMap(map.id)) {
      await applyEffectiveSlice()
    } else {
      treeChanged.fire()
    }
    showMsg(`[slice maps] map reset ${newMap.name}`)
  }

  async function include(
    uris: vscode.Uri[]
  ): Promise<void> {
    const id = await resolveActiveIdentity(appState, cache)
    if (!id) return

    const map = cache.getMapById(id)
    if (!map) return

    const paths = resolvePaths(uris, root, 'include')
    await update(map, paths, '[ADD] user adds')
  }

  async function exclude(
    uris: vscode.Uri[]
  ): Promise<void> {
    const id = await resolveActiveIdentity(appState, cache)
    if (!id) return

    const map = cache.getMapById(id)
    if (!map) return

    const paths = resolvePaths(uris, root, 'exclude')
    await update(map, paths, '[REMOVE] user removes')
  }

  async function update(
    map: SliceMap,
    paths: NormalizedPaths,
    message: string
  ): Promise<void> {
    debug(message, paths)

    const nextMap = resolveMap(map, paths)

    debug('[UPDATE] before resolve', map)
    await cache.addMap(nextMap)
    debug('[UPDATE] after resolve', nextMap)

    if (appState.isActiveMap(nextMap.id)) {
      await applyEffectiveSlice()
    } else {
      treeChanged.fire()
    }
  }

  return {
    toggle,
    create,
    remove,
    rename,
    reset,
    include,
    exclude,
    update
  }

  async function resolveDeactivation() {
    appState.setActiveMap(undefined)
    output.appendLine('[slice maps] map deactivated')

    if (appState.hasActiveFilter()) {
      await applyEffectiveSlice()
      return
    }
    await resolveNothingActive()
  }

  async function resolveActivation(map: SliceMap) {
    if (!appState.hasActiveSlice()) {
      const localExclude = loader.getLocalExclude()
      cache.setLocalExclude(localExclude)
      await cache.setRecoveryExclude(localExclude)
      appState.setActiveConfig({ type: map.type, id: map.id })
    }
    appState.setActiveMap({ type: map.type, id: map.id })
    await applyEffectiveSlice()
  }
}