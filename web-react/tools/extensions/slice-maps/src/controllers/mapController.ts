import type { PathChoice, SliceMap } from '../types/core.types.ts';
import { createMap } from '../operations/create.ts';
import { renameMap } from '../operations/rename.ts';
import { resetMap } from '../operations/reset.ts';
import { normalizeMap } from '../normalize/slice.ts';
import { pathsToRelative } from '../normalize/pathsToRelative.ts';
import type { CompDeps } from '../types/controller.types.ts';
import { booleanQuestion } from '../operations/booleanQuestion.ts';
import { throwError } from '../utils/throwError.ts';

export type MapController = NonNullable<ReturnType<typeof createMapController>>
export function createMapController({
  root,
  sliceCache,
  appGet,
  conf,
  orchestrator,
  updateSliceTree
}: CompDeps
) {

  async function toggle(map: SliceMap): Promise<void> {
    await orchestrator.queRequest({
      type: 'map',
      id: map.id,
      doesActivate: !appGet.isActiveMap(map.id)
    })
  }

  async function create(): Promise<void> {
    const map = await createMap()
    if (!map) return

    await sliceCache.addMap(map)

    if (!conf.getActiveConfig()) {
      await conf.resolveConfigIdentity()
    }

    updateSliceTree()
  }

  async function remove(map: SliceMap): Promise<void> {
    const choice = await booleanQuestion(`Sure you want to delete ${map.name}?`)
    if (!choice) return

    await sliceCache.removeMap(map.id)

    if (conf.getActiveConfig()?.id === map.id) {
      await conf.resolveConfigIdentity()
    }

    if (appGet.isActiveMap(map.id)) {
      await orchestrator.queRequest({
        type: 'map',
        id: map.id,
        doesActivate: false
      })
    } else {
      updateSliceTree()
    }
  }

  async function rename(map: SliceMap): Promise<void> {
    const name = await renameMap()
    if (!name) return

    await sliceCache.renameMap(map.id, name)

    updateSliceTree()
  }

  async function reset(map: SliceMap): Promise<void> {
    const choice = await booleanQuestion(`Sure you want to reset ${map.name}?`)
    if (!choice) return

    const newMap = resetMap(map)
    await sliceCache.addMap(newMap)

    if (appGet.isActiveMap(map.id)) {
      await orchestrator.queRequest({
        type: 'map',
        id: map.id,
        doesActivate: true
      })
    } else {
      updateSliceTree()
    }
  }

  async function include(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await conf.resolveConfigIdentity()
    if (!identity) throwError('No map or filter available.')

    if (identity.type !== 'map') {
      throwError('Cannot include paths in a filter. Select a map instead.')
    }

    const map = sliceCache.getMapById(identity.id)
    if (!map) throwError('The selected map could not be found.')

    const paths = pathsToRelative(absolutePaths, root, 'include')
    await update(map, paths)
  }

  async function exclude(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await conf.resolveConfigIdentity()
    if (!identity) throwError('No map or filter available.')

    if (identity.type !== 'map') {
      throwError('Cannot exclude paths in a filter. Select a map instead.')
    }

    const map = sliceCache.getMapById(identity.id)
    if (!map) throwError('The selected map could not be found.')

    const paths = pathsToRelative(absolutePaths, root, 'exclude')
    await update(map, paths)
  }

  async function update(
    map: SliceMap,
    paths: PathChoice,
  ): Promise<void> {

    const nextMap = normalizeMap(map, paths)

    await sliceCache.addMap(nextMap)

    if (appGet.isActiveMap(nextMap.id)) {
      await orchestrator.queRequest({
        type: 'map',
        id: nextMap.id,
        doesActivate: true
      })
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
}