import type { ExcludeOrInclude, FilesAndFolders, SliceFilter } from '../types/core.types.ts';
import { createFilter } from '../operations/create.ts';
import { renameFilter } from '../operations/rename.ts';
import { resetFilter } from '../operations/reset.ts';
import { pathsToRelative } from '../normalize/pathsToRelative.ts';
import type { FilterControllerDeps } from '../types/controller.types.ts';
import { booleanQuestion } from '../operations/booleanQuestion.ts';
import { throwError } from '../utils/throwError.ts';
import { normalizeFilter } from '../normalize/slice.ts';
export type FilterController = ReturnType<typeof createFilterController>
export function createFilterController({
  root,
  conf,
  sliceCache,
  appGet,
  globber,
  orchestrator,
  tree,
}: FilterControllerDeps
) {


  async function toggle(filter: SliceFilter): Promise<void> {
    await orchestrator.queRequest({
      type: 'filter',
      id: filter.id,
      doesActivate: !appGet.isActiveFilter(filter.id)
    })
  }

  async function create(): Promise<void> {
    const filter = await createFilter()
    if (!filter) return

    await sliceCache.addFilter(filter)

    if (conf.getActiveConfig()) {
      tree.updateSliceTree()
      return
    }
    const activeConfigChanged = await conf.resolveConfigIdentity()
    if (activeConfigChanged.requiresUpdate) tree.update()
  }

  async function remove(filter: SliceFilter): Promise<void> {
    const choice = await booleanQuestion(`Sure you want to delete ${filter.name}?`)
    if (!choice) return

    await sliceCache.removeFilter(filter.id)

    const isActive = appGet.isActiveFilter(filter.id)

    const activeConfigChanged =
      conf.getActiveConfig()?.id === filter.id
        ? await conf.resolveConfigIdentity()
        : null

    if (isActive) {
      await orchestrator.queRequest({
        type: 'filter',
        id: filter.id,
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

  async function rename(filter: SliceFilter): Promise<void> {
    const name = await renameFilter()
    if (!name) return

    await sliceCache.renameFilter(filter.id, name)

    tree.updateWorkspaceTitle()
    tree.updateSliceTree()
  }

  async function reset(filter: SliceFilter): Promise<void> {
    const choice = await booleanQuestion(`Sure you want to reset ${filter.name}?`)
    if (!choice) return

    const newFilter = resetFilter(filter)
    await sliceCache.addFilter(newFilter)

    const isActive = appGet.isActiveFilter(filter.id)

    if (isActive) {
      await orchestrator.queRequest({
        type: 'filter',
        id: filter.id,
        doesActivate: true
      })
      return
    }
    if (conf.getActiveConfig()?.id === filter.id) {
      tree.update()
    } else {
      tree.updateSliceTree()
    }
  }

  // async function removeExclude(
  //   absolutePaths: string[]
  // ): Promise<void> {
  //   const { activeIdentity } = await conf.resolveConfigIdentity()

  //   if (activeIdentity?.type !== 'filter') {
  //     throwError('Cannot remove exclusions from a map. Select a filter instead.')
  //   }
  //   const filter = sliceCache.getFilterById(activeIdentity.id)
  //   if (!filter) throwError('The selected filter could not be found.')

  //   const paths = pathsToRelative(absolutePaths, root, 'remove')
  //   await update(filter, paths)
  // }

  async function addExclude(
    absolutePaths: string[]
  ): Promise<void> {
    const { activeIdentity } = await conf.resolveConfigIdentity()
    if (activeIdentity?.type !== 'filter') {
      throwError('Cannot add exclusions to a map. Select a filter instead.')
    }
    const filter = sliceCache.getFilterById(activeIdentity.id)
    if (!filter) throwError('The selected filter could not be found.')

    const paths = pathsToRelative(absolutePaths, root)
    await update(filter, paths, 'exclude')
  }

  async function update(
    filter: SliceFilter,
    input: FilesAndFolders,
    category: ExcludeOrInclude
  ): Promise<void> {
    const { filter: nextFilter, action } = normalizeFilter(filter, input, category)

    await sliceCache.addFilter(nextFilter)

    const isActive = appGet.isActiveFilter(filter.id)

    if (isActive) {
      await orchestrator.queRequest({
        type: 'filter',
        id: nextFilter.id,
        doesActivate: true,
        excludeCleanupInput: action.category === 'exclude'
          && action.operation === 'add'
          ? [...input.folders]
          : undefined
      })
      return
    }
    if (conf.getActiveConfig()?.id === filter.id) {
      tree.update()
    } else {
      tree.updateSliceTree()
    }
  }

  async function globAll(absolutePaths: string[]) {
    const { activeIdentity } = await conf.resolveConfigIdentity()
    if (activeIdentity?.type !== 'filter') {
      throwError('Cannot generate exclusion patterns for a map. Select a filter instead.')
    }

    const filter = sliceCache.getFilterById(activeIdentity.id)
    if (!filter) throwError('The selected filter could not be found.')

    const paths = globber.globMany(absolutePaths)
    if (!paths) {
      throwError('No matching files or folders found for the selected path(s).')
    }
    await update(filter, paths, 'exclude')
  }
  return {
    toggle,
    create,
    remove,
    rename,
    reset,
    addExclude,
    update,
    globAll
  }
}