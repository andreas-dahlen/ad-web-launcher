import type { PathChoice, SliceFilter } from '../types/core.types.ts';
import { showMsg } from '../utils/showMsg.ts';
import { createFilter } from '../operations/create.ts';
import { renameFilter } from '../operations/rename.ts';
import { resetFilter } from '../operations/reset.ts';
import { normalizeFilter, normalizeFilterRemoval } from '../normalize/slice.ts';
import { pathsToRelative } from '../normalize/pathsToRelative.ts';
import type { CompDeps } from '../types/controller.types.ts';
export type FilterController = NonNullable<ReturnType<typeof createFilterController>>
export function createFilterController({
  root,
  conf,
  sliceCache,
  appGet,
  orchestrator,
  updateSliceTree,
}: CompDeps
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
    showMsg(`[slice maps] filter reset ${newFilter.name}`)
  }

  async function removeExclude(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await conf.resolveConfigIdentity()
    if (identity?.type !== 'filter') return

    const filter = sliceCache.getFilterById(identity.id)
    if (!filter) return

    const paths = pathsToRelative(absolutePaths, root, 'exclude')
    await update(filter, paths, 'remove')
  }

  async function addExclude(
    absolutePaths: string[]
  ): Promise<void> {
    const identity = await conf.resolveConfigIdentity()
    if (identity?.type !== 'filter') return

    const filter = sliceCache.getFilterById(identity.id)
    if (!filter) return

    const paths = pathsToRelative(absolutePaths, root, 'exclude')
    await update(filter, paths, 'add')
  }

  async function update(
    filter: SliceFilter,
    paths: PathChoice,
    remove: 'remove' | 'add'
  ): Promise<void> {
    const nextFilter = remove === 'remove'
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

  return {
    toggle,
    create,
    remove,
    rename,
    reset,
    addExclude,
    removeExclude,
    update
  }
}