# 🗒️ Slice Maps — Backlog

## 1. UX Improvements

* [ ] Show explicit include/exclude counts for each map.
* [ ] Refine icons for all six semantic states, especially implicit states.
* [ ] Replace text with icons where it improves menu clarity.
* [ ] Explore folder-level counts of explicit rules in the configuration tree.

  * Decide between direct rules vs. descendants.
  * Decide whether to count rules or affected paths.
  * Decide whether to separate includes and excludes.

## 2. Custom Tree Keyboard Input

* [ ] Fix keyboard bindings in the custom configuration tree.
* [ ] Ensure focus and command routing work consistently across both tree views.
* [ ] Keep input handling shared rather than duplicating logic.

## 3. Tree Updates & Performance

* [ ] Avoid refreshing unaffected nodes where practical.
* [ ] Defer visual refreshes for invisible trees.
* [ ] Keep configuration and resolution state up to date regardless of visibility.
* [ ] Investigate visibility-aware updates before implementing granular node updates.

## 4. File-System Traversal

* [ ] Investigate VS Code filesystem APIs vs. `node:fs`.
* [ ] Avoid traversing hidden or excluded folders unnecessarily.
* [ ] Preserve traversal-stop folders as leaf nodes.
* [ ] Consider configurable traversal-stop folder names.
* [ ] Keep workspace tree behavior consistent with Explorer.
* [ ] Measure performance before committing to a traversal rewrite.

## 5. Search Exclusions

* [ ] Add an optional setting to apply Slice exclusions to `search.exclude`, alongside `files.exclude`.

## 6. Other Backlog Items

* [ ] Preserve expanded tree state across refreshes.
* [ ] Collapse the file tree by default on startup.
* [ ] Add file watching and change notifications.
* [ ] Investigate missing-map/filter resolution cases.
* [ ] Review local exclusion and recovery state.
* [ ] Investigate Git ignore handling.

## Suggested Order

1. Finish tree behavior and expansion handling.
2. Refine icons and small UI details.
3. Fix custom-tree keyboard input.
4. Add explicit include/exclude counts.
5. Investigate visibility-aware updates.
6. Add the `search.exclude` setting.
7. Explore subtree counts and granular updates.
8. Investigate filesystem traversal improvements.

## Architectural Notes

* **Input tree:** Manages maps, filters, and configuration actions.
* **Configuration tree:** Displays and helps users understand the active configuration.
* **Shared state:** Both trees can share underlying data without sharing presentation logic.
* **State correctness:** Visibility may defer rendering updates, but must not prevent configuration or resolution state from updating.
* **Separation of concerns:** Keep configuration, resolution, semantic outcomes, and rendering distinct.
