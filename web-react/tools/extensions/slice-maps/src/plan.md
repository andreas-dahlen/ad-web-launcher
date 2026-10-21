# 🗒️ Slice Maps — Backlog

## 1. UX Improvements

* [ ] Show explicit include/exclude counts for each map in workspace-configuration tree.
* [ ] Refine icons for all six semantic states, especially implicit states.
* [x] Replace text with icons where it improves menu clarity.

* [ ] Add automatic glob exclusions.
  * Consider converting selected paths into patterns such as `**/tsconfig.json`.
  * Decide whether this should be automatic, configurable, or an explicit action.
  * Ensure the behavior fits the existing recursive/preserve setting.
  * should it support keybinding, files and folders and the whole shebang.

* [ ] Add confirmation dialogs for destructive actions, primarily deleting maps and filters.
* [ ] Improve user-facing VS Code messages for important actions.
  * Provide useful feedback for successful and unsuccessful operations.
  * Avoid unnecessary notifications for routine operations.

* [ ] Clean up diagnostic output.
  * Remove noisy `output.appendLine()` calls.
  * Remove redundant debugging output, including unnecessary debug-flagged logging.
  * Retain useful diagnostics, especially for errors and recovery.


## 2. Tree Updates & Performance

* [x] Preserve expanded tree state across refreshes.
* [x] Collapse the file tree by default on startup — no longer relevant.
* [ ] Investigate visibility-aware updates.

  * Consider deferring visual refreshes for invisible trees.
  * Keep configuration and resolution state up to date regardless of visibility.

* [ ] Profile tree recalculation and refresh costs before optimizing update granularity.
  * Currently, recalculating the tree is reasonable given inherited rules and semantic dependencies.
  * Let VS Code handle presentation updates where practical.
  * Avoid implementing complex granular updates without evidence of a performance problem.

## 3. File-System Traversal & Watching

* [x] Add configurable traversal-stop folder names.

* [ ] Investigate VS Code filesystem APIs vs. `node:fs`.

  * Evaluate `workspace.fs` and VS Code's filesystem watcher APIs.
  * Consider compatibility with non-local workspaces.
  * Measure potential benefits before committing to a larger refactor.

* [ ] Add filesystem watching and change notifications.

  * Keep the workspace tree synchronized with filesystem changes.
  * Investigate VS Code's native watcher API.
  * Determine when a full tree refresh is necessary.

## 4. Configuration Watching

* [ ] Watch for external changes to Slice Maps configuration.
  * Reload or reconcile cached configuration when files change.
  * Handle external changes without leaving application state inconsistent.
  * Avoid unnecessary tree refreshes when possible.

* [ ] Review startup error handling.
  * Wrap startup in appropriate error handling.
  * Report useful diagnostics when initialization or recovery fails.
  * Avoid registering functionality that depends on unsuccessful initialization.

**Note:** Watching external changes to VS Code's exclusion configuration is not currently considered necessary. The existing activation flow captures the original exclusions when transitioning from an inactive state.

## 5. Search Exclusions

* [ ] Add optional integration with `search.exclude`, alongside `files.exclude`.

  * Decide between a static user setting and a runtime toggle.
  * Determine whether Slice Maps should mirror its effective exclusions into `search.exclude`.
  * Preserve unrelated user configuration.
  * Ensure users can still search files they have chosen to hide from Explorer, unless they explicitly opt into excluding them from search.

## 6. Recovery & State Management

* [ ] Verify startup recovery and rapid activation/deactivation edge cases. //rapid activation/deactivation seems to save the wrong data in local or/and persisted state resulting in a broken state where the user has to manually delete the persisted state to recover.

  * Test recovery after a crash or unexpected shutdown.
  * Test recovery after rapid activation and deactivation of Slice Maps.
  * Ensure that the application can recover gracefully without losing user configuration.

## 7. Deferred / Probably Unnecessary
* [ ] Reconsider granular tree updates only if profiling demonstrates a meaningful performance problem.

---

## Suggested Order

1. Implement automatic glob exclusions.
2. Decide the behavior and configuration model for `search.exclude`.
3. Improve user-facing messages and add confirmation for destructive actions.
4. Clean up noisy diagnostic output.
5. Add startup error handling.
6. Implement configuration watching.
7. Investigate filesystem watching and the VS Code filesystem APIs.
8. Profile tree updates and traversal before considering performance refactors.
9. Verify recovery edge cases and finalize the restore-to-no-slice action.

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
