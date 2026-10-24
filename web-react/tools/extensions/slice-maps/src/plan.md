# 🗒️ Slice Maps — Backlog

## 1. Search Exclusions

* [ ] Evaluate optional integration with `search.exclude`, alongside `files.exclude`.

  * Decide between a static user setting and a runtime toggle.
  * Determine whether Slice Maps should mirror its effective exclusions into `search.exclude`.
  * Preserve unrelated user configuration.
  * Keep Explorer visibility and search exclusion behavior independent unless the user opts into linking them.

## 2. Tree Updates & Performance

### Performance Investigation

* [ ] Profile tree recalculation and refresh costs before optimizing update granularity.

  * Measure the cost of semantic recalculation, tree construction, and refreshes.
  * Let VS Code handle presentation updates where practical.
  * Avoid complex granular updates without evidence of a meaningful performance problem.

### Deferred Optimization

* [ ] Consider visibility-aware updates if profiling identifies a worthwhile improvement.

  * Consider deferring visual refreshes for invisible trees.
  * Keep configuration and resolution state up to date regardless of visibility.
  * Ensure deferred presentation updates are applied when necessary.

* [ ] Consider granular tree updates only if profiling demonstrates a meaningful performance problem.

## 3. File-System Traversal & Watching

### Initial Activation Performance

* [ ] Investigate the cost of the first map activation.

  * Measure filesystem traversal and semantic resolution separately.
  * Compare initial activation with subsequent activations using the local cache.
  * Determine whether persisting traversal results would meaningfully improve performance.
  * Account for cache invalidation when files or configuration change.
  * Persist traversal results only if measurements justify the added complexity.

### Filesystem API Compatibility

* [ ] Investigate VS Code filesystem APIs versus `node:fs`.

  * Evaluate `workspace.fs` and VS Code's filesystem watcher APIs.
  * Consider compatibility with remote and non-local workspaces.
  * Identify concrete benefits before committing to a broader refactor.

### Filesystem Synchronization

* [ ] Investigate filesystem watching and change notifications.

  * Keep the workspace tree synchronized with filesystem changes.
  * Determine whether filesystem changes can invalidate cached traversal results.
  * Investigate VS Code's native watcher API.
  * Determine when a full tree refresh is necessary.
  * Avoid redundant refreshes when multiple filesystem events occur together.

## 4. Configuration Watching

* [ ] Investigate watching for external changes to Slice Maps configuration.

  * Reload or reconcile cached configuration when relevant files change.
  * Prevent external changes from leaving application state inconsistent.
  * Avoid unnecessary tree refreshes.
  * Determine whether external configuration editing is common enough to justify the added complexity.

**Note:** Watching external changes to VS Code's exclusion configuration is not currently considered necessary. The existing activation flow captures the original exclusions when transitioning from an inactive state.

---

## Suggested Order

1. Investigate initial map-activation performance.
2. Decide whether `search.exclude` integration is worthwhile.
3. Investigate filesystem synchronization and watching.
4. Evaluate VS Code filesystem APIs if broader workspace compatibility is a goal.
5. Consider external configuration watching if a concrete need arises.
6. Profile tree updates before considering granular or visibility-aware optimizations.

---

## Architectural Notes

* **Input tree:** Manages maps, filters, and configuration actions.
* **Configuration tree:** Displays and helps users understand the active configuration.
* **Shared state:** Both trees can share underlying data without sharing presentation logic.
* **State correctness:** Visibility may defer rendering updates, but must not prevent configuration or resolution state from updating.
* **Separation of concerns:** Keep configuration, resolution, semantic outcomes, and rendering distinct.
* **Recovery ownership:** The native backup handler owns recovery persistence and synchronization; the orchestrator coordinates when recovery operations occur.
* **Tree recalculation:** Full semantic recalculation is acceptable while inherited rules and dependencies make incremental recalculation disproportionately complex.
* **Filesystem architecture:** Investigate the benefits of VS Code's filesystem APIs before committing to a broad migration.
* **Performance optimization:** Measure actual costs before introducing persistent caches, granular updates, or visibility-aware refreshes.
* **Scope control:** Investigations do not automatically imply implementation. Retain deferred tasks only when a concrete need justifies the additional complexity.
