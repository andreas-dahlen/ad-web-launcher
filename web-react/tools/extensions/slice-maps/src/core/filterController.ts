import type { NormalizedPaths, Scope, SliceFilter } from '../types/dataStructure.types.ts';
import { createDebug } from '../utils/debug.ts';
import { showMsg } from '../utils/showMsg.ts';
import { createFilter } from '../operations/create.ts';
import { renameFilter } from '../operations/rename.ts';
import { resetFilter } from '../operations/reset.ts';
import { normalizeFilter, normalizeFilterRemoval } from '../normalize/slice.ts';
import * as vscode from 'vscode'
import { normalizeUris } from '../normalize/uris.ts';
import { resolveActiveIdentity } from '../operations/identity.ts';
export type FilterController = NonNullable<ReturnType<typeof createFilterController>>
export function createFilterController({
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

    updateTree()
    output.appendLine(`[slice maps] filter created ${filter.name}`)
  }

  async function remove(filter: SliceFilter): Promise<void> {
    await cache.removeFilter(filter.id)

    if (appState.getActiveConfig()?.id === filter.id) {
      appState.setActiveConfig(undefined)
    }

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

    updateTree()
    output.appendLine(`[slice maps] filter rename: ${name}`)
  }

  async function reset(filter: SliceFilter): Promise<void> {
    const newFilter = resetFilter(filter)

    await cache.addFilter(newFilter)

    if (appState.isActiveFilter(filter.id)) {
      await applyEffectiveSlice()
    } else {
      updateTree()
    }
    showMsg(`[slice maps] filter reset ${newFilter.name}`)
  }

  async function removeExclude(
    uris: vscode.Uri[]
  ): Promise<void> {
    const identity = await resolveActiveIdentity(appState, cache)
    if (!identity) return
    updateTree()
    const filter = cache.getFilterById(identity.id)
    if (!filter) return

    const paths = normalizeUris(uris, root, 'exclude')
    await update(filter, paths, '[UNEXCLUDED] user removes', 'remove')
  }

  async function addExclude(
    uris: vscode.Uri[]
  ): Promise<void> {
    const identity = await resolveActiveIdentity(appState, cache)
    if (!identity) return
    updateTree()
    const filter = cache.getFilterById(identity.id)
    if (!filter) return

    const paths = normalizeUris(uris, root, 'exclude')
    await update(filter, paths, '[EXCLUDES] user excludes')
  }

  async function update(
    filter: SliceFilter,
    paths: NormalizedPaths,
    message: string,
    remove?: 'remove'
  ): Promise<void> {
    debug(message, paths)

    const nextFilter = remove === 'remove'
      ? normalizeFilterRemoval(filter, paths)
      : normalizeFilter(filter, paths)

    debug('[UPDATE] before resolve', filter)
    await cache.addFilter(nextFilter)

    debug('[UPDATE] after resolve', nextFilter)

    if (appState.isActiveFilter(nextFilter.id)) {
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
    addExclude,
    removeExclude,
    update
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