import type { ExcludeOrInclude, FilesAndFolders, SliceMap } from '../types/core.types.ts';
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
      return
    }
    const activeConfigChanged = await conf.resolveConfigIdentity()
    if (activeConfigChanged.requiresUpdate) tree.update()
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
      return
    }
    if (activeConfigChanged?.requiresUpdate
      || !activeConfigChanged?.activeIdentity) {
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
      return
    }
    if (conf.getActiveConfig()?.id === map.id) {
      tree.update()
    } else {
      tree.updateSliceTree()
    }
  }

  async function include(
    absolutePaths: string[]
  ): Promise<void> {
    const { activeIdentity } = await conf.resolveConfigIdentity()
    if (activeIdentity?.type !== 'map') {
      throwError('Cannot include paths in a filter. Select a map instead.')
    }
    const map = sliceCache.getMapById(activeIdentity.id)
    if (!map) throwError('The selected map could not be found.')

    const paths = pathsToRelative(absolutePaths, root)
    await update(map, paths, 'include')
  }

  async function exclude(
    absolutePaths: string[]
  ): Promise<void> {
    const { activeIdentity } = await conf.resolveConfigIdentity()
    if (activeIdentity?.type !== 'map') {
      throwError('Cannot exclude paths in a filter. Select a map instead.')
    }
    const map = sliceCache.getMapById(activeIdentity.id)
    if (!map) throwError('The selected map could not be found.')

    const paths = pathsToRelative(absolutePaths, root)
    await update(map, paths, 'exclude')
  }

  async function update(
    map: SliceMap,
    input: FilesAndFolders,
    category: ExcludeOrInclude,
  ): Promise<void> {
    const { map: nextMap, action } = normalizeMap(map, input, category)
    await sliceCache.addMap(nextMap)

    const isActive = appGet.isActiveMap(map.id)

    if (isActive) {
      await orchestrator.queRequest({
        type: 'map',
        id: nextMap.id,
        doesActivate: true,
        excludeCleanupInput: action.category === 'exclude'
          && action.operation === 'add'
          ? [...input.folders]
          : undefined
      })
      return
    }
    if (conf.getActiveConfig()?.id === map.id) {
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