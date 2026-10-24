import type { PathChoice, SliceFilter } from '../types/core.types.ts';
import { createFilter } from '../operations/create.ts';
import { renameFilter } from '../operations/rename.ts';
import { resetFilter } from '../operations/reset.ts';
import { normalizeFilter, normalizeFilterRemoval } from '../normalize/slice.ts';
import { pathsToRelative } from '../normalize/pathsToRelative.ts';
import type { FilterControllerDeps } from '../types/controller.types.ts';
import { booleanQuestion } from '../operations/booleanQuestion.ts';
import { throwError } from '../utils/throwError.ts';
export type FilterController = ReturnType<typeof createFilterController>
export function createFilterController({
  root,
  conf,
  sliceCache,
  appGet,
  globber,
  orchestrator,
  updateSliceTree,
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
    }

    updateSliceTree()
  }

  async function remove(filter: SliceFilter): Promise<void> {
    const choice = await booleanQuestion(`Sure you want to delete ${filter.name}?`)
    if (!choice) return

    await sliceCache.removeFilter(filter.id)

    if (conf.getActiveConfig()?.id === filter.id) {
      await conf.resolveConfigIdentity()
    }

    if (appGet.isActiveFilter(filter.id)) {
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

    if (appGet.isActiveFilter(filter.id)) {
      await orchestrator.queRequest({
        type: 'filter',
        id: filter.id,
        doesActivate: true
      })
    } else {
      updateSliceTree()
    }
  }

  async function removeExclude(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await conf.resolveConfigIdentity()
    if (!identity) throwError('No map or filter available.')

    if (identity.type !== 'filter') {
      throwError('Cannot remove exclusions from a map. Select a filter instead.')
    }

    const filter = sliceCache.getFilterById(identity.id)
    if (!filter) throwError('The selected filter could not be found.')

    const paths = pathsToRelative(absolutePaths, root, 'remove')
    await update(filter, paths)
  }

  async function addExclude(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await conf.resolveConfigIdentity()
    if (!identity) throwError('No map or filter available.')

    if (identity.type !== 'filter') {
      throwError('Cannot add exclusions to a map. Select a filter instead.')
    }

    const filter = sliceCache.getFilterById(identity.id)
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

    if (appGet.isActiveFilter(nextFilter.id)) {
      await orchestrator.queRequest({
        type: 'filter',
        id: nextFilter.id,
        doesActivate: true
      })
    } else {
      updateSliceTree()
    }
  }

  async function globAll(absolutePaths: string[]) {
    const identity = await conf.resolveConfigIdentity()
    if (!identity) throwError('No map or filter available.')

    if (identity.type !== 'filter') {
      throwError('Cannot generate exclusion patterns for a map. Select a filter instead.')
    }

    const filter = sliceCache.getFilterById(identity.id)
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