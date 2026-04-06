# Recommendations — Interaction & Components System

## Quick Wins
*High impact, low effort — do these first*

//DONE 
### Remove dead and commented-out code in a single sweep
**Category:** Dead Code
**Impact:** High
**Effort:** Low
**Details:** Delete all commented-out code blocks across the codebase: the `init` block in `sizeState.ts`, commented exports in `intentUtils.ts`, ~20 lines of alternative implementations in `gestureTypeGuards.ts`, commented imports in `dragSolver.ts`, commented `useState` lines in `useDragSizing.ts` and `useCarouselSizing.ts`. Remove the unused `GestureState.type` field in `interpreter.ts` (written but never read). Remove the trivial `intentUtils.resolveTarget` wrapper — replace its two call sites with direct calls to `domQuery.findTargetInDom`. Remove the redundant `const { ...rest } = props` destructures in every case of `Interactive.tsx` and spread `props` directly.

//DONE 
### Remove the `[key: string]: unknown` index signature from `ButtonProps`
**Category:** Type Safety
**Impact:** High
**Effort:** Low
**Details:** The index signature on `ButtonProps` in `Button.tsx` disables excess property checking for every consumer of `<Button>`. Remove it. If arbitrary `data-*` attributes need to be forwarded, type the rest props explicitly as `React.HTMLAttributes<HTMLDivElement>` or similar.

//DONE 
### Export `InteractiveProps` from `Interactive.tsx`
**Category:** Naming & Discoverability
**Impact:** Medium
**Effort:** Low
**Details:** The `InteractiveProps` type is defined but not exported. Any parent component that wants to pass or constrain Interactive props cannot reference this type. Add an `export` to the type declaration.

//DONE 
### Type `GestureState.type` as `InteractionType` instead of `string`
**Category:** Type Safety
**Impact:** Medium
**Effort:** Low
**Details:** In `interpreter.ts`, the `GestureState` interface types `type` as `string`. It always stores a value from `Descriptor['type']`, which is `InteractionType`. Change the type to `InteractionType`. (This is only relevant if the field is kept — if removed per the dead code recommendation, this is moot.)

### Rename `onVolumeChange` to `onValueChange` in `Slider.tsx`
//TODO //HELP this is a bit tricky since the callback is currently volume-specific but the slider component is generic. Need to understand and build up a system from custom reactions.
**Category:** Consistency
**Impact:** Medium
**Effort:** Low
**Details:** `Slider.tsx` exposes `onVolumeChange` — a domain-specific callback name. Carousel and Drag use the generic `onSwipeCommit`. Rename to `onValueChange` (or `onSwipeCommit` for full consistency) so the component is reusable beyond volume control use cases. Update all call sites.

//DONE 
### Abort gesture on `usePointerForwarding` unmount
**Category:** Error Handling
**Impact:** High
**Effort:** Low
**Details:** In `bridge.ts`, `pipeline.abortGesture` is only called when `disabled` changes to `true`. A normal component unmount runs the effect cleanup (removing listeners) but leaves a dangling `GestureState` in the interpreter holding a reference to a detached DOM element. Add an `abortGesture` call to the main effect's cleanup return, guarded by `isActive.current && activePointerId.current !== null`.

---

## High Priority
*High impact, higher effort or risk — plan these carefully*

//DONE 
### Make `CtxPartial` type-safe per primitive
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** `CtxPartial` in `pipelineType.ts` is `Partial<Exclude<CtxSwipeType, CtxButton>>`, a flat partial that erases the discriminated union. This allows a carousel solver to return slider-only fields like `gestureUpdate` without compiler error. Replace with per-primitive partial types (e.g., `CarouselCtxPartial = Partial<Pick<CtxCarousel, 'delta1D' | 'direction' | 'stateAccepted'>>`) and type each solver's return accordingly. Update the solver type signatures in `pipelineType.ts` and the `SolverMap` type so each solver returns only the fields valid for its context type.

//DONE 
### Narrow solver input types from `Descriptor` to specific descriptor types
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** Each solver function in `carouselSolver.ts`, `sliderSolver.ts`, and `dragSolver.ts` receives the full `Descriptor` union and then narrows via assertion type guards (`isCarousel`, `isDrag`, `isSlider`). These assertions degrade to `console.warn` in production and let execution continue with the wrong type. Change the `solverFn` signature in `pipelineType.ts` to accept the specific descriptor type per solver (e.g., `(desc: CarouselDesc & { type: 'carousel' }) => CarouselCtxPartial`). Move the type narrowing responsibility to `pipeline.orchestrate` where the `type` discriminant is already known before the solver is called.

//DONE 
### Validate DOM data attribute casts in `intentUtils.buildContext`
**Category:** Type Safety
**Impact:** High
**Effort:** Medium
**Details:** `intentUtils.ts` casts `ds.axis as Axis` and `ds.type as InteractionType` without validation. A malformed `data-type` or `data-axis` attribute produces an invalid value that flows through the entire pipeline unchecked. Add a validation step — either a `Set.has()` check against known values or a type guard — and return early / skip the element if invalid.

