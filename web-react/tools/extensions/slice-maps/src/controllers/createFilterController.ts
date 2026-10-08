import type { NormalizedPaths, Scope, SliceFilter } from '../types/dataStructure.types.ts';
import { createDebug } from '../utils/debug.ts';
import { showMsg } from '../utils/showMsg.ts';
import { createFilter } from '../processing/create.ts';
import { renameFilter } from '../processing/rename.ts';
import { resetFilter } from '../processing/reset.ts';
import { resolveFilter, resolveFilterRemoval } from '../core/normalizationApi.ts';

export function createFilterController({
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
  const debug = createDebug(output, "filterProvider")

  async function toggle(filter: SliceFilter): Promise<void> {
    if (appState.isActiveFilter(filter.id)) {
      await resolveDeactivation(filter)
    } else {
      await resolveActivation(filter)
    }
  }

  async function create(): Promise<void> {
    const filter = await createFilter(root)
    if (!filter) return

    await cache.addFilter(filter)

    treeChanged.fire()
    output.appendLine(`[slice maps] filter created ${filter.name}`)
  }

  async function remove(filter: SliceFilter): Promise<void> {
    await cache.removeFilter(filter.id)

    if (appState.isActiveFilter(filter.id)) {
      appState.removeActiveFilter(filter.id)

      if (appState.hasActiveSlice()) {
        await applyEffectiveSlice()
      } else {
        await resolveNothingActive()
      }
    }
    output.appendLine(`[slice maps] filter removed`)
  }

  async function rename(filter: SliceFilter): Promise<void> {
    const name = await renameFilter()
    if (!name) return

    await cache.renameFilter(filter.id, name)

    treeChanged.fire()
    output.appendLine(`[slice maps] filter rename: ${name}`)
  }

  async function reset(filter: SliceFilter): Promise<void> {
    const newFilter = resetFilter(filter)

    await cache.addFilter(newFilter)

    if (appState.isActiveFilter(filter.id)) {
      await applyEffectiveSlice()
    } else {
      treeChanged.fire()
    }
    showMsg(`[slice maps] filter reset ${newFilter.name}`)
  }

  async function removePathsFromFilter(
    filter: SliceFilter,
    resolvedPaths: NormalizedPaths
  ): Promise<void> {
    debug('[UNEXCLUDED] user reverts', resolvedPaths)
    const nextFilter = resolveFilterRemoval(filter, resolvedPaths)

    debug('[UNEXCLUDED] before resolve', filter)
    await cache.addFilter(nextFilter)
    debug('[UNEXCLUDED] after resolve', nextFilter)


    if (appState.isActiveFilter(nextFilter.id)) {
      await applyEffectiveSlice()
    } else {
      treeChanged.fire()
    }
  }

  async function addPathsToFilter(
    filter: SliceFilter,
    resolvedPaths: NormalizedPaths
  ): Promise<void> {
    debug('[EXCLUDE] user excludes', resolvedPaths)
    const nextFilter = resolveFilter(filter, resolvedPaths)

    debug('[EXCLUDE] before resolve', filter)
    await cache.addFilter(nextFilter)
    debug('[EXCLUDE] after resolve', nextFilter)

    if (appState.isActiveFilter(nextFilter.id)) {
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
    addPathsToFilter,
    removePathsFromFilter
  }

  async function resolveDeactivation(filter: SliceFilter) {
    appState.removeActiveFilter(filter.id)
    output.appendLine('[slice maps] filter deactivated')


    if (appState.hasActiveSlice()) {
      await applyEffectiveSlice()
      return
    }
    await resolveNothingActive()
  }

  async function resolveActivation(filter: SliceFilter) {
    if (!appState.hasActiveSlice()) {
      const localExclude = loader.getLocalExclude()
      cache.setLocalExclude(localExclude)
      await cache.setRecoveryExclude(localExclude)
      appState.setActiveConfig({ type: filter.type, id: filter.id })
    }
    appState.addActiveFilter(filter.id)
    await applyEffectiveSlice()
  }
}