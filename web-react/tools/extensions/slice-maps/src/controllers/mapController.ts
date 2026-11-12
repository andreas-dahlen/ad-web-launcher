import type { PathChoice, SliceMap } from '../types/core.types.ts';
import { createMap } from '../operations/create.ts';
import { renameMap } from '../operations/rename.ts';
import { resetMap } from '../operations/reset.ts';
import { pathsToRelative } from '../normalize/pathsToRelative.ts';
import type { CompDeps } from '../types/controller.types.ts';
import { booleanQuestion } from '../operations/booleanQuestion.ts';
import { throwError } from '../utils/throwError.ts';
import { normalizeMap } from '../normalize/slice.ts';

export type MapController = NonNullable<ReturnType<typeof createMapController>>
export function createMapController({
  root,
  sliceCache,
  appGet,
  conf,
  orchestrator,
  tree
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

    if (conf.getActiveConfig()) {
      tree.updateSliceTree()
    } else {
      const activeConfigChanged = await conf.resolveConfigIdentity()
      if (activeConfigChanged.requiresUpdate) tree.update()
    }
  }

  async function remove(map: SliceMap): Promise<void> {
    const choice = await booleanQuestion(`Sure you want to delete ${map.name}?`)
    if (!choice) return

    await sliceCache.removeMap(map.id)

    const isActive = appGet.isActiveMap(map.id)

    const activeConfigChanged =
      conf.getActiveConfig()?.id === map.id
        ? await conf.resolveConfigIdentity()
        : null

    if (isActive) {
      await orchestrator.queRequest({
        type: 'map',
        id: map.id,
        doesActivate: false
      })
    } else if (activeConfigChanged?.requiresUpdate) {
      tree.update()
    } else {
      tree.updateSliceTree()
    }
  }
  async function rename(map: SliceMap): Promise<void> {
    const name = await renameMap()
    if (!name) return

    await sliceCache.renameMap(map.id, name)

    tree.updateWorkspaceTitle()
    tree.updateSliceTree()
  }

  async function reset(map: SliceMap): Promise<void> {
    const choice = await booleanQuestion(`Sure you want to reset ${map.name}?`)
    if (!choice) return

    const newMap = resetMap(map)
    await sliceCache.addMap(newMap)

    const isActive = appGet.isActiveMap(map.id)

    if (isActive) {
      await orchestrator.queRequest({
        type: 'map',
        id: map.id,
        doesActivate: true
      })
    } else {
      tree.updateSliceTree()
    }
  }

  async function include(
    absolutePaths: string[]
  ): Promise<void> {
    const configData = await conf.resolveConfigIdentity()
    if (!configData) throwError('No map or filter available.')
    const { activeIdentity } = configData

    if (activeIdentity?.type !== 'map') {
      throwError('Cannot include paths in a filter. Select a map instead.')
    }

    const map = sliceCache.getMapById(activeIdentity.id)
    if (!map) throwError('The selected map could not be found.')

    const paths = pathsToRelative(absolutePaths, root, 'include')
    await update(map, paths)
  }

  async function exclude(
    absolutePaths: string[]
  ): Promise<void> {
    const configData = await conf.resolveConfigIdentity()
    if (!configData) throwError('No map or filter available.')
    const { activeIdentity } = configData

    if (activeIdentity?.type !== 'map') {
      throwError('Cannot exclude paths in a filter. Select a map instead.')
    }

    const map = sliceCache.getMapById(activeIdentity.id)
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

    const isActive = appGet.isActiveMap(map.id)


    if (isActive) {
      await orchestrator.queRequest({
        type: 'map',
        id: nextMap.id,
        doesActivate: true,
        excludeCleanupInput: paths.action === 'exclude'
          ? [...paths.folders]
          : undefined
      })
    } else if (conf.getActiveConfig()?.id === map.id) {
      tree.update()
    } else {
      tree.updateSliceTree()
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