//DONE 
### Break the circular dependency: `intentUtils` → `domQuery` → `buildDesc` → `intentUtils`
**Category:** Separation of Concerns
**Impact:** High
**Effort:** Medium
**Details:** `intentUtils.resolveTarget()` calls `domQuery.findTargetInDom()`, which calls `buildDesc.resolveFromElement()`, which calls `intentUtils.buildContext()`. Extract `buildContext` (and any pure utility functions it depends on) into a new file (e.g., `contextBuilder.ts`) that both `domQuery`/`buildDesc` and `intentUtils` can import without creating a cycle.

//DONE
### Move store `init()` calls out of render in `use*Zustand` hooks
**Category:** State Management
**Impact:** High
**Effort:** Medium
**Details:** `useCarouselZustand`, `useDragZustand`, and `useSliderZustand` each call `store.getState().init(id)` at the top of the hook body — during render. This triggers a Zustand `set()` (even if guarded) inside a render pass, violating React's purity expectation. Move the `init` call into a `useEffect` or a `useRef`-based one-time guard so it runs outside the render phase.

//TODO
### Split `solverUtils.ts` into per-primitive solver utility files
**Category:** Separation of Concerns / Scalability
**Impact:** High
**Effort:** Medium
**Details:** `solverUtils.ts` contains carousel-specific functions (`isCarouselBlocked`, `resolveCarouselCommit`, `shouldCommit`, `getCommitOffset`), slider-specific functions (`resolveSliderStart`, `resolveSliderSwipe`), and drag-specific functions (`resolveDragSwipe`, `resolveDragCommit`, `resolveSnapAdjustment`, `resolveDragDirection`), plus shared utilities (`normalize1D`, `resolveGate`). Split into `carouselSolverUtils.ts`, `sliderSolverUtils.ts`, `dragSolverUtils.ts`, and keep shared functions in `solverUtils.ts`. This reduces merge conflict surface and keeps each solver's logic co-located.

//TODO
### Split `intentUtils.ts` into focused modules
**Category:** Separation of Concerns
**Impact:** Medium
**Effort:** Medium
**Details:** `intentUtils.ts` handles context building, axis resolution, swipe threshold calculation, target resolution, swipe-start resolution with lane fallback, cancel resolution, and delta normalization. These span DOM querying, geometry, and gesture policy. After extracting `buildContext` (per the circular dependency fix), further separate the remaining responsibilities — e.g., threshold and commit policy into a `gesturePolicy.ts`, cancel handling into its own function.


//HACK decided to deprioritize this one since the current `pipeline.orchestrate` implementation is straightforward and the switch statement is clear in its intent. The registry pattern adds indirection that may not be worth it until we have a larger number of primitives or more complex dispatch logic.

//NOTE A generic registry would force you to either lose that per-primitive flexibility or add complexity to work around it. The switch is actually the right pattern here — it's explicit, TypeScript narrows correctly in each branch, and adding a fourth primitive is just adding a new case. - Claude.ai

### Refactor `pipeline.orchestrate` store dispatch to a registry
**Category:** Scalability
**Impact:** Medium
**Effort:** Medium
**Details:** `pipeline.orchestrate` has a `switch` over `ctxType` with identical boilerplate per case: get store state, look up function by event name, call it with ctx. Replace with a `storeRegistry: Record<DataKeys, { getState: () => Record<string, (ctx: any) => void> }>` that maps type to store, then dispatch generically. This eliminates the need to add a new case each time a primitive is added. The `EventMap`, `CarouselFunctions`, `SliderFunctions`, and `DragFunctions` types in `pipelineType.ts` would be consolidated into the registry pattern.



//DONE also added a guard in `finalizeGesture` to prevent emitting `SWIPE_COMMIT` for non-swipeable elements, which was a similar issue.

### Guard against spurious `pressRelease` on non-pressable elements
**Category:** Error Handling
**Impact:** Medium
**Effort:** Medium
**Details:** In `interpreter.ts`, `onDown` always creates a gesture entry. If the element isn't pressable, `onDown` returns `null` but the gesture persists. On `onUp` with `phase === 'PENDING'`, a `pressRelease` event is generated and dispatched via `render.handle(ctx)`, even though the element never received a `press`. Either skip gesture entry creation for non-pressable/non-swipeable elements, or check `reactions.pressable` in `finalizeGesture` before emitting `pressRelease`.

---

## Low Priority
*Low impact or purely cosmetic — tackle when time allows*

//DONE
### Rename `zunstand/` directory to `stores/`
**Category:** Naming & Discoverability
**Impact:** Medium
**Effort:** Low
**Details:** The `zunstand/` name is non-obvious and doesn't appear in search results for "zustand" or "store." Rename to `stores/` (or `state/`) and update all import paths. This is a simple find-and-replace but touches many files.


//DONE went with updater and domUpdater.ts
### Rename `updater/` directory or `renderer.ts` for consistency
**Category:** Naming & Discoverability
**Impact:** Low
**Effort:** Low
**Details:** The `updater/` directory contains `renderer.ts` — two different metaphors for the same concept. Either rename the directory to `renderer/` to match the file, or rename the file to `updater.ts` to match the directory.

