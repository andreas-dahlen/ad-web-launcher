import type { PathChoice, SliceFilter } from '../types/core.types.ts';
import { createFilter } from '../operations/create.ts';
import { renameFilter } from '../operations/rename.ts';
import { resetFilter } from '../operations/reset.ts';
import { pathsToRelative } from '../normalize/pathsToRelative.ts';
import type { FilterControllerDeps } from '../types/controller.types.ts';
import { booleanQuestion } from '../operations/booleanQuestion.ts';
import { throwError } from '../utils/throwError.ts';
import { normalizeFilter, normalizeFilterRemoval } from '../normalize/slice.ts';
export type FilterController = ReturnType<typeof createFilterController>
export function createFilterController({
  root,
  conf,
  sliceCache,
  appGet,
  globber,
  orchestrator,
  updateSliceTree,
  tree,
  updateWorkspaceTree
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

    if (!conf.getActiveConfig()) {
      await conf.resolveConfigIdentity()
      tree.update()
      updateWorkspaceTree()
    }
    updateSliceTree()
  }

  async function remove(filter: SliceFilter): Promise<void> {
    const choice = await booleanQuestion(`Sure you want to delete ${filter.name}?`)
    if (!choice) return

    await sliceCache.removeFilter(filter.id)

    const isActive = appGet.isActiveFilter(filter.id)

    if (conf.getActiveConfig()?.id === filter.id) {
      const configData = await conf.resolveConfigIdentity()

      if (!isActive && (!configData || configData.requiresUpdate)) {
        tree.update()
        updateWorkspaceTree()
      }
    }

    if (isActive) {
      await orchestrator.queRequest({
        type: 'filter',
        id: filter.id,
        doesActivate: false
      })
    } else {
      updateSliceTree()
    }
  }

  async function rename(filter: SliceFilter): Promise<void> {
    const name = await renameFilter()
    if (!name) return

    await sliceCache.renameFilter(filter.id, name)

    updateSliceTree()
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
    } else {
      updateSliceTree()
    }
    if (isActive || conf.getActiveConfig()?.id !== filter.id) return
    tree.update()
    updateWorkspaceTree()
  }

  async function removeExclude(
    absolutePaths: string[]
  ): Promise<void> {
    const configData = await conf.resolveConfigIdentity()
    if (!configData) throwError('No map or filter available.')
    const { activeIdentity } = configData

    if (activeIdentity.type !== 'filter') {
      throwError('Cannot remove exclusions from a map. Select a filter instead.')
    }

    const filter = sliceCache.getFilterById(activeIdentity.id)
    if (!filter) throwError('The selected filter could not be found.')

    const paths = pathsToRelative(absolutePaths, root, 'remove')
    await update(filter, paths)
  }

  async function addExclude(
    absolutePaths: string[]
  ): Promise<void> {
    const configData = await conf.resolveConfigIdentity()
    if (!configData) throwError('No map or filter available.')
    const { activeIdentity } = configData

    if (activeIdentity.type !== 'filter') {
      throwError('Cannot add exclusions to a map. Select a filter instead.')
    }

    const filter = sliceCache.getFilterById(activeIdentity.id)
    if (!filter) throwError('The selected filter could not be found.')

    const paths = pathsToRelative(absolutePaths, root, 'exclude')
    await update(filter, paths)
  }

  async function update(
    filter: SliceFilter,
    paths: PathChoice,
  ): Promise<void> {
    const nextFilter = paths.action === 'remove'
      ? normalizeFilterRemoval(filter, paths)
      : normalizeFilter(filter, paths)

    await sliceCache.addFilter(nextFilter)

    const isActive = appGet.isActiveFilter(filter.id)

    if (!isActive && conf.getActiveConfig()?.id === filter.id) {
      tree.update()
      updateWorkspaceTree()
    }

    if (isActive) {
      await orchestrator.queRequest({
        type: 'filter',
        id: nextFilter.id,
        doesActivate: true,
        excludeCleanupInput: paths.action === 'exclude'
          ? [...paths.folders]
          : undefined
      })
    } else {
      updateSliceTree()
    }
  }

  async function globAll(absolutePaths: string[]) {
    const configData = await conf.resolveConfigIdentity()
    if (!configData) throwError('No map or filter available.')
    const { activeIdentity } = configData
    if (activeIdentity.type !== 'filter') {
      throwError('Cannot generate exclusion patterns for a map. Select a filter instead.')
    }

    const filter = sliceCache.getFilterById(activeIdentity.id)
    if (!filter) throwError('The selected filter could not be found.')

    const paths = globber.globMany(absolutePaths)
    if (!paths) {
      throwError('No matching files or folders found for the selected path(s).')
    }

    await update(filter, paths)
  }
  return {
    toggle,
    create,
    remove,
    rename,
    reset,
    addExclude,
    removeExclude,
    update,
    globAll
  }
}