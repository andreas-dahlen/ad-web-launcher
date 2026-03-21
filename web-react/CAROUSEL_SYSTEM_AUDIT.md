# Carousel System Audit — React + TypeScript Codebase

**Scope:** `web-react/src`  
**Date:** March 21, 2026  
**Auditor:** Systems Review (Automated Deep Audit)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Issues by Severity](#2-issues-by-severity)
   - [🔴 Critical](#-critical)
   - [🟠 High](#-high)
   - [🟡 Medium](#-medium)
   - [🟢 Low](#-low)
3. [Performance Review](#3-performance-review)
4. [TypeScript & API Design Review](#4-typescript--api-design-review)
5. [Gesture System Deep Dive](#5-gesture-system-deep-dive)
6. [React-Specific Review](#6-react-specific-review)
7. [Suggested Improvements](#7-suggested-improvements)
8. [Actionable Checklist](#8-actionable-checklist)

---

## 1. Executive Summary

| Metric | Rating |
|--------|--------|
| **Overall System Health** | **4 / 10** |
| **Architecture** | Promising but undermined by implementation bugs |
| **Type Safety** | Weak — heavy use of type assertions, global ambient types |
| **React Integration** | Several anti-patterns and performance traps |
| **State Management** | Custom store with fundamental correctness issues |
| **Gesture Pipeline** | Well-structured, but singleton design breaks under real-world use |

### Top 5 Risks

1. **Custom state store (`createStore`) mutates-in-place then shallow-copies** — breaks snapshot guarantees, causes stale/corrupted reads, and makes every selector re-render all subscribers on every write.
2. **`carouselState.ensure()` mutates the snapshot directly outside `setState`** — state changes with no re-render notification, silent data corruption.
3. **Interpreter is a global singleton** — two interactive carousels active simultaneously will corrupt each other's gesture.
4. **Carousel slot rotation happens in a `useEffect` but slot data is read during render** — one-frame glitch where wrong scenes are shown after an index change.
5. **`onTransitionEnd` fires on all 3 slot divs** — causes the commit handler (`setPosition`) to execute 3 times, triggering 6+ unnecessary re-renders plus 3 orphan `setTimeout` callbacks.

### General Recommendation

**Needs refactor before scaling.** The descriptor-pipeline architecture is sound and scalable in design, but the state store, interpreter singleton, and carousel state management have correctness bugs that will compound as features are added. Fix the state store and interpreter before building slider/drag on top of this foundation.

---

## 2. Issues by Severity

---

### 🔴 Critical

---

#### C1 — State store mutates in-place, then shallow-copies top level

**File:** `interaction/state/stateReactAdapter.ts`  
**Location:** `setState` function

```ts
function setState(updater: (draft: T) => void) {
    updater(state)          // mutates the CURRENT state object
    state = { ...state }    // shallow-copies top-level only
    listeners.forEach((cb) => cb())
}
```

**Explanation:**  
The updater function receives the live `state` object and mutates it directly. Then `state = { ...state }` creates a new top-level reference but all nested objects (`lanes`, individual lane records, `views`) are **shared** between the old and new snapshots. Any code that captured a previous snapshot reference now sees mutated data.

**Why it's dangerous:**
- `useSyncExternalStore` guarantees are violated — React assumes `getSnapshot()` returns an immutable snapshot. Here, previous snapshots are retroactively mutated.
- In Concurrent Mode / React 18+ transitions, tearing is possible because the same object is both "old snapshot" and "new snapshot."
- Debugging is extremely difficult because state appears to "change in the past."

**Suggested fix:**  
Either use a proper immutable update pattern (structuredClone or manual deep-copy before mutation), or adopt a proven library (Zustand, which uses the exact same `useSyncExternalStore` pattern but with proper immutable semantics via Immer or spread).

**Fix difficulty:** Medium (touches all state files)

---

#### C2 — `carouselState.ensure()` mutates state outside `setState`

**File:** `interaction/state/carouselState.ts`  
**Location:** `ensure()` method

```ts
ensure(id: string) {
    const s = useCarouselState.getSnapshot()
    let lane = s.lanes[id]
    if (!lane) {
        lane = { ... }
        s.lanes[id] = lane   // direct mutation, no setState, no listener notify
    }
    return lane
}
```

**Explanation:**  
This grabs the current snapshot and writes to it directly. No `setState` is called, so no listeners fire and no re-render occurs. The mutation is invisible to React.

**Why it's dangerous:**
- New lanes are silently created with no UI update.
- If `ensure` creates a lane and later code reads it via `useStore`, React may or may not see it depending on whether an unrelated `setState` call happened in between.
- Inconsistent with `dragStateFn.ensure(id, s)` and `sliderStateFn.ensure(id, s)` which take the state draft as a parameter and are designed to be called inside `setState`.

**Suggested fix:**  
Refactor to match the drag/slider pattern — accept a state draft parameter, call only from inside `setState`.

**Fix difficulty:** Easy

---

#### C3 — Nested `setState` in `swipeStart` → `setPosition`

**File:** `interaction/state/carouselState.ts`  
**Location:** `swipeStart()` → `setPosition()`

```ts
swipeStart(desc: Descriptor) {
    useCarouselState.setState(() => {          // OUTER setState
        const lane = this.ensure(desc.base.id)
        lane.dragging = true
        if (lane.pendingDir !== null)
            this.setPosition(desc.base.id)     // calls setState AGAIN inside
        lane.pendingDir = null
    })
}
```

**Explanation:**  
`setPosition` calls `useCarouselState.setState(...)` internally. The store implementation doesn't batch or guard against re-entrancy. The inner `setState` mutates state, shallow-copies, and notifies listeners **while the outer `setState` is still executing**. After the inner call returns, the outer `setState` does its own `state = { ...state }` and notifies listeners again.

**Why it's dangerous:**
- Listeners are notified with an intermediate state between inner and outer writes.
- React components may render with half-applied mutations.
- The inner `setPosition` also schedules a `setTimeout` that fires a third `setState`, compounding the issue.

**Suggested fix:**  
Add batching to the store (defer listener notification until the outermost `setState` completes), or flatten the logic so `swipeStart` performs all mutations in a single `setState` call without delegating to `setPosition`.

**Fix difficulty:** Medium

---

#### C4 — Carousel slot rotation happens in `useEffect` but slots are read during render

**File:** `components/primitives/carousel/Carousel.tsx`  
**Location:** Slot rotation effect & render body

```tsx
// During render — reads OLD slot data
const slots = slotsRef.current
const Scene0 = augmentedScenes[slots[0].sceneIdx]

// After render — updates slots to match new index
useEffect(() => {
    // ... rotates slotsRef.current based on new index
}, [index, total, id])
```

**Explanation:**  
When the carousel index changes (via `setPosition`), the component re-renders. During that render, `slotsRef.current` still holds the **old** slot assignments because the rotation effect hasn't fired yet. React renders the DOM with stale scene->slot mappings. The effect then updates the ref, but ref mutations don't trigger a re-render, so the fix only arrives on the **next** unrelated render.

**Why it's dangerous:**
- For one frame, the wrong scene components are rendered in the wrong positions.
- On slow devices, this manifests as a visible flicker/flash of incorrect content.
- The `setTimeout(0)` in `setPosition` that flips `settling=false` often provides the "next render," masking the bug on fast hardware — but not reliably.

**Suggested fix:**  
Move slot rotation into the render phase (compute slots directly from `index` and `prevIndexRef` during render, not in an effect). Alternatively, use state instead of a ref for slots so the rotation triggers its own re-render.

**Fix difficulty:** Medium

---

#### C5 — Global singleton interpreter breaks multi-carousel interaction

**File:** `interaction/core/interpreter.ts`  
**Location:** Module-level `gesture` object

```ts
const gesture: GestureState = {
    phase: 'IDLE',
    start: { x: 0, y: 0 },
    last: { x: 0, y: 0 },
    totalDelta: { x: 0, y: 0 }
}
```

**Explanation:**  
There is exactly one `gesture` object for the entire application. Every `usePointerForwarding` hook calls `pipeline.orchestrate`, which uses this single interpreter. If carousel A is being swiped and the user's other finger touches carousel B, carousel B's `pointerdown` handler fires (its own `isActive.current` is false), calls `pipeline.orchestrate({ eventType: 'down', ... })`, which resets `gesture.phase` to `PENDING` and overwrites `gesture.desc` — destroying carousel A's in-progress gesture.

**Why it's dangerous:**
- Only one gesture can exist at a time, globally.
- Multi-touch or overlapping interactions corrupt each other silently.
- As the system adds drag/slider/button components, all sharing the same singleton, conflicts become inevitable.

**Suggested fix:**  
Either scope the interpreter per interactive element (instance-based rather than singleton), or track multiple concurrent gestures keyed by pointerId.

**Fix difficulty:** Hard

---

### 🟠 High

---

#### H1 — `resolveByAxis1D` doesn't handle `axis === 'both'`

**File:** `interaction/solvers/vectorUtils.ts`  
**Location:** `resolveByAxis1D()`

```ts
resolveByAxis1D(value: Vec2, axis: Axis) {
    if (!axis || !value) return { prim: undefined, sub: undefined }
    if (axis === 'horizontal') return { prim: value.x, sub: value.y }
    if (axis === 'vertical') return { prim: value.y, sub: value.x }
    // 'both' falls through → returns undefined
}
```

**Explanation:**  
`Axis` includes `'both'` but the function has no branch for it. When axis is `'both'`, the function returns `undefined` (implicit). Any caller doing `result.prim` or `result?.prim` will crash or get `undefined`. The `normalize1D` function in `solverUtils.ts` calls this and accesses `.prim` and `.sub` on the result.

**Why it's dangerous:**  
Drag components can have `axis: 'both'`. Using drag with this axis will cause a runtime crash in the solver pipeline.

**Suggested fix:**  
Add a `'both'` branch (e.g., return `{ prim: value.x, sub: value.y }` or define 2D behavior explicitly), or prevent `'both'` from reaching 1D normalize functions.

**Fix difficulty:** Easy

---

#### H2 — `carouselState.getSize` returns `0` instead of `Vec2`

**File:** `interaction/state/carouselState.ts`  
**Location:** `getSize()`

```ts
getSize(id: string): Vec2 {
    return useCarouselState.getSnapshot().lanes[id]?.size ?? 0
    //                             type is Vec2    fallback is number ^^
}
```

**Explanation:**  
Return type annotation says `Vec2` but the nullish coalescing fallback is `0` (a `number`). When lane doesn't exist, callers expecting `{ x, y }` will get `0` and crash when accessing `.x` or `.y`.

**Why it's dangerous:**  
Any code path that calls `state.getSize('carousel', id)` before the lane is initialized will receive a number instead of a Vec2, causing runtime errors in the solver pipeline.

**Suggested fix:**  
Change fallback to `{ x: 0, y: 0 }`.

**Fix difficulty:** Easy

---

#### H3 — `onTransitionEnd` fires once per slot (3 times)

**File:** `components/primitives/carousel/Carousel.tsx` + `hooks/useCarouselMotion.ts`  
**Location:** `onTransitionEnd` callback

**Explanation:**  
All 3 slot `<div>`s have CSS transitions and `onTransitionEnd={onTransitionEnd}`. When a swipe commit changes the offset, all 3 undergo a transform transition simultaneously. Each fires `onTransitionEnd`, calling `state.setPosition("carousel", id)` three times.

First call: `pendingDir` is set → full mutation (index change, settling, etc.).  
Second & third calls: `pendingDir` is now `null` → the updater bails out with `return false`, BUT `setState` **still** creates a new state reference and notifies listeners → 2 wasted re-renders. Each also schedules a `setTimeout(0)` for `settling=false` → 3 more wasted re-renders.

**Total:** 6 unnecessary re-renders per swipe commit (3 no-op setStates + 3 setTimeout setStates).

**Suggested fix:**  
Guard `setPosition` to be a no-op outside `setState` when `pendingDir` is null (return before calling setState). Or attach `onTransitionEnd` to only the "current" role slot.

**Fix difficulty:** Easy

---

#### H4 — `useStore` selector doesn't prevent re-renders

**File:** `interaction/state/stateReactAdapter.ts`

```ts
function useStore<U = T>(selector?: (s: T) => U): U {
    const snapshot = useSyncExternalStore(subscribe, getSnapshot)
    return selector ? selector(snapshot) : (snapshot as unknown as U)
}
```

**Explanation:**  
`useSyncExternalStore` compares `getSnapshot()` results by reference. Since `setState` always does `state = { ...state }` (new reference), the component re-renders on **every** `setState` call, regardless of whether the selected slice changed. The selector only extracts data *after* the re-render decision has already been made.

**Why it's dangerous:**  
During a drag gesture at 60fps, every `pointermove` triggers `setState`, re-rendering **all** components subscribed to that store — not just the active carousel.

**Suggested fix:**  
Integrate the selector into `useSyncExternalStore` by passing a memoized `getSnapshot` that returns the selected value:

```ts
function useStore<U = T>(selector?: (s: T) => U): U {
    const sel = selector ?? ((s: T) => s as unknown as U)
    const snap = useSyncExternalStore(
        subscribe,
        () => sel(state)  // reference-stable per selected value
    )
    return snap
}
```

This still requires the selected value to be referentially stable (or use a custom equality comparator). For object selectors like `s => s.lanes[id]`, the top-level shallow copy doesn't change nested references, so it would actually prevent unnecessary re-renders. But for primitive selectors like `s => s.lanes[id]?.index`, it works perfectly since primitives are compared by value.

**Fix difficulty:** Medium

---

#### H5 — `onReaction` callback identity causes effect teardown on every render

**File:** `interaction/bridge/bridge.ts`  
**Location:** `usePointerForwarding` effect dependencies

```ts
useEffect(() => {
    // ... sets up pointerdown/move/up listeners
    el.addEventListener('reaction', handleReaction)
    return () => {
        el.removeEventListener('pointerdown', handlePointerDown)
        // ...
    }
}, [elRef, onReaction, disabled])  // onReaction changes every render
```

The Carousel passes an inline arrow function:
```tsx
usePointerForwarding({
    onReaction: (reaction) => { ... }   // new reference every render
})
```

**Why it's dangerous:**  
On every render, all pointer event listeners are torn down and re-attached. During a gesture, this can cause missed events or broken pointer capture.

**Suggested fix:**  
Use a ref to hold the latest `onReaction` callback and remove it from the effect dependency array:

```ts
const onReactionRef = useRef(onReaction)
onReactionRef.current = onReaction
// inside effect: onReactionRef.current?.(e as CustomEvent)
```

**Fix difficulty:** Easy

---

#### H6 — `setPosition` always returns `true` regardless of whether it did anything

**File:** `interaction/state/carouselState.ts`  
**Location:** `setPosition()`

```ts
setPosition(id: string): boolean {
    useCarouselState.setState(() => {
        const lane = this.ensure(id)
        if (!lane.pendingDir) return false  // ← this is the UPDATER's return, not setPosition's
        // ...
    })
    setTimeout(() => { ... }, 0)
    return true   // ← always true, even if the updater bailed out
}
```

**Explanation:**  
The `return false` inside the `setState` updater is swallowed by `setState` (which has return type `void`). The outer function always returns `true` and always schedules the `setTimeout`. Callers cannot know whether the position actually changed.

**Fix difficulty:** Easy

---

#### H7 — Latent null crash on `target.data.locked`

**File:** `interaction/core/intentUtils.ts`  
**Location:** `resolveSwipeTarget()`

```ts
if (canSwipe && !target.data.locked) {
```

**Explanation:**  
`target.data` can be `null` for button descriptors (since `InteractionDataMap['button'] = null`). Currently protected by `canSwipe` being false for buttons (because buttons aren't `laneValid`). But if any button element gains `data-swipe` or `data-react-swipe` attributes, `canSwipe` becomes true and `target.data.locked` crashes with `TypeError: Cannot read properties of null`.

**Suggested fix:**  
Add a null guard: `!target.data?.locked`

**Fix difficulty:** Easy

---

### 🟡 Medium

---

#### M1 — `setTimeout(0)` for settling transition is a fragile timing hack

**File:** `interaction/state/carouselState.ts`  
**Location:** `setPosition()`

```ts
setTimeout(() => {
    useCarouselState.setState(() => {
        const lane = this.ensure(id)
        lane.settling = false
    })
}, 0)
```

**Explanation:**  
The intent is: set `settling=true` (disabling CSS transition), apply the index change and reset offset, then immediately re-enable transitions. The `setTimeout(0)` defers `settling=false` to the next macrotask, allowing the DOM to paint the instantaneous jump before transitions resume.

**Why it's risky:**
- No guarantee that the browser has painted before `setTimeout(0)` fires. On fast machines, both mutations (settling=true and settling=false) may batch into one paint, re-enabling transitions before the jump is painted, causing a visible animation artifact.
- The `setTimeout` is never cleaned up — if the component unmounts, it fires against stale or dismounted state.

**Suggested fix:**  
Use `requestAnimationFrame` (or double-rAF) for paint-accurate timing, and clear it on unmount.

**Fix difficulty:** Easy

---

#### M2 — Type assertions without runtime validation in solvers

**File:** `interaction/solvers/carouselSolver.ts`, `sliderSolver.ts`, `dragSolver.ts`

```ts
const desc = descriptor as CarouselDescriptor
```

**Explanation:**  
Solvers cast the generic `Descriptor` to a specific type without any runtime check. If the solver registry is misconfigured or the pipeline routes a wrong descriptor type, the solver silently operates on incorrect data. No crash, just wrong behavior.

**Suggested fix:**  
Add a runtime assertion at solver entry: `if (desc.base.type !== 'carousel') throw new Error(...)`.

**Fix difficulty:** Easy

---

#### M3 — Global type pollution via `declare global`

**File:** `config/types/gestures.d.ts`, `config/types/reactTS.d.ts`

**Explanation:**  
~40 types are injected into the global scope. This means `Descriptor`, `Vec2`, `Axis`, `EventType`, etc. are available everywhere without imports. While convenient in small codebases, this causes:
- No explicit dependency tracking — impossible to know which files depend on which types.
- Name collision risk as the codebase grows.
- IDE auto-import suggestions polluted.

**Suggested fix:**  
Export types from a central module and import them explicitly.

**Fix difficulty:** Medium (many files need import additions)

---

#### M4 — Scene components not memoized

**File:** All scene files (`Top1.tsx`, `Mid1.tsx`, etc.)

**Explanation:**  
During a gesture, the carousel re-renders on every `pointermove` (because the store emits on every `setState`). Each re-render re-invokes `<Scene0 />`, `<Scene1 />`, `<Scene2 />`. Since these are function components without `React.memo`, React re-renders them even though they have no props.

**Suggested fix:**  
Wrap scene components in `React.memo()` or extract them to prevent unnecessary child re-renders.

**Fix difficulty:** Easy

---

#### M5 — Disabled gesture cleanup sends `(0, 0)` coordinates

**File:** `interaction/bridge/bridge.ts`  
**Location:** Disabled cleanup effect

```ts
if (isActive.current && activePointerId.current !== null) {
    pipeline.orchestrate({
        eventType: 'up',
        x: 0,      // fabricated coordinates
        y: 0,
    })
}
```

**Explanation:**  
When `disabled` flips to true during an active gesture, a synthetic 'up' event is dispatched at coordinates (0, 0). The pipeline processes this as a real gesture end. The descriptor's delta will be wildly wrong (relative to (0,0) instead of actual finger position). For carousels, the commit/revert logic will see a massive delta and likely commit in an unintended direction.

**Suggested fix:**  
Use `interpreter.resetGesture()` directly to abort the gesture without running through the solver/state pipeline. Alternatively, track the last known position.

**Fix difficulty:** Easy

---

#### M6 — `resolveGate` can oscillate during a single gesture

**File:** `interaction/solvers/solverUtils.ts`  
**Location:** `resolveGate()`

```ts
resolveGate(norm: Normalized1D) {
    const currentPos = (norm.crossOffset ?? 0) + (norm.crossDelta ?? 0)
    const crossSize = norm.crossTrackSize ?? 0
    return currentPos < 0 || currentPos > crossSize
}
```

**Explanation:**  
`crossOffset` is the initial touch offset in the cross axis (set once at `onDown`). `crossDelta` is the cumulative gesture delta. As the user drags their finger back and forth across the cross axis, the gate toggles between true/false each frame. When gated, the swipe solver returns `{ stateAccepted: false }`, causing the carousel to freeze mid-drag. When ungated, it resumes. This creates visible jitter.

**Suggested fix:**  
Once a gesture starts (swipeStart), latch the gate decision and don't re-evaluate on every frame. Or apply a hysteresis margin.

**Fix difficulty:** Medium

---

#### M7 — StrictMode double-mount breaks carousel initialization

**File:** `components/primitives/carousel/Carousel.tsx`

```tsx
useEffect(() => {
    state.ensure('carousel', id)
}, [id])
```

**Explanation:**  
In React StrictMode (used in `main.tsx`), effects run twice. The first invocation of `ensure()` creates the lane via direct mutation. The cleanup (none) runs. The second invocation calls `ensure()` again, which finds the lane already exists (from the first mutation) and returns it. This happens to work, but only because `ensure` mutates outside `setState`. If `ensure` is fixed per issue C2, StrictMode behavior must be considered.

**Fix difficulty:** Easy (part of C2 fix)

---

#### M8 — CSS class `scene-root` used on both Root component and scenes

**File:** `app/Root.tsx` and scene files

```tsx
// Root.tsx
<div className="scene-root"> ... </div>

// Top1.tsx
<div className="scene-root a"> ... </div>
```

**Explanation:**  
The `.scene-root` CSS class applies `position: absolute; width: 100%; height: 100%`. When used on the Root component's container, this can cause the root to collapse or overlap, depending on parent layout.

**Fix difficulty:** Easy

---

### 🟢 Low

---

#### L1 — Dead and commented-out code

**Files:**
- `components/primitives/metaHooks/metaHooks.ts` — entirely commented out
- `app/Root.tsx` — commented import `OverlayLayer`
- `interaction/state/carouselState.ts` — commented `get()` method
- `interaction/solvers/dragSolver.ts` — commented imports

**Fix difficulty:** Easy

---

#### L2 — Inconsistent `ensure()` signatures across state files

- `carouselStateFn.ensure(id)` — takes only `id`, reads snapshot internally
- `dragStateFn.ensure(id, s)` — takes `id` + state draft
- `sliderStateFn.ensure(id, s)` — takes `id` + state draft

**Fix difficulty:** Easy (standardize to the drag/slider pattern)

---

#### L3 — No `getServerSnapshot` in `useSyncExternalStore`

**File:** `interaction/state/stateReactAdapter.ts`

Not a concern for a mobile launcher, but would break SSR if ever needed.

**Fix difficulty:** Easy

---

#### L4 — Concurrent Mode hazard: ref mutation during render

**File:** `components/primitives/carousel/Carousel.tsx`

```tsx
if (!slotsRef.current) {
    slotsRef.current = [...]  // mutation during render phase
    prevIndexRef.current = index
}
```

**Explanation:**  
In React Concurrent Mode, the render function may be called multiple times before committing. Mutating a ref during render means if React discards this render and retries, the ref is already mutated. This particular case (initialization guard) is unlikely to cause issues in practice, but it's formally incorrect.

**Fix difficulty:** Easy (use `useState` lazy initializer or `useMemo`)

---

#### L5 — `isStateFn2Arg` guard doesn't match `StateFn2Arg` type

**File:** `config/utils/gestureTypeGuards.ts`

```ts
export function isStateFn2Arg(fnName: string): fnName is StateFn2Arg {
    return ['press', 'swipeStart', 'swipe', 'swipeCommit', 'swipeRevert'].includes(fnName)
}
```

`StateFn2Arg` includes getters like `'getSize'`, `'get'`, `'ensure'`, etc. The guard only checks the mutation functions. The name and narrowing type are technically incorrect (the guard is actually `isMutationFn`).

**Fix difficulty:** Easy

---

#### L6 — `useCarouselScenes` hook is unused

**File:** `components/primitives/carousel/hooks/useCarouselScenes.ts`

This hook is defined and exported but never imported anywhere. The slot management logic lives directly in `Carousel.tsx`.

**Fix difficulty:** Easy (delete or integrate)

---

---

## 3. Performance Review

### Re-render Risks

| Issue | Impact | File |
|-------|--------|------|
| Every `setState` re-renders ALL subscribers to that store | **High** — during a 60fps gesture, every `pointermove` re-renders every carousel/mirror that subscribes to `useCarouselState` | `stateReactAdapter.ts` |
| `onTransitionEnd` fires 3x per commit | **Medium** — 6+ extra re-renders per swipe | `Carousel.tsx` |
| `onReaction` inline callback causes effect teardown every render | **High** — pointer listeners are torn down and re-created on every render | `bridge.ts` |
| Scene components not memoized | **Medium** — unnecessary child re-renders during gesture | All scene files |
| `DebugWrapper` selector creates new object every render | **Low** — `(s) => ({ device: s.device, scale: s.scale })` returns new ref every call | `DebugWrapper.tsx` |

### Event Listener Inefficiencies

- `usePointerForwarding` tears down and re-attaches all 5 event listeners (pointerdown, pointermove, pointerup, pointercancel, reaction) on every render due to the `onReaction` dependency.
- `ResizeObserver` in `useCarouselSizing` depends on `[elRef, axis, id]`. If `elRef` is a new object on re-mount, the observer is re-created unnecessarily. (Currently `elRef` is from `useRef`, so stable.)

### Memory Leaks

- `setTimeout(0)` in `setPosition` is never cleared. If the carousel unmounts before it fires, the callback runs against orphaned state.
- `drawDots` in debug mode creates DOM elements with a 500ms `setTimeout` for removal. Under rapid gestures, hundreds of dot elements can accumulate.

### Expensive Calculations

- `normalize1D` is called on every `swipe` event, allocating a new object each time. This is unavoidable but could benefit from object pooling in a 60fps path.
- `document.elementsFromPoint(x, y)` in `targetResolver.resolveFromPoint` queries the DOM on every pointer event. This is a relatively expensive DOM API.

### Optimization Suggestions

1. **Add selector support to `useSyncExternalStore`** — pass selector into `getSnapshot` to avoid unnecessary re-renders (see H4).
2. **Stabilize `onReaction` callback** — use a ref pattern to prevent effect teardown (see H5).
3. **Debounce or throttle `elementsFromPoint`** — during active swipes, the target is already known and doesn't need to be re-resolved.
4. **Use `React.memo`** on scene components.
5. **Guard `setPosition`** before calling `setState` to avoid no-op state notifications.

---

## 4. TypeScript & API Design Review

### Unsafe Types

| Issue | Location |
|-------|----------|
| `Descriptor` is a union but always accessed as if it's generic | `pipeline.ts`, all solvers |
| `desc.data` can be `null` (button type) but accessed without null checks | `intentUtils.ts` → `resolveSwipeTarget` |
| `carouselState.getSize` returns `number` at runtime but declares `Vec2` | `carouselState.ts` |
| `GestureUpdate` has `[key: string]: unknown` index signature | `gestures.d.ts` — obliterates type safety |
| `RuntimeData.delta` is `Vec2` but carousel solver writes `delta1D: number` — parallel conflicting delta representations | `gestures.d.ts` |
| `SolverFn` returns `Partial<RuntimeData> | void` but alias `RuntimePatch` exists and isn't consistently used | `pipeline.ts` vs solvers |

### Leaky Abstractions

- The `Descriptor` type encodes ALL interaction types in a single union, meaning every consumer must handle (or ignore) properties from carousel, slider, drag, AND button. This leaks internal implementation details to every layer.
- `RuntimeData` carries `delta` (Vec2), `delta1D` (number), `sliderStartOffset`, `sliderValuePerPixel` — all specific to certain interaction types but present on the shared type. This is a "god type" anti-pattern.

### Missing Constraints

- No branded types or nominal typing — an `id` is just a `string`, nothing prevents passing a carousel id where a slider id is expected.
- `Axis` includes `'both'` but no solver or utility function correctly handles it.
- `DataKeys` excludes `'button'` but the exclusion is implicit (`Exclude<InteractionType, 'button'>`) — if new types are added they are silently included in `DataKeys`.

### Suggestions for Stronger Typing

1. Split `RuntimeData` into per-type runtime types: `CarouselRuntime`, `SliderRuntime`, `DragRuntime`.
2. Remove the `[key: string]: unknown` index signature from `GestureUpdate`.
3. Use discriminated union on `Descriptor` with a literal type field so TypeScript narrows automatically:
   ```ts
   type Descriptor = 
     | { base: { type: 'carousel'; ... }; data: CarouselData & Modifiers; ... }
     | { base: { type: 'slider'; ... }; data: SliderData & Modifiers; ... }
     | ...
   ```
4. Use `as const satisfies` for configuration objects to infer literal types.

---

## 5. Gesture System Deep Dive

### Descriptor Lifecycle

1. **Construction** (`targetResolver.resolveFromElement`) — Builds a descriptor from DOM data-attributes. This is where element, id, axis, type, data, and reactions are resolved.
2. **Enrichment** (`interpreter.ts`) — Attaches runtime data (event type, delta). Stores the descriptor on the singleton `gesture` object.
3. **Solving** (`pipeline.ts` → solver) — Solver reads descriptor, computes a `RuntimePatch`, merges it back.
4. **State mutation** (`stateManager` → per-type state) — If `stateAccepted`, state is mutated.
5. **Rendering** (`renderer.ts`) — DOM attributes set, custom event dispatched.

**Gap:** There is no formal descriptor validation between steps. A corrupted descriptor propagates silently through the entire pipeline.

### Runtime Mutation Safety

**Unsafe.** The gesture object's `desc` is mutated in-place throughout the flow:
```ts
gesture.desc.runtime = { ...gesture.desc.runtime, event: 'swipe', delta: ... }
```
Since the same object reference is stored in `gesture.desc`, passed to the pipeline, and potentially captured by event handlers, mutations are visible to all holders of that reference. This is intentional for performance but makes debugging extremely difficult and prevents any concurrent gesture processing.

### Event → State Mapping Correctness

The mapping is generally correct for the happy path:
- `press` → state write (slider only)
- `swipeStart` → `dragging: true`, reset offset
- `swipe` → update offset
- `swipeCommit` → compute direction, set `pendingDir`
- `swipeRevert` → reset offset, `dragging: false`

**Issues found:**
1. `swipeCommit` in `carouselSolver` may return `{ event: 'swipeRevert', stateAccepted: true }`. This modifies `event` field after the solver, which then routes to `state.swipeRevert()` via the pipeline's `state[solution.runtime.event]` call. This is clever but non-obvious — the solver can change which state function is called.
2. When the solver returns `event: 'swipeRevert'`, the renderer sees `swipeRevert` and clears `data-swiping`. But the original DOM event that triggered this was `swipeCommit`. This mismatch means `data-swiping` is removed twice on revert (once from swipeCommit handler, never — wait, `typeHandlers['swipeCommit']` already removes `data-swiping`). Actually, since the event is *overwritten* to `swipeRevert`, the renderer uses `swipeRevert`'s handler, not `swipeCommit`'s. Both remove `data-swiping`, so there's no visible bug here — but the intent is fragile.

### Multi-Gesture Conflicts

**Critical failure mode.** Two gestures cannot coexist:
- Only one `gesture` object (C5)
- Only one `gesture.desc`
- No gesture queue or priority system
- No gesture arbitration when overlapping elements support different interaction types

### Axis Handling Correctness

- `resolveAxis` correctly handles `horizontal`, `vertical`, `both`
- `resolveByAxis1D` **does not handle `both`** (H1)
- `resolveGate` assumes single-axis movement model — breaks for `axis: 'both'`
- Carousel correctly constrains swipe to its declared axis
- `normalizedDelta` normalizes both axes regardless of which is primary

### Modifier Interactions

- `lockSwipeAt` works correctly for carousel — blocks swipe past specified indices
- `snap` works correctly for drag — snaps to grid on commit
- `locked` prevents swiping (checked in `resolveSwipeTarget` and `buildReactions`)
- **Missing:** No modifier for carousel snap-to-index override, no velocity-based commit

---

## 6. React-Specific Review

### Hook Misuse

| Issue | Severity | Location |
|-------|----------|----------|
| `useEffect` for slot rotation that should be computed during render | 🔴 | `Carousel.tsx` |
| `onReaction` callback not stabilized with `useCallback` or ref | 🟠 | `Carousel.tsx` → `usePointerForwarding` |
| `useEffect` with mutation-only body (no cleanup needed) for `state.ensure` | 🟡 | `Carousel.tsx` |

### State vs Ref Misuse

- `slotsRef` should be state (or derived during render) since changes to it affect rendered output.
- `mountedRef` is used to skip the first effect run — this is a workaround for not having initial state logic in the render phase.
- `prevIndexRef` is correctly used as a ref (previous-value tracking).
- `isActive` and `activePointerId` in `bridge.ts` are correctly refs (event handler state, not render-affecting).

### Unnecessary Renders

- Every call to any store's `setState` re-renders ALL subscribers (see H4).
- `DebugWrapper` creates a new selector return object every render: `(s) => ({ device: s.device, scale: s.scale })`.
- Inline `onReaction` arrow function in `Carousel.tsx` causes effect re-runs.

### Effects That May Cause Bugs

1. **Carousel slot rotation effect** — runs after render, leaves one frame with stale slots (C4).
2. **`setCount` effect** has `interactive` in deps but only conditionally calls `setCount`:
   ```tsx
   useEffect(() => {
       if (interactive)
           state.setCount('carousel', id, scenes.length)
   }, [id, scenes.length, interactive])
   ```
   When `interactive` changes from true to false, the effect runs but does nothing. Count is not reset. This is likely intentional but worth documenting.
3. **`useCarouselSizing` ResizeObserver** — depends on `[elRef, axis, id]`. `elRef` is a RefObject (stable), but if `axis` or `id` change, the observer is torn down and re-created. Axis and id are typically static props, but if they aren't, the observer would briefly miss resize events.

### Component Structure Issues

- `Carousel.tsx` is ~150 lines with mixed concerns: state subscription, sizing, slot management, motion, pointer forwarding, scene resolution, and rendering. Consider splitting into smaller components or custom hooks.
- `MirrorWrapper.tsx` duplicates the slot rotation logic from `Carousel.tsx`. If the algorithm changes, both must be updated.

---

## 7. Suggested Improvements

### Architectural Upgrades

1. **Replace `createStore` with Zustand.** Zustand uses the same `useSyncExternalStore` pattern but correctly handles immutable updates, selector-based subscriptions, and batching. The migration API surface is nearly identical.

2. **Instance-based interpreter.** Create a `GestureInterpreter` class that is instantiated per interactive element. Each instance tracks its own gesture state. The `usePointerForwarding` hook creates and manages its own interpreter instance.

3. **Move slot rotation into the render phase.** Compute `slots` as derived state from `index` and `prevIndex` during render, not in an effect. Use `useMemo` or a pure function:
   ```ts
   const slots = useMemo(() => computeSlots(index, prevIndexRef.current, total), [index, total])
   ```

4. **Add re-entrancy guard to `setState`.** Track whether `setState` is currently executing. If called re-entrantly, queue the updater instead of executing immediately. Flush the queue and notify listeners once after all updaters run.

### Simplifications

1. **Remove `views` from state.** The `views` records in carousel/drag/slider state are never read in the current codebase (commented out or unused). They add complexity without value.

2. **Eliminate `ensure()` from the hot path.** Call `ensure` once during component mount (via `useEffect`). In solver/state mutation code, trust that the lane exists (it was ensured at mount). This converts `ensure` from a per-event check to a one-time setup.

3. **Delete `useCarouselScenes.ts`** — it's unused and superseded by `useAugmentedScenes` + inline slot logic.

4. **Delete `metaHooks.ts`** — entirely commented out.

### Patterns to Adopt

1. **Discriminated union for Descriptor** — use `type` field as discriminator for automatic narrowing.
2. **Stable callback refs** — use the `useRef` pattern for event callbacks passed to effects.
3. **`React.memo`** on all scene/content components.
4. **`requestAnimationFrame` for settling transition** instead of `setTimeout(0)`.
5. **Early exit in `setPosition`** before calling `setState` if `pendingDir` is null.

### Things to Remove

- `views` records in all state files
- `metaHooks.ts`
- `useCarouselScenes.ts`
- Commented-out code in `carouselState.ts`, `dragSolver.ts`, `Root.tsx`
- The `[key: string]: unknown` index signature on `GestureUpdate`
- The `scene-root` class from Root.tsx (rename to avoid collision)

---

## 8. Actionable Checklist

### 🔴 Must Fix (Blocks reliable operation)

- [ ] **C1** — Fix `createStore` to use proper immutable updates (or adopt Zustand)
- [ ] **C2** — Refactor `carouselState.ensure()` to work inside `setState` only
- [ ] **C3** — Eliminate nested `setState` in `swipeStart` → `setPosition`
- [ ] **C4** — Move slot rotation from `useEffect` into render phase
- [ ] **C5** — Make interpreter instance-based or support concurrent gestures

### 🟠 Should Fix (Likely bugs / significant performance)

- [ ] **H1** — Handle `axis: 'both'` in `resolveByAxis1D`
- [ ] **H2** — Fix `getSize()` fallback to return `{ x: 0, y: 0 }`
- [ ] **H3** — Guard `onTransitionEnd` / `setPosition` from firing multiple times
- [ ] **H4** — Add selector support to `useSyncExternalStore` to prevent unnecessary re-renders
- [ ] **H5** — Stabilize `onReaction` callback with ref pattern
- [ ] **H6** — Fix `setPosition` return value / guard before calling `setState`
- [ ] **H7** — Add null guard for `target.data?.locked`

### 🟡 Should Address (Code quality / edge cases)

- [ ] **M1** — Replace `setTimeout(0)` with `requestAnimationFrame` for settling
- [ ] **M2** — Add runtime type assertions in solver entry points
- [ ] **M3** — Migrate ambient global types to explicit imports
- [ ] **M4** — Wrap scene components in `React.memo`
- [ ] **M5** — Fix disabled gesture cleanup to not use fabricated coordinates
- [ ] **M6** — Latch gate decision per gesture to prevent oscillation
- [ ] **M7** — Verify StrictMode compatibility after `ensure` fix
- [ ] **M8** — Rename Root's container class to avoid `scene-root` collision

### 🟢 Nice to Have (Cleanup)

- [ ] **L1** — Remove dead/commented-out code
- [ ] **L2** — Standardize `ensure()` signatures
- [ ] **L3** — Add `getServerSnapshot` to `createStore`
- [ ] **L4** — Fix ref mutation during render (use `useMemo` or `useState`)
- [ ] **L5** — Fix `isStateFn2Arg` name and scope
- [ ] **L6** — Delete unused `useCarouselScenes.ts`

---

*End of audit.*
