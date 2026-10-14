import type { NormalizedPaths, Scope, SliceMap } from '../types/core.types.ts';
import { createDebug } from '../utils/debug.ts';
import { showMsg } from '../utils/showMsg.ts';
import { createMap } from '../operations/create.ts';
import { renameMap } from '../operations/rename.ts';
import { resetMap } from '../operations/reset.ts';
import { normalizeMap } from '../normalize/slice.ts';
import { pathsToRelative } from '../normalize/pathsToRelative.ts';
import { resolveConfigIdentity } from '../identity/configIdentity.ts';

export type MapController = NonNullable<ReturnType<typeof createMapController>>
export function createMapController({
  loader,
  root,
  cache,
  output,
  appState,
  updateTree,
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

    if (!appState.getActiveConfig()) {
      await resolveConfigIdentity(appState, cache, loader)
    }

    updateTree()
    output.appendLine(`[slice maps] map created ${map.name}`)
  }

  async function remove(map: SliceMap): Promise<void> {
    await cache.removeMap(map.id)

    if (appState.getActiveConfig()?.id === map.id) {
      await resolveConfigIdentity(appState, cache, loader)
    }

    if (appState.isActiveMap(map.id)) {
      appState.setActiveMap(undefined)

      if (appState.hasActiveFilter()) {
        await applyEffectiveSlice()
      } else {
        await resolveNothingActive()
      }
    } else {
      updateTree()
    }
    output.appendLine(`[slice maps] map removed`)
  }

  async function rename(map: SliceMap): Promise<void> {
    const name = await renameMap()
    if (!name) return

    await cache.renameMap(map.id, name)

    updateTree()
    output.appendLine(`[slice maps] map rename: ${name}`)
  }

  async function reset(map: SliceMap): Promise<void> {
    const newMap = resetMap(map)
    await cache.addMap(newMap)

    if (appState.isActiveMap(map.id)) {
      await applyEffectiveSlice()
    } else {
      updateTree()
    }
    showMsg(`[slice maps] map reset ${newMap.name}`)
  }

  async function include(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await resolveConfigIdentity(appState, cache, loader)
    if (identity?.type !== 'map') return

    const map = cache.getMapById(identity.id)
    if (!map) return

    const paths = pathsToRelative(absolutePaths, root, 'include')
    await update(map, paths, '[ADD] user adds')
  }

  async function exclude(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await resolveConfigIdentity(appState, cache, loader)
    if (identity?.type !== 'map') return

    const map = cache.getMapById(identity.id)
    if (!map) return

    const paths = pathsToRelative(absolutePaths, root, 'exclude')
    await update(map, paths, '[REMOVE] user removes')
  }

  async function update(
    map: SliceMap,
    paths: NormalizedPaths,
    message: string
  ): Promise<void> {
    debug(message, paths)

    const nextMap = normalizeMap(map, paths, loader.getBehavior())

    debug('[UPDATE] before resolve', map)
    await cache.addMap(nextMap)
    debug('[UPDATE] after resolve', nextMap)

    if (appState.isActiveMap(nextMap.id)) {
      await applyEffectiveSlice()
    } else {
      updateTree()
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
      const excludes = loader.getFileExcludes()
      appState.setExcludes(excludes)
      await loader.setPersistedExclude(excludes)
    }
    appState.setActiveMap({ type: map.type, id: map.id })
    await applyEffectiveSlice()
  }
}