//DONE
### Move `bridge.ts` out of `interaction/` or extract a non-React core
**Category:** Separation of Concerns
**Impact:** Low
**Effort:** Medium
**Details:** `bridge.ts` (`usePointerForwarding`) is the only React-dependent file in the otherwise framework-agnostic `interaction/` directory. Either move it to `components/primitives/hooks/` (since every component imports it), or split it into a framework-agnostic pointer event adapter (stays in `interaction/`) and a React hook wrapper (moves to `components/`).

//SKIPPED meh doesn't really matter at the current scale and adds complexity. We can revisit if performance becomes an issue.
### Reduce Zustand subscription granularity in `use*Zustand` hooks
**Category:** Performance / State Management
**Impact:** Medium
**Effort:** Low
**Details:** Each `use*Zustand` hook subscribes to the entire state object for a given `id`. Use `useShallow` (already imported in `sizeState.ts`) or field-level selectors in `useCarouselZustand`, `useDragZustand`, and `useSliderZustand` to subscribe only to fields the component actually reads. For example, `useCarouselZustand` could select `{ index, offset, count, dragging, size, settling }` via `useShallow`, preventing re-renders when `pendingDir` changes.

//NOTE i agree.. need to decide on a consistent set of terms for the core concepts (size, position, state) and apply them across both halves of the system. The issue is that `lane` terminology is more intuitive within the carousel/slider domain, while `track` and `delta` are more common in gesture interpretation. Need to decide on a single vocabulary that can be applied consistently without feeling out of place in either context.
//TODO
### Unify "lane" vocabulary between `components/` and `interaction/`
**Category:** Naming & Discoverability
**Impact:** Low
**Effort:** Low
**Details:** Components use `laneSize`, `laneState`, `lanePosition` extensively. `interaction/` uses `trackSize`, `size`, `delta`. The two halves of the system have different names for the same concepts. Pick one vocabulary and apply it consistently (or at least document the mapping).




//HELP this is a bit tricky since the `type` field on the descriptor is what allows us to discriminate the union and narrow to the correct solver, while the `ctx.type` is what the solvers use to determine which fields are valid. If you look at the code in buildDesc.ts the `ctx.type` is derived from the descriptor's `type` at the point of building the descriptor by narrowing but context `ctx.type` and then added to ctx. The potential fix would be to manually add ctx.type before dispatching to the stateFiles/updater... but that might make it harder to narrow ctx.
### Eliminate the duplicated `type` field between `Descriptor` and `ctx`
**Category:** Dead Code / Consistency
**Impact:** Low
**Effort:** Medium
**Details:** Every `Descriptor` has a top-level `type` (e.g., `type: 'carousel'`) and a `ctx.type` (e.g., `ctx.type: 'carousel'`). These are always identical, creating a synchronization invariant. Either derive `ctx.type` from the descriptor's `type` at the point of ctx construction in `buildDesc.ts`, or remove `type` from the ctx types entirely and read it from the descriptor throughout the pipeline.

//NOTE //HELP this is a minor issue since the extra field doesn't cause any problems, but actionId is for future extensibility since actions will be added to other primitives later. I believe it is for custom events to sliders for things like volume. Will have to analyse this further but im fairly sure it is to hook up custom events to kotlin.
### Remove `actionId` from non-button descriptors
**Category:** Dead Code
**Impact:** Low
**Effort:** Low
**Details:** `buildBase` in `buildDesc.ts` attaches `actionId` to all descriptor types, but it's only meaningful for buttons (read from `data-action`). Move `actionId` into `buildButton` only, or make it button-specific in the `BaseInteraction` type via a conditional type or separate interface.

//TODO
### Add store cleanup on primitive unmount
**Category:** State Management
**Impact:** Low
**Effort:** Low
**Details:** Store entries for `carouselStore`, `dragStore`, and `sliderStore` persist indefinitely after component unmount. Add a `delete(id)` method to each store and call it from a cleanup `useEffect` in the corresponding `use*Zustand` hook. Low priority for a launcher where primitives are long-lived, but prevents memory growth in dynamic scenarios.

//NOTE //HELP don't really understand.. i already have same guard as everywhere else since requestAnimationFrame.           
const s = state.carouselStore[id]
  if (!s) return
### Guard the `requestAnimationFrame` callback in `carouselState.setPosition`
**Category:** Error Handling
**Impact:** Low
**Effort:** Low
**Details:** `carouselState.ts` `setPosition` schedules a `requestAnimationFrame` to reset `settling`. If the store entry is deleted or the component unmounts before the callback fires, it writes to a potentially stale entry. Add a guard (`if (!state.carouselStore[id]) return`) inside the rAF callback.

//FUTURE
### Pool or share ResizeObservers across primitive instances
**Category:** Performance
**Impact:** Low
**Effort:** Medium
**Details:** Each primitive instance creates its own `ResizeObserver` (Slider creates one observing two elements). For the current scale (~10–20 primitives) this is fine. If the count grows significantly, consider a shared observer utility that batches observations into a single `ResizeObserver` instance with per-element callbacks.
