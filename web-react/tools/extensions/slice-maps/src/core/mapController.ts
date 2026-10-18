import type { PathChoice, Scope, SliceMap } from '../types/core.types.ts';
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
  sliceCache,
  output,
  appState,
  updateSliceTree,
  applyEffectiveSlice,
  resolveNothingActive
}: Scope
) {
  const debug = createDebug(output, "mapProvider")
  const debugTrack = createDebug(output, "flowTracker")

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

    await sliceCache.addMap(map)

    if (!appState.getActiveConfig()) {
      await resolveConfigIdentity(appState, sliceCache, loader)
    }

    updateSliceTree()
    output.appendLine(`[slice maps] map created ${map.name}`)
  }

  async function remove(map: SliceMap): Promise<void> {
    await sliceCache.removeMap(map.id)

    if (appState.getActiveConfig()?.id === map.id) {
      await resolveConfigIdentity(appState, sliceCache, loader)
    }

    if (appState.isActiveMap(map.id)) {
      appState.setActiveMap(undefined)

      if (appState.hasActiveFilter()) {
        await applyEffectiveSlice()
      } else {
        await resolveNothingActive()
      }
    } else {
      updateSliceTree()
    }
    output.appendLine(`[slice maps] map removed`)
  }

  async function rename(map: SliceMap): Promise<void> {
    const name = await renameMap()
    if (!name) return

    await sliceCache.renameMap(map.id, name)

    updateSliceTree()
    output.appendLine(`[slice maps] map rename: ${name}`)
  }

  async function reset(map: SliceMap): Promise<void> {
    const newMap = resetMap(map)
    await sliceCache.addMap(newMap)

    if (appState.isActiveMap(map.id)) {
      await applyEffectiveSlice()
    } else {
      updateSliceTree()
    }
    showMsg(`[slice maps] map reset ${newMap.name}`)
  }

  async function include(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await resolveConfigIdentity(appState, sliceCache, loader)
    if (identity?.type !== 'map') return

    const map = sliceCache.getMapById(identity.id)
    if (!map) return

    const paths = pathsToRelative(absolutePaths, root, 'include')
    debugTrack('[INCLUDE]', paths)
    await update(map, paths, '[ADD] user adds')
  }

  async function exclude(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await resolveConfigIdentity(appState, sliceCache, loader)
    if (identity?.type !== 'map') return

    const map = sliceCache.getMapById(identity.id)
    if (!map) return

    const paths = pathsToRelative(absolutePaths, root, 'exclude')
    debugTrack('[EXCLUDE]', paths)
    await update(map, paths, '[REMOVE] user removes')
  }

  async function update(
    map: SliceMap,
    paths: PathChoice,
    message: string
  ): Promise<void> {
    debug(message, paths)

    const nextMap = normalizeMap(map, paths, loader.getBehavior())
    debugTrack('[NORMALIZED]', nextMap)
    debug('[UPDATE] before resolve', map)
    await sliceCache.addMap(nextMap)
    debug('[UPDATE] after resolve', nextMap)

    if (appState.isActiveMap(nextMap.id)) {
      await applyEffectiveSlice()
    } else {
      updateSliceTree()
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