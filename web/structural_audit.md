# Structural Audit Report

**Date:** 2026-03-02  
**Scope:** Full codebase — `web/src/`, `android/app/`, build tooling  
**Type:** System cleanup and structural integrity analysis  
**Status:** Evidence-backed analysis only. No speculative redesign.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Findings](#findings)
   - [A. Dead Code](#a-dead-code)
   - [B. Structural Redundancy](#b-structural-redundancy)
   - [C. Boundary Violations](#c-boundary-violations)
   - [D. Accidental Complexity](#d-accidental-complexity)
   - [E. State Ownership Audit](#e-state-ownership-audit)
   - [F. Pipeline Integrity Review](#f-pipeline-integrity-review)
3. [Quick Wins](#quick-wins)
4. [High-Leverage Refactors](#high-leverage-refactors)
5. [Areas That Are Structurally Strong](#areas-that-are-structurally-strong)

---

## Architecture Overview

The system implements a gesture-driven Android launcher built with Vue 3 + Vite, deployed as a single HTML file into an Android WebView. The interaction pipeline follows a layered model:

```
Pointer Event (bridge.js)
  → Interpreter (interpreter.js + intentUtils.js)
    → Solver (carouselSolver / sliderSolver / dragSolver)
      → State Mutation (stateManager.js → *State.js)
        → Renderer (renderer.js — DOM attributes + CustomEvent dispatch)
```

**Pipeline orchestrator:** `pipeline.js` sequences all layers in a single synchronous call. State files are Vue `reactive()` objects consumed by components via `readonly(computed(...))` views. The renderer is the sole DOM mutation boundary for gesture feedback attributes. Components are render-only — they bind styles from reactive state and emit events when they receive `reaction` CustomEvents.

---

## Findings

---

### A. Dead Code

---

#### A1. `touchVisuals.js` — Entire Module Unused

- **Category:** Dead Code
- **Description:** `src/animations/touchVisuals.js` exports five functions (`press`, `release`, `cancel`, `swipe`, `swipeCommit`) that directly mutate `el.style` properties. No file in the codebase imports from this module — zero consumers.
- **Evidence:** `grep` for `touchVisuals` across all files returns zero import matches. The file performs direct DOM style mutations (`el.style.setProperty`), which conflicts with the architectural rule that the renderer is the sole DOM mutation boundary.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Invariant Protection — removes a latent DOM mutation pathway outside the renderer boundary.
- **Recommended Action:** Delete `src/animations/touchVisuals.js`.

---

#### A2. `debugLagTime()` — Exported But Never Imported

- **Category:** Dead Code
- **Description:** `debugLagTime()` in `src/debug/functions.js` is exported but never imported by any module. It accumulates `performance.now()` timestamps into a module-level array and logs deltas. The Kotlin-side equivalent (`GestureDebug.kt`) has already been deleted per the Kotlin audit.
- **Evidence:** `grep` for `import.*debugLagTime` returns zero matches. Only occurrences are the definition and documentation references in `kotlin_audit.md`.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Delete the `debugLagTime` function and the `timeList` module variable from `src/debug/functions.js`.

---

#### A3. `.touch-area` CSS Class — Defined But Never Used

- **Category:** Dead Code
- **Description:** `src/styles/touch.css` defines a `.touch-area` class that sets `--touch-bg`, `background-color`, `transition`, `user-select`, and `touch-action`. No element in any template or component uses the `touch-area` class.
- **Evidence:** `grep` for `touch-area` returns only the definition in `touch.css`. Zero matches in any `.vue` template.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Delete `src/styles/touch.css` or empty its contents. Remove the `@import './touch.css'` line from `main.css`.

---

#### A4. `--gpu-hint` CSS Variable — Defined But Never Referenced

- **Category:** Dead Code
- **Description:** `src/styles/variables.css` defines `--gpu-hint: translateZ(0);`. No CSS or inline style references this variable. Components that need GPU compositing use `translateZ(0)` directly.
- **Evidence:** `grep` for `--gpu-hint` returns only the definition. Zero consumers.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Delete the `--gpu-hint` line from `variables.css`.

---

#### A5. `--index-0`, `--index-1`, `--index-2` CSS Variables — Unused

- **Category:** Dead Code
- **Description:** `variables.css` defines `--index-0: blue`, `--index-1: green`, `--index-2: orange`. No CSS or component references these variables.
- **Evidence:** No `grep` matches for `--index-0`, `--index-1`, `--index-2` outside the definition.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Delete these three lines from `variables.css`.

---

#### A6. `.phone` CSS Block in `Root.vue` — Dead Style

- **Category:** Dead Code
- **Description:** `Root.vue` has a `.phone` scoped style block, but the `<div class="phone">` wrapper is commented out in the template. The style is unreachable.
- **Evidence:** `Root.vue` template uses only `.app-content`. `.phone` div is present only in HTML comments.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Delete the `.phone` style block from `Root.vue`.

---

#### A7. `.label` CSS in `mid1.vue` — Dead Style

- **Category:** Dead Code
- **Description:** `scenes/mirrorLanes/mid1.vue` defines a `.label` CSS class, but the corresponding `<div class="label">` is commented out in the template.
- **Evidence:** Template contains `<!-- <div class="label">MID · A</div> -->`. Style `.label` has no live target.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Delete the `.label` style block from `mid1.vue`.

---

#### A8. Dead CSS Class Selectors in `bottom1.vue` and `mid3.vue`

- **Category:** Dead Code
- **Description:** `mirrorLanes/bottom1.vue` defines `.a { opacity: 100; pointer-events: none; }`, but its root div is `<div class="scene-root">` with no `.a` class. Style never applied. Similarly, `mirrorLanes/mid3.vue` defines `.c { opacity: 100%; }` but has no element with class `c` (root is `<DragOrSlot>`).
- **Evidence:** Template markup in both files lacks the matching class.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Remove dead style blocks from both files.

---

#### A9. Commented-Out Imports in `main.js` — Ghost References

- **Category:** Dead Code
- **Description:** `main.js` contains commented-out imports for `initPlatformBridge` from `./interaction/input/inputSource` and `exportCSS` from `./config/exportSettings`. Neither module exists in the codebase. These are remnants of a deleted architecture.
- **Evidence:** `grep` for `inputSource` and `exportSettings` shows matches only in comments. No corresponding files exist.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Clarity Improvement
- **Recommended Action:** Delete the four commented-out lines from `main.js`.

---

#### A10. `2D.vue` and `WallD.vue` — Commented-Out Scene Files

- **Category:** Dead Code
- **Description:** `scenes/mid/2D.vue` and `scenes/wallpaper/WallD.vue` are fully working files that are excluded from the application via commented-out imports in `laneIndex.js`. They contain drag-type `SwipeLane` components with hardcoded snap values. If these are prototyping artifacts, they should be explicitly archived or deleted.
- **Evidence:** `laneIndex.js` lines: `// import D2 from './mid/2D.vue'` and `// import D4 from './wallpaper/WallD.vue'`.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Clarity Improvement
- **Recommended Action:** Delete `2D.vue` and `WallD.vue`, or move to an explicit `_archive/` directory. Remove commented imports from `laneIndex.js`.

---

#### A11. Commented-Out `resolveCarouselSwipe` in `solverUtils.js`

- **Category:** Dead Code
- **Description:** `solverUtils.js` contains a fully commented-out `resolveCarouselSwipe` function (lines 62–76) that was replaced by `isCarouselBlocked`. The dead code duplicates the logic of its replacement.
- **Evidence:** Function body is entirely within a block comment. `isCarouselBlocked` handles the same concern at line 78.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Delete the commented-out function.

---

#### A12. `laneCommit` and `laneSwipeStart` — Declared Emits Never Triggered

- **Category:** Dead Code
- **Description:** `InputElement.vue` declares `'laneCommit'` and `'laneSwipeStart'` in its `defineEmits` array, but no code path in `handleReaction` or anywhere else in the component ever calls `emit('laneCommit', ...)` or `emit('laneSwipeStart', ...)`.
- **Evidence:** `grep` shows these strings appear only in the `defineEmits` declaration at `InputElement.vue` lines 68–69.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Clarity Improvement
- **Recommended Action:** Remove `'laneCommit'` and `'laneSwipeStart'` from the `defineEmits` array.

---

#### A13. `swipeSpeedMultiplier` — Defined Setting Never Consumed

- **Category:** Dead Code
- **Description:** `appSettings.js` defines `swipeSpeedMultiplier: 1.2`, but no module reads this value. It was likely used by a deleted momentum/velocity system.
- **Evidence:** `grep` for `swipeSpeedMultiplier` returns only the definition in `appSettings.js`.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Delete `swipeSpeedMultiplier` from `APP_SETTINGS`.

---

#### A14. `isFiniteNumber` — Private Helper Replaceable by Built-in

- **Category:** Dead Code (marginal)
- **Description:** `sizeState.js` defines a private `isFiniteNumber(value)` function that wraps `Number.isFinite(value)` with no additional logic. Used only once, in `clampNumber`.
- **Evidence:** Definition at line 71, single use at line 76. Body is `return Number.isFinite(value)`.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Inline `Number.isFinite(value)` into `clampNumber` and delete the helper.

---

### B. Structural Redundancy

---

#### B1. Duplicate `.drag-content` Styling Across 5+ Scene Files

- **Category:** Redundancy
- **Description:** The exact same 130×130px, rounded, orange-gradient drag handle style block is copy-pasted across `2D.vue`, `WallD.vue`, `bottom3.vue`, `mid3.vue`, and `wall1.vue`. Each instance defines identical `width`, `height`, `border-radius`, `font-weight`, `display`, `justify-content`, `align-items`, `color`, `background`, and `box-shadow`.
- **Evidence:** `.drag-content` style blocks in all five files are character-for-character identical (minor `z-index: 100` variation in some).
- **Effort Level:** Local Refactor
- **Breakage Risk:** Very Low
- **Architectural Impact:** Clarity Improvement
- **Recommended Action:** Extract to a shared `.drag-content` class in `scenes.css` or a new `components.css`. Scenes should only reference the class.

---

#### B2. Duplicate `.drag-container` Styling

- **Category:** Redundancy
- **Description:** The pattern `width: 100%; height: 100%; position: relative;` for `.drag-container` is repeated in `2D.vue`, `WallD.vue`, `bottom3.vue`, and `wall1.vue`. This is functionally the same layout constraint in every case.
- **Evidence:** Identical style blocks across four files.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Move to a shared stylesheet alongside `.drag-content`.

---

#### B3. `normalizeParameter` and `resolveStartOffset` — Normalization in Intent Layer

- **Category:** Redundancy
- **Description:** `intentUtils.js` imports `normalizeParameter` from `sizeState.js` and uses it in two distinct contexts: (1) `normalizedDelta()` for gesture deltas, and (2) `resolveStartOffset()` for converting a client-space position to device-scaled coordinates. Both call `parameter / scale.value`. The normalization concern is clean but relies on `sizeState.js` exporting what is essentially a coordinate-space conversion function. This means `sizeState.js` serves dual duty: viewport sizing state AND coordinate math utility.
- **Evidence:** `intentUtils.js` lines 15–16, 81–82 use `normalizeParameter`. `sizeState.js` line 67 defines it.
- **Effort Level:** Local Refactor
- **Breakage Risk:** Low
- **Architectural Impact:** Clarity Improvement
- **Recommended Action:** Acceptable as-is. If `sizeState.js` grows, consider extracting the pure math functions (`normalizeParameter`, `getAxisSize`, `clampNumber`) into a `coordinateUtils.js` to separate state from utilities.

---

#### B4. `clamp` in `vectorUtils.js` vs `clampNumber` in `sizeState.js`

- **Category:** Redundancy
- **Description:** Two clamping functions exist: `vector.clamp(delta, min, max)` in `vectorUtils.js` and `clampNumber(value, min, max)` in `sizeState.js`. Both clamp a number between min and max. `clampNumber` adds a `NaN` guard via `isFiniteNumber`, `vector.clamp` adds an `undefined` guard. They serve overlapping purposes.
- **Evidence:** `vectorUtils.js` line 2, `sizeState.js` line 75.
- **Effort Level:** Local Refactor
- **Breakage Risk:** Low
- **Architectural Impact:** Clarity Improvement
- **Recommended Action:** Consolidate into one clamp utility. Choose `vector.clamp` as the canonical version (already in the math utility layer) and add the `NaN` guard if needed.

---

#### B5. Repeated Gate/Lock Check Pattern in `carouselSolver.js`

- **Category:** Redundancy
- **Description:** `carouselSolver.swipe()` and `carouselSolver.swipeCommit()` both perform the same three-line preamble: `normalize1D(desc)` → `resolveGate(norm)` → `isCarouselBlocked(...)`. This is duplicated verbatim.
- **Evidence:** `carouselSolver.js` lines 26–28 and lines 38–40 are identical.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Acceptable as-is — the duplication is small and the functions are short. Could extract a `guardedNormalize(desc)` if more solvers adopt the same pattern.

---

### C. Boundary Violations

---

#### C1. `interpreter.js` Mutates Descriptor After Construction via `resolveStartOffset`

- **Category:** Boundary
- **Description:** In `interpreter.onMove()`, after constructing the swipe target descriptor, the interpreter directly mutates `gesture.desc.startOffset` by calling `utils.resolveStartOffset(x, y, gesture.desc.element)`. This reads `element.getBoundingClientRect()` — a DOM read — from within the interpreter layer, which should be a pure intent-mapping layer.
- **Evidence:** `interpreter.js` line 95: `gesture.desc.startOffset = utils.resolveStartOffset(x, y, gesture.desc.element)`. `intentUtils.js` line 77: `const rect = element.getBoundingClientRect()`.
- **Effort Level:** Local Refactor
- **Breakage Risk:** Low
- **Architectural Impact:** Invariant Protection — the interpreter should not perform DOM reads after target resolution. `startOffset` computation belongs in `targetResolver.resolveFromElement()` at descriptor-build time, or as a solver pre-step.
- **Recommended Action:** Move `resolveStartOffset` into `targetResolver.buildBase()` or `buildSwipe()` so it runs once during target resolution, not during descriptor mutation mid-gesture. This eliminates the only post-construction DOM read in the interpreter.

---

#### C2. `targetResolver.js` Reads State Directly from `stateManager`

- **Category:** Boundary
- **Description:** `targetResolver.buildSwipe()` calls `state.getSize()`, `state.getCurrentIndex()`, `state.getThumbSize()`, `state.getConstraints()`, and `state.getPosition()` to enrich the descriptor with current state values. This means the target resolution layer directly depends on the state layer, creating a circular-ish dependency chain: targetResolver → stateManager → *State files. While the data flows read-only, this couples target resolution to state shape.
- **Evidence:** `targetResolver.js` lines 53–66 perform five `state.get*()` calls.
- **Effort Level:** Multi-Module Refactor
- **Breakage Risk:** Medium
- **Architectural Impact:** Structural Simplification — separating target resolution from state enrichment would make the pipeline stages cleaner.
- **Recommended Action:** Acceptable in current form — the reads are legitimate snapshot operations that build the descriptor for downstream solvers. This is a known tradeoff to avoid an extra pipeline stage. Flag for revisit only if state reads proliferate or if target resolution becomes stateful.

---

#### C3. `renderer.js` — DOM Attribute Mutations Are the Sanctioned Boundary

- **Category:** Boundary (positive finding — not a violation)
- **Description:** DOM mutations (`setAttribute`, `removeAttribute`, `dispatchEvent`) are confined to `renderer.js` via `setAttr()` and `dispatchEvent()` helper functions. This is correct and matches the architectural contract.
- **Evidence:** `renderer.js` is the only non-debug file that performs `element.setAttribute` / `element.removeAttribute` / `element.dispatchEvent`.
- **Recommended Action:** None. This is correct.

---

#### C4. `drawDots` in `debug/functions.js` — DOM Mutation Outside Renderer

- **Category:** Boundary
- **Description:** `drawDots()` creates DOM elements (`document.createElement('div')`) and appends them to `document.body`. This is a DOM mutation outside the renderer boundary. However, it is gated behind `DEBUG.enabled && DEBUG.drawDots` and is only called from `interpreter.js` in the `onDown` and `onMove` handlers.
- **Evidence:** `functions.js` lines 32–43 create and append DOM elements. Called from `interpreter.js` lines 56, 74.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Invariant Protection (minor) — debug code should ideally not live inside the production interpreter path.
- **Recommended Action:** Acceptable as-is due to debug gating. If production bundle size matters, consider stripping `drawDots` calls at build time via a Vite plugin or moving them behind a dynamic import.

---

#### C5. Kotlin Calls Undefined JS Globals

- **Category:** Boundary
- **Description:** `LauncherActivity.kt` calls `handleTouch(type, x, y, seqId)`, `window.initAndroidEngine()`, `window.__onLifecycle()`, and `window.__onBackPressed()` via `evalJS`. None of these functions are defined in the current web codebase. The Android bridge sends events to JS functions that do not exist.
- **Evidence:** `grep` for `handleTouch`, `initAndroidEngine`, `__onLifecycle`, `__onBackPressed` across `web/src/**` returns zero matches. The web app uses pointer events via `bridge.js` instead.
- **Effort Level:** Local Refactor
- **Breakage Risk:** Low (currently non-functional on Android)
- **Architectural Impact:** Stability Gain — the Android touch pipeline is disconnected from the web gesture pipeline. The web app works in browser via pointer events but the Kotlin bridge is calling dead endpoints.
- **Recommended Action:** Implement the global JS functions that Kotlin expects (`window.handleTouch`, `window.initAndroidEngine`), wiring them into `pipeline.orchestrate()`. Alternatively, refactor the Kotlin side to dispatch pointer events directly to the WebView DOM and remove the custom JS bridge entirely.

---

### D. Accidental Complexity

---

#### D1. `sizeState.js` Mixes Three Concerns

- **Category:** Complexity
- **Description:** `sizeState.js` handles three distinct responsibilities: (1) device dimension computation from `window.__DEVICE`, (2) viewport scaling math, and (3) coordinate normalization/clamping utilities (`normalizeParameter`, `getAxisSize`, `clampNumber`). This makes it the most cross-cutting module in the codebase — imported by `intentUtils.js` (core), `carouselState.js` (state), and `DebugWrapper.vue` (debug).
- **Evidence:** Exports: `device`, `scale`, `getAxisSize`, `normalizeParameter`, `clampNumber`. Imported by three different architectural layers.
- **Effort Level:** Local Refactor
- **Breakage Risk:** Low
- **Architectural Impact:** Clarity Improvement
- **Recommended Action:** Acceptable as-is. The module is small (~80 lines) and its consumers are stable. If it grows, split into `deviceMetrics.js` (device + scale) and `coordinateUtils.js` (normalize, clamp, getAxisSize).

---

#### D2. `SwipeLane.vue` — Three Components in One File

- **Category:** Complexity
- **Description:** `SwipeLane.vue` is a 328-line mega-component that uses `if (props.type === 'carousel') { ... }` / `if (props.type === 'slider') { ... }` / `if (props.type === 'drag') { ... }` branching in `<script setup>` to conditionally initialize entirely different composables, refs, and styles. Each branch is independent — they share no logic. The template uses three mutually exclusive `v-if` / `v-else-if` blocks.
- **Evidence:** Lines 66–248 contain three independent initialization blocks gated by `props.type`. Each block initializes different state, composables, and event handlers.
- **Effort Level:** Multi-Module Refactor
- **Breakage Risk:** Medium
- **Architectural Impact:** Structural Simplification — splitting into `CarouselLane.vue`, `SliderLane.vue`, `DragLane.vue` would make each component self-contained, easier to test, and eliminate the need for conditional composable initialization.
- **Recommended Action:** This is a known complexity hotspot but works correctly. Splitting is recommended only if: (a) any branch grows beyond its current size, or (b) new gesture types are added. The current approach avoids API surface proliferation at the cost of internal complexity. Flag for refactoring if the file exceeds ~400 lines.

---

#### D3. `applyRuntimeLayout` Dispatches `layout:refresh` — No Listener

- **Category:** Complexity
- **Description:** `main.js` defines `applyRuntimeLayout()` which dispatches `window.dispatchEvent(new Event('layout:refresh'))`. No code anywhere in the codebase listens for the `layout:refresh` event. The function body is effectively a no-op (the `exportCSS()` call is commented out).
- **Evidence:** `grep` for `layout:refresh` returns only the dispatch in `main.js` line 22. Zero `addEventListener` matches.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Clarity Improvement
- **Recommended Action:** Delete the `applyRuntimeLayout` function, the `layout:refresh` dispatch, and the `phone:metrics` listener registration. They are vestigial.

---

#### D4. `deploy.js` References `import.meta.env.VITE_DEBUG` — Runtime Bug

- **Category:** Complexity
- **Description:** `scripts/deploy.js` last line: `console.log(\`✅ Asset updated successfully [DEBUG]:${import.meta.env.VITE_DEBUG}\`)`. `import.meta.env` is Vite-specific and unavailable in Node.js. This line prints `undefined` at runtime.
- **Evidence:** `deploy.js` line: `import.meta.env.VITE_DEBUG` — Node.js does not provide Vite's env injection.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Remove the `import.meta.env.VITE_DEBUG` reference from `deploy.js`. Use `process.env.VITE_DEBUG` if needed, or delete the duplicate log line entirely.

---

### E. State Ownership Audit

---

#### E1. State Writers Are Well-Contained

- **Category:** Ownership (positive finding)
- **Description:** All gesture-driven state mutations flow through `stateManager.js` → individual `*StateFn` objects. The pipeline in `pipeline.js` calls `state[solution.type](solution.swipeType, solution)`, which delegates to the correct state file's `swipeStart`/`swipe`/`swipeCommit`/`swipeRevert` method. No external module bypasses this path for gesture mutations.
- **Evidence:** `grep` for direct imports of `carouselState`/`dragState`/`sliderState` (the raw reactive objects) shows only `stateManager.js` imports the `*StateFn` objects. The raw reactive objects (`carouselState`, `dragState`, `sliderState`) are exported but not imported by any other module.
- **Recommended Action:** None. Consider removing the raw reactive object exports (`export const carouselState`, etc.) to enforce the accessor pattern and prevent accidental direct mutation.

---

#### E2. Raw Reactive State Objects Are Exported But Should Not Be

- **Category:** Ownership
- **Description:** `carouselState.js` exports `carouselState` (the raw `reactive()` object), `dragState.js` exports `dragState`, and `sliderState.js` exports `sliderState`. These are currently unused by external consumers — all access goes through `stateManager.js` — but the exports create an unguarded mutation surface.
- **Evidence:** `export const carouselState = reactive({...})` in `carouselState.js` line 12. Zero external imports of the raw objects.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Invariant Protection — removing these exports enforces the single-writer pattern.
- **Recommended Action:** Remove `export` from `carouselState`, `dragState`, and `sliderState` declarations. Keep only the `*StateFn` exports.

---

#### E3. `carousel.setPosition` Called from `useLaneMotion.js` via `onTransitionEnd`

- **Category:** Ownership
- **Description:** `useLaneMotion.js` defines `onTransitionEnd()` which calls `state.setPosition('carousel', lane)`. This is a state mutation triggered by a CSS `transitionend` event — initiated by the component layer, not the pipeline. This is architecturally intentional (it finalizes index advancement after animation completes), but it means state ownership for `carousel.index` has two writers: `pipeline.js` (via solver → `swipeCommit`) and `onTransitionEnd` (via `setPosition`).
- **Evidence:** `useLaneMotion.js` line 55: `state.setPosition('carousel', lane)`. `carouselState.js` `setPosition` mutates `lane.index`.
- **Effort Level:** N/A — design decision
- **Breakage Risk:** N/A
- **Architectural Impact:** N/A — this is the correct two-phase commit pattern (solver commits offset + direction, animation end commits index).
- **Recommended Action:** None. Document this as an intentional two-phase write in `carouselState.js` comments.

---

#### E4. `SwipeLane.vue` Slider `onReaction` Reads State and Derives Value

- **Category:** Ownership
- **Description:** In `SwipeLane.vue`'s slider branch, the `onReaction` handler reads `lanePosition`, `laneConstraints`, and applies an axis-inversion formula for vertical sliders before emitting `volumeChange`. This is derived-state computation inside a component reaction handler. The component is doing solver-like work (inverting values based on axis).
- **Evidence:** `SwipeLane.vue` lines 189–199: `if (!horizontal.value) { const { min, max } = laneConstraints.value; value = max - (value - min) }`.
- **Effort Level:** Local Refactor
- **Breakage Risk:** Low
- **Architectural Impact:** Clarity Improvement — the axis inversion is a presentation concern, but it looks like solver logic inside a component.
- **Recommended Action:** Acceptable as-is for a single slider. If more sliders appear with axis-dependent output transforms, extract into a `sliderOutputTransform` util.

---

### F. Pipeline Integrity Review

---

#### F1. Pipeline Is Clean and Linear

- **Category:** Pipeline (positive finding)
- **Description:** `pipeline.orchestrate()` follows a strict linear flow: interpreter → solver → state → renderer. There are no callbacks, no deferred operations, no async steps. Each stage receives the previous stage's output. The solver merges with the interpreter descriptor via spread operator. State mutation is gated by `solution.stateAccepted`. Rendering always runs last.
- **Evidence:** `pipeline.js` is 65 lines with a single `orchestrate()` function, zero branching by gesture type (lookup tables handle dispatch), and a clear comment-delimited four-stage flow.
- **Recommended Action:** None. This is the strongest part of the architecture.

---

#### F2. Solver Can Feed Back into Interpreter via `gestureUpdate`

- **Category:** Pipeline
- **Description:** `pipeline.js` checks `solution.gestureUpdate` and calls `interpreter.applyGestureUpdate(solution.gestureUpdate)` if present. This creates a solver → interpreter feedback loop. Currently only `sliderSolver.swipeStart()` uses this (to inject `sliderStartOffset` and `sliderValuePerPixel` into the gesture descriptor), but it means solvers can retroactively modify the interpreter's state.
- **Evidence:** `pipeline.js` lines 48–50. `sliderSolver.js` lines 30–34. `interpreter.js` `applyGestureUpdate()` line 37 merges updates into `gesture.desc`.
- **Effort Level:** N/A — design decision
- **Breakage Risk:** Low (constrained to one solver)
- **Architectural Impact:** Clarity Improvement — this is a controlled back-channel. The concern is that it creates a precedent for downstream layers to mutate upstream state.
- **Recommended Action:** Document this as an intentional pattern. Consider adding a comment in `applyGestureUpdate` listing which solvers use it and why. If more solvers adopt it, evaluate whether a dedicated "descriptor enrichment" stage between interpreter and solver would be cleaner.

---

#### F3. `pipeline.js` Resets Gesture After Commit/Release

- **Category:** Pipeline
- **Description:** `pipeline.js` calls `interpreter.resetGesture()` for `swipeCommit` and `pressRelease` types. This is pipeline-level lifecycle management that conceptually belongs to the interpreter. The pipeline is reaching into the interpreter to manage its internal state.
- **Evidence:** `pipeline.js` lines 51–53: `if (descriptor.type === 'swipeCommit' || descriptor.type === 'pressRelease') { interpreter.resetGesture() }`.
- **Effort Level:** Local Refactor
- **Breakage Risk:** Low
- **Architectural Impact:** Clarity Improvement — the interpreter should own its own lifecycle transitions.
- **Recommended Action:** Move the reset trigger into `interpreter.onUp()` after returning the commit/release descriptor. The interpreter already knows the gesture phase and can self-reset. This eliminates the pipeline's need to understand lifecycle semantics.

---

#### F4. `renderer.js` Handles `extra` Descriptor — Hidden Dual Dispatch

- **Category:** Pipeline
- **Description:** `pipeline.js` calls `render.handle(solution.extra)` before `render.handle(solution)`. The `extra` field is used in `interpreter.onMove()` to attach a `pressCancel` descriptor when transitioning from press to swipe. This means a single pipeline invocation can trigger two render passes — one for the cancel, one for the swipeStart. This is functionally correct but is an implicit protocol between interpreter and renderer.
- **Evidence:** `pipeline.js` lines 57–59. `interpreter.js` lines 90–93 set `extra: cancel`.
- **Effort Level:** N/A
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Document the `extra` field contract. Consider renaming to `priorReaction` or `cancelledDescriptor` for clarity.

---

#### F5. `volumeChange` Emit — No Parent Listener

- **Category:** Pipeline
- **Description:** `SwipeLane.vue` emits `volumeChange` from the slider branch. No parent component binds `@volumeChange` on any `<SwipeLane>` instance. The emitted event is never consumed.
- **Evidence:** `grep` for `@volumeChange` returns zero matches. `defineEmits` declares it at line 71. Emitted at line 198. Consumed nowhere.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic — harmless but misleading.
- **Recommended Action:** Remove `volumeChange` from `defineEmits` and the associated emit logic, unless a consumer is planned.

---

#### F6. Naming Inconsistency in Scene `defineOptions`

- **Category:** Pipeline (peripheral)
- **Description:** Two scene files use lowercase names: `defineOptions({ name: 'bottomB' })` in `3B.vue` and `defineOptions({ name: 'bottomMir2' })` in `bottom2.vue`. All other scenes use PascalCase.
- **Evidence:** `3B.vue` line `defineOptions({ name: 'bottomB' })`. `bottom2.vue` line `defineOptions({ name: 'bottomMir2' })`.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Rename to `BottomB` and `BottomMir2`.

---

#### F7. `mid3.vue` Missing `.scene-root` Wrapper

- **Category:** Pipeline / Boundary
- **Description:** `mirrorLanes/mid3.vue` uses `<DragOrSlot>` as its root element instead of wrapping in `<div class="scene-root">`. Every other scene in the codebase uses `.scene-root` for consistent sizing, containment, and GPU compositing. This scene will not receive the base styles from `scenes.css`.
- **Evidence:** `mid3.vue` template root is `<DragOrSlot lane="mid3-button-1">`. Compare to `bottom3.vue` which wraps `<SwipeLane>` inside `<div class="scene-root c">`.
- **Effort Level:** Trivial
- **Breakage Risk:** Low
- **Architectural Impact:** Invariant Protection — all scenes should maintain consistent structural contract.
- **Recommended Action:** Wrap `<DragOrSlot>` in `<div class="scene-root c">` for consistency.

---

#### F8. `bottom1.vue` Missing Letter Class on `.scene-root`

- **Category:** Pipeline (peripheral)
- **Description:** `mirrorLanes/bottom1.vue` uses `<div class="scene-root">` without a letter variant class (e.g., `.a`). While this still receives base styles from `scenes.css`, it breaks the convention that every scene has a unique letter class for per-scene styling.
- **Evidence:** `bottom1.vue` template: `<div class="scene-root">` — no `.a`, `.b`, or `.c` class.
- **Effort Level:** Trivial
- **Breakage Risk:** Very Low
- **Architectural Impact:** Cosmetic
- **Recommended Action:** Add the appropriate letter class.

---

## Quick Wins

Low-effort, low-risk improvements that can be done independently.

| # | Action | Files | Effort |
|---|--------|-------|--------|
| 1 | Delete `touchVisuals.js` | `src/animations/touchVisuals.js` | Trivial |
| 2 | Delete `debugLagTime` + `timeList` | `src/debug/functions.js` | Trivial |
| 3 | Delete `.touch-area` class + `touch.css` import | `src/styles/touch.css`, `src/styles/main.css` | Trivial |
| 4 | Delete `--gpu-hint` and `--index-*` CSS vars | `src/styles/variables.css` | Trivial |
| 5 | Delete `.phone` dead style | `src/scenes/Root.vue` | Trivial |
| 6 | Delete `.label` dead style | `src/scenes/mirrorLanes/mid1.vue` | Trivial |
| 7 | Delete dead CSS in `bottom1.vue`, `mid3.vue` | Two mirror scene files | Trivial |
| 8 | Delete ghost imports in `main.js` | `src/main.js` | Trivial |
| 9 | Delete `applyRuntimeLayout` and event registration | `src/main.js` | Trivial |
| 10 | Delete `swipeSpeedMultiplier` | `src/config/appSettings.js` | Trivial |
| 11 | Delete commented-out `resolveCarouselSwipe` | `src/interaction/solvers/solverUtils.js` | Trivial |
| 12 | Remove `laneCommit` / `laneSwipeStart` from emits | `src/components/InputElement.vue` | Trivial |
| 13 | Remove `volumeChange` dead emit path | `src/lanes/SwipeLane.vue` | Trivial |
| 14 | Fix `deploy.js` `import.meta.env` bug | `web/scripts/deploy.js` | Trivial |
| 15 | Fix PascalCase naming: `bottomB` → `BottomB`, `bottomMir2` → `BottomMir2` | Two scene files | Trivial |
| 16 | Add `.scene-root` wrapper to `mid3.vue` | `src/scenes/mirrorLanes/mid3.vue` | Trivial |
| 17 | Remove raw reactive exports (`carouselState`, `dragState`, `sliderState`) | Three state files | Trivial |
| 18 | Inline `isFiniteNumber` into `clampNumber` | `src/interaction/state/sizeState.js` | Trivial |
| 19 | Delete `2D.vue` and `WallD.vue` | Two scene files + `laneIndex.js` comments | Trivial |

---

## High-Leverage Refactors

Changes that significantly improve clarity or structural integrity.

| # | Action | Impact | Effort | Risk |
|---|--------|--------|--------|------|
| 1 | **Wire Kotlin JS bridge to web pipeline** — Implement `window.handleTouch` calling `pipeline.orchestrate()`, or switch Kotlin to dispatch DOM `PointerEvent`s. Currently the Android touch pathway is entirely disconnected. | Stability Gain | Local Refactor | Low |
| 2 | **Move `resolveStartOffset` from interpreter to targetResolver** — Eliminates the only post-construction DOM read in the interpreter layer and the only descriptor mutation after resolver handoff. | Invariant Protection | Local Refactor | Low |
| 3 | **Move gesture reset into interpreter** — `pipeline.js` should not manage interpreter lifecycle. `interpreter.onUp()` should self-reset after returning the terminal descriptor. | Clarity Improvement | Local Refactor | Low |
| 4 | **Extract `.drag-content` / `.drag-container` to shared stylesheet** — Eliminates 5-way copy-paste of identical style blocks across scenes. | Clarity Improvement | Local Refactor | Very Low |

---

## Areas That Are Structurally Strong

The following areas are well-designed and should NOT be changed:

### Pipeline Orchestration (`pipeline.js`)
Single-entry, synchronous, four-stage flow with lookup-table dispatch. No conditionals by gesture type. Clean separation of concerns. This is the architectural backbone and it holds.

### Solver Layer (`carouselSolver.js`, `sliderSolver.js`, `dragSolver.js`, `solverUtils.js`, `vectorUtils.js`)
Pure functions. No DOM access. No state mutation. Receives descriptor, returns augmented solution. Each solver is focused and self-contained. `solverUtils.js` centralizes shared math cleanly. `vectorUtils.js` is a well-scoped math utility.

### State Manager Pattern (`stateManager.js` + `*StateFn` objects)
Consistent facade pattern. Single entry point for all state reads and writes. Type-based dispatch via lookup table. State files follow identical structural conventions (ensure → get → set → gesture mutations). `readonly(computed(...))` views for components prevent accidental writes from the render layer.

### Renderer Discipline (`renderer.js`)
Sole DOM mutation boundary for gesture feedback. Attribute-based approach (`data-pressed`, `data-swiping`) keeps gesture state visible in the DOM without style manipulation. `CustomEvent` dispatch is the single channel for component-side reactions.

### Bridge Composable (`bridge.js`)
Clean Vue composable pattern. Captures pointer events on a single element, forwards through pipeline, cleans up on unmount. Global move/up listeners properly managed. No state, no side effects beyond event forwarding.

### Carousel Scene Resolution (`useLaneScenes.js`)
Minimal, focused composable. Wrapping index math is correct. `markRaw()` usage prevents Vue from adding reactivity overhead to component references.

### Component Render Isolation
Scene components (`1A.vue`, `1B.vue`, etc.) are purely presentational. No gesture math, no state access, no DOM manipulation. `InputElement.vue` is a clean gesture-surface wrapper that declares capabilities via data attributes and emits events — it performs no computation.

---

*End of audit.*
