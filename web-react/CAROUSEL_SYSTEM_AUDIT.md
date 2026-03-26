# Carousel System Audit — React + TypeScript Codebase

**Scope:** `web-react/src`  
**Date:** March 21, 2026 (Updated: March 25, 2026)  
**Auditor:** Systems Review (Automated Deep Audit)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Fixed Since Last Audit](#2-fixed-since-last-audit)
3. [Remaining Issues by Severity](#3-remaining-issues-by-severity)
   - [🔴 Critical](#-critical)
   - [🟠 High](#-high)
   - [🟡 Medium](#-medium)
   - [🟢 Low](#-low)
4. [Performance Review](#4-performance-review)
5. [TypeScript & API Design Review](#5-typescript--api-design-review)
6. [Gesture System Deep Dive](#6-gesture-system-deep-dive)
7. [React-Specific Review](#7-react-specific-review)
8. [Suggested Improvements](#8-suggested-improvements)
9. [Actionable Checklist](#9-actionable-checklist)

---

## 1. Executive Summary

| Metric | Rating |
|--------|--------|
| **Overall System Health** | **7 / 10** |
| **Architecture** | Solid — Zustand+Immer store, keyed carousel, pointerId-based interpreter |
| **Type Safety** | Improved but still has global ambient types and type assertions |
| **React Integration** | Good — most anti-patterns resolved; some performance optimizations remain |
| **State Management** | Zustand+Immer — correct immutable updates, proper selector support |
| **Gesture Pipeline** | Well-structured, multi-gesture capable via pointerId-keyed map |

### Remaining Top Risks

1. **`MirrorWrapper.tsx` imports a non-existent `useCarouselState` API** — the component is completely broken and will crash if rendered.
2. **`subscribe.useFull` re-renders on any field change** — during 60fps gestures, all carousel subscribers re-render on every `offset` update, even if they only need `index`.
3. **Scene components not memoized** — unnecessary child re-renders during gesture drag.
4. **Global type pollution via `declare global`** — ~40 types in global scope with no import tracking.

### General Recommendation

**Good foundation for scaling.** The critical state management, interpreter, and carousel rendering bugs from the original audit have been resolved. Remaining work is primarily performance optimization (`usePartial` subscriptions, `React.memo` on scenes) and cleanup (dead code, MirrorWrapper migration, type exports).

---

<!-- ## 2. Fixed Since Last Audit

The following issues from the original audit (March 21) have been resolved:

| ID | Issue | How Fixed |
|----|-------|-----------|
| **C1** | Custom state store mutates-in-place, shallow-copies | Replaced with Zustand + Immer middleware (`zustandStore.ts`) — proper immutable updates |
| **C2** | `ensure()` mutates state outside `setState` | `store.ensure()` uses Zustand's `set()` API properly |
| **C3** | Nested `setState` in `swipeStart` → `setPosition` | `swipeStart` does all mutations in a single `store.mutate` call, no delegation |
| **C4** | Slot rotation in `useEffect`, stale during render | Slots computed via `useMemo` during render; `renderSlots` sorted for stable DOM key order |
| **C5** | Global singleton interpreter | Interpreter now uses `Record<number, GestureState>` keyed by `pointerId` |
| **H2** | `getSize()` returns `0` instead of `Vec2` | Returns `this.ensure(id).size` — `ensure` guarantees `{x:0, y:0}` default |
| **H3** | `onTransitionEnd` fires 3x, 6+ wasted re-renders | `setPosition` guards with `if (!lane.pendingDir) return false` before any mutation |
| **H5** | `onReaction` callback identity causes effect teardown | Uses `useRef(onReaction)` pattern; main effect depends only on `[elRef, disabled]` |
| **H6** | `setPosition` always returns `true` | Guard before `store.mutate` — returns `false` when no `pendingDir` |
| **H7** | Null crash on `target.data.locked` | Uses optional chaining: `target.data?.locked` |
| **M1** | `setTimeout(0)` for settling transition | Replaced with `requestAnimationFrame` |
| **M2** | No runtime validation in carousel solver | `carouselSolver` now throws on wrong descriptor type |
| **M5** | Disabled gesture cleanup sends `(0,0)` coordinates | Uses `pipeline.abortGesture(pointerId)` + pointer capture release |
| **M7** | StrictMode double-mount breaks initialization | `store.ensure()` is idempotent via Zustand — safe under StrictMode |
| **L2** | Inconsistent `ensure()` signatures | All state files now use `ensure(id)` → `store.ensure(type, id, defaults)` |
| **L3** | No `getServerSnapshot` | N/A — using Zustand (handles this internally) |
| **L4** | Ref mutation during render (slotsRef) | Slots are `useMemo`, no ref mutation during render |

--- -->

## 3. Remaining Issues by Severity

---

### 🟠 High

---

#### H1 — `resolveByAxis1D` throws on `axis === 'both'` (no functional support)

**File:** `interaction/solvers/vectorUtils.ts`  
**Location:** `resolveByAxis1D()`

```ts
case 'both':
    throw new Error("resolveByAxis1D called with axis === 'both', which is unsupported")
```

**Explanation:**  
The original silent-undefined bug was fixed with an explicit `throw`. However, `axis: 'both'` still has no functional support in the 1D normalize pipeline. Drag components that use `axis: 'both'` will crash in the solver if they reach `normalize1D`.

**Current status:** Silent crash → loud crash (improved). Functional gap remains.

**Suggested fix:**  
Route `axis: 'both'` through a 2D normalize path, or prevent 1D functions from being called for `'both'` axes.

**Fix difficulty:** Medium

---

#### H4 — `subscribe.useFull` re-renders on any field change

**File:** `interaction/state/zustandHook.ts`  
**Location:** `useFull()`

**Explanation:**  
`useFull` selects the entire `reactive.data` object. Zustand compares selector results by reference (`===`). Since Immer produces a new `data` object on every `store.mutate`, **every mutation to any field** triggers a re-render of all components subscribed via `useFull`.

During a 60fps drag gesture, `swipe()` mutates `offset` on every frame → every Carousel using `useFull` re-renders 60 times/sec, even non-interactive mirrors that only need `index`.

**Why it matters:**  
The store infrastructure (Zustand+Immer) now supports efficient partial subscriptions via `usePartial`, but `Carousel.tsx` still uses `useFull`. This is the primary remaining performance bottleneck.

**Suggested fix:**  
Split `Carousel.tsx` into two subscriptions using `subscribe.usePartial` — one for motion fields (offset, dragging, settling) and one for scene fields (index, count, size). Add `shallow` from `zustand/shallow` as equality function in `usePartial` (see H8).

**Fix difficulty:** Easy–Medium

---

#### H8 — `subscribe.usePartial` lacks shallow equality for object selectors

**File:** `interaction/state/zustandHook.ts`  
**Location:** `usePartial()`

**Explanation:**  
When `usePartial` is called with an object-returning selector (e.g., `d => ({ offset: d.offset, dragging: d.dragging })`), a new object is created on every Zustand notification. Zustand compares by `===` reference, so it always triggers a re-render — the partial selector provides no benefit over `useFull`.

**Suggested fix:**  
Add Zustand's `shallow` equality comparator:
```ts
import { useShallow } from 'zustand/shallow'
// or pass shallow as second arg to useStore
```

**Fix difficulty:** Easy

---

### 🟡 Medium

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
During a gesture, the carousel re-renders on every `pointermove` (via `subscribe.useFull`). Each re-render re-invokes `<Scene />` for all 3 slots. Since these are function components without `React.memo` and receive no props, React re-renders them unnecessarily.

**Suggested fix:**  
Wrap scene components in `React.memo()`.

**Fix difficulty:** Easy

---

#### M6 — `resolveGate` still re-evaluates per frame

**File:** `interaction/solvers/solverUtils.ts`  
**Location:** `resolveGate()`

**Current status:** Hysteresis margin was added via `APP_SETTINGS.hysteresis` (improvement over raw bounds check). The gate no longer flickers at the exact boundary. However, it still evaluates on every frame and can oscillate if the finger moves significantly across the cross axis.

**Remaining risk:**  
If a user's finger drifts far past the hysteresis margin, the gate activates and the carousel freezes. Moving back within hysteresis un-freezes it. Acceptable if hysteresis is generous, but fragile with small values.

**Suggested fix:**  
Latch the gate decision once per gesture. After `swipeStart`, don't re-evaluate.

**Fix difficulty:** Medium

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
`.scene-root` applies `position: absolute; width: 100%; height: 100%`. When used on Root's container, this can cause layout collapse or overlap depending on parent.

**Fix difficulty:** Easy

---

#### M9 — `ensure()` called redundantly on every state mutation in hot path

**File:** `interaction/state/carouselState.ts` (and `sliderState.ts`, `dragState.ts`)

**Explanation:**  
Every `swipe()`, `swipeCommit()`, `swipeRevert()`, etc. calls `this.ensure(desc.base.id)` before mutating. `ensure` calls `store.ensure()` which does `useStore.getState()` lookup. During a 60fps gesture, this is 60 redundant existence checks per second. The reactive is guaranteed to exist — it was ensured at component mount.

**Impact:** Low per-call cost, but adds up at 60fps across multiple carousels.

**Suggested fix:**  
Trust that the reactive exists in mutation functions (it was ensured at mount). Move ensure to initialization only.

**Fix difficulty:** Easy

---

### 🟢 Low

---

#### L1 — Dead and commented-out code (partially cleaned)

**Files still affected:**
- `app/Root.tsx` — commented import `OverlayLayer`
- `interaction/solvers/dragSolver.ts` — commented policy imports
- `interaction/state/sliderState.ts` — large blocks of commented-out old store code
- `interaction/state/dragState.ts` — commented-out old store code

**Previously fixed:**
- ~~`components/primitives/metaHooks/metaHooks.ts`~~ — file deleted
- ~~`interaction/state/carouselState.ts`~~ — commented `get()` removed

**Fix difficulty:** Easy

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

The hook function is defined and exported but never called. Only the `SceneRole` type export is imported (by `Carousel.tsx`).

**Suggested fix:**  
Move the `SceneRole` type to a shared types file and delete the hook file.

**Fix difficulty:** Easy

---

#### L7 — `GestureUpdate` has `[key: string]: unknown` index signature

**File:** `config/types/gestures.d.ts`

**Explanation:**  
The index signature obliterates type safety — any property can be set on a `GestureUpdate` without type errors. This makes `applyGestureUpdate` accept anything.

**Fix difficulty:** Easy

---

---

## 4. Performance Review

### Re-render Risks

| Issue | Impact | File | Status |
|-------|--------|------|--------|
| `subscribe.useFull` re-renders on any field mutation | **High** — 60fps re-renders during drag | `zustandHook.ts`, `Carousel.tsx` | Remaining (H4) |
| `subscribe.usePartial` lacks shallow equality | **High** — object selectors always re-render | `zustandHook.ts` | Remaining (H8) |
| Scene components not memoized | **Medium** — unnecessary child re-renders | All scene files | Remaining (M4) |
| ~~Every `setState` re-renders ALL subscribers~~ | ~~High~~ | ~~`stateReactAdapter.ts`~~ | **Fixed** — Zustand with selectors |
| ~~`onTransitionEnd` fires 3x per commit~~ | ~~Medium~~ | ~~`Carousel.tsx`~~ | **Fixed** — `setPosition` guards before mutate |
| ~~`onReaction` identity causes effect teardown~~ | ~~High~~ | ~~`bridge.ts`~~ | **Fixed** — uses ref pattern |

### Event Listener Efficiency

- ~~`usePointerForwarding` tears down all listeners on every render~~ — **Fixed.** Effect depends on `[elRef, disabled]` only; `onReaction` uses ref pattern.
- `ResizeObserver` in `useCarouselSizing` depends on `[axis, id]`. Both are typically static props. If they change, observer is briefly torn down. Acceptable.

### Memory Leaks

- ~~`setTimeout(0)` in `setPosition` is never cleared~~ — **Fixed.** Uses `requestAnimationFrame` now. (Note: rAF is also not explicitly cleared on unmount, but the mutation is harmless against Zustand store.)
- `drawDots` in debug mode creates DOM elements with a 500ms `setTimeout` for removal. Under rapid gestures, dot elements can accumulate.

### Expensive Calculations (unchanged)

- `normalize1D` allocates a new object on every `swipe` event. Could benefit from object pooling.
- `document.elementsFromPoint(x, y)` in `targetResolver.resolveFromPoint` queries DOM on every pointer event.

### Optimization Suggestions (remaining)

1. **Use `subscribe.usePartial` with `shallow` equality** in `Carousel.tsx` to split motion vs scene subscriptions (H4, H8).
2. **Use `React.memo`** on scene components (M4).
3. **Debounce or throttle `elementsFromPoint`** — during active swipes, the target is already known.
4. **Remove `ensure()` from hot-path mutations** — trust mount-time initialization (M9).

---

## 5. TypeScript & API Design Review

### Unsafe Types (remaining)

| Issue | Location | Status |
|-------|----------|--------|
| `GestureUpdate` has `[key: string]: unknown` index signature | `gestures.d.ts` | Remaining (L7) |
| `RuntimeData.delta` is `Vec2` but carousel solver writes `delta1D: number` | `gestures.d.ts` | Remaining |
| `SolverFn` returns `Partial<RuntimeData> \| void` but alias `RuntimePatch` isn't consistently used | `pipeline.ts` vs solvers | Remaining |
| ~~`desc.data` can be `null` but accessed without null checks~~ | ~~`intentUtils.ts`~~ | **Fixed** — uses `?.` |
| ~~`carouselState.getSize` returns `number` at runtime but declares `Vec2`~~ | ~~`carouselState.ts`~~ | **Fixed** — returns via `ensure()` |

### Leaky Abstractions

- The `Descriptor` type encodes ALL interaction types in a single union, meaning every consumer must handle (or ignore) properties from carousel, slider, drag, AND button. This leaks internal implementation details to every layer.
- `RuntimeData` carries `delta` (Vec2), `delta1D` (number), `sliderStartOffset`, `sliderValuePerPixel` — all specific to certain interaction types but present on the shared type. This is a "god type" anti-pattern.

### Missing Constraints

- No branded types or nominal typing — an `id` is just a `string`, nothing prevents passing a carousel id where a slider id is expected.
- `Axis` includes `'both'` but 1D solver functions throw on it (H1 — crash instead of functional support).
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

## 6. Gesture System Deep Dive

### Descriptor Lifecycle (unchanged)

1. **Construction** (`targetResolver.resolveFromElement`) — Builds descriptor from DOM data-attributes.
2. **Enrichment** (`interpreter.ts`) — Attaches runtime data (event type, delta). Stores on per-pointerId gesture object.
3. **Solving** (`pipeline.ts` → solver) — Solver computes `RuntimePatch`, merges into descriptor.
4. **State mutation** (`stateManager` → per-type state) — If `stateAccepted`, state is mutated.
5. **Rendering** (`renderer.ts`) — DOM attributes set, custom event dispatched.

**Gap:** No formal descriptor validation between steps. A corrupted descriptor propagates silently.

### Runtime Mutation Safety

The gesture object's `desc` is mutated in-place throughout the flow:
```ts
g.desc.runtime = { ...g.desc.runtime, event: 'swipe', delta: ... }
```
Since gestures are now keyed by `pointerId`, this is safe for single-touch. Multi-touch on the same element could still see issues if two pointerIds share a descriptor reference. Runtime spreads (`{ ...runtime, ...patch }`) create shallow copies, preventing cross-frame mutations from leaking.

### Event → State Mapping Correctness

The mapping is correct for the happy path. One non-obvious pattern remains:

`swipeCommit` in `carouselSolver` may return `{ event: 'swipeRevert', stateAccepted: true }`. This overwrites the event type, routing to `state.swipeRevert()` instead of `state.swipeCommit()`. The behavior is correct (revert when threshold not met) but the indirection is non-obvious and hard to trace.

### Multi-Gesture Conflicts

~~**Critical failure mode.**~~ **Fixed.** Gestures are now tracked in a `Record<number, GestureState>` keyed by `pointerId`. Each pointer's lifecycle is independent. `pipeline.abortGesture(pointerId)` cleanly removes a specific gesture. `usePointerForwarding` tracks `activePointerId` per element and ignores events from other pointers.

**Remaining gap:** No gesture arbitration system. If two pointerIds start gestures on overlapping elements simultaneously, both gestures proceed independently. For a mobile launcher (single-touch typical), this is acceptable.

### Axis Handling Correctness (updated)

- `resolveAxis` correctly handles `horizontal`, `vertical`, `both`
- `resolveByAxis1D` now **throws** on `'both'` — prevents silent corruption (H1)
- `resolveGate` has hysteresis margin — improved stability (M6)
- Carousel correctly constrains swipe to its declared axis

### Modifier Interactions (unchanged)

- `lockSwipeAt` works correctly for carousel
- `snap` works correctly for drag
- `locked` prevents swiping
- **Missing:** No velocity-based commit for carousel

---

## 7. React-Specific Review

### Hook Usage (updated)

| Issue | Severity | Location | Status |
|-------|----------|----------|--------|
| ~~`useEffect` for slot rotation~~ | ~~🔴~~ | ~~`Carousel.tsx`~~ | **Fixed** — `useMemo` |
| ~~`onReaction` not stabilized~~ | ~~🟠~~ | ~~`bridge.ts`~~ | **Fixed** — ref pattern |
| `subscribe.useFull` causes over-rendering | 🟠 | `Carousel.tsx` | Remaining (H4) |

### State vs Ref Usage (updated)

- ~~`slotsRef` should be state or derived~~ — **Fixed.** Slots are `useMemo`.
- `isActive` and `activePointerId` in `bridge.ts` — correctly refs (event handler state).

### Unnecessary Renders (updated)

- `subscribe.useFull` in `Carousel.tsx` re-renders on every field change (H4)
- `subscribe.usePartial` without shallow equality re-renders on object selectors (H8)
- Scene components not memoized (M4)

### Effects That May Cause Bugs (remaining)

1. **`setCount` effect** — when `interactive` changes from true to false, count is not reset. Likely intentional but worth documenting.
2. **`useCarouselSizing` ResizeObserver** — depends on `[axis, id]`. If these change, observer briefly torn down. Acceptable for static props.

### Component Structure

- `Carousel.tsx` is ~120 lines with mixed concerns. Could benefit from further hook extraction.
- `MirrorWrapper.tsx` is broken (C6) and duplicates logic that no longer matches `Carousel.tsx`.

---

## 8. Suggested Improvements

### Remaining Architectural Work

1. **Migrate `MirrorWrapper.tsx` to Zustand patterns** — currently broken (C6). Align with `Carousel.tsx`: `subscribe.useFull`, `useMemo` slots, sorted `renderSlots`.

2. **Add `shallow` equality to `subscribe.usePartial`** — enables efficient object selectors without re-renders (H8).

3. **Split Carousel subscriptions** — use `usePartial` for motion (offset/dragging/settling) vs scene (index/count/size) to reduce re-renders during drag (H4).

### Simplifications

1. **Remove redundant `ensure()` calls from mutation hot paths** — trust mount-time initialization (M9).

2. **Delete `useCarouselScenes.ts`** — unused hook, only `SceneRole` type is imported (L6).

3. **Clean up commented-out code** in `sliderState.ts`, `dragState.ts`, `dragSolver.ts`, `Root.tsx` (L1).

### Patterns to Adopt

1. **`React.memo`** on all scene/content components (M4).
2. **Discriminated union for Descriptor** — use `type` field for automatic narrowing.
3. **Remove `[key: string]: unknown` from `GestureUpdate`** (L7).
4. **Rename Root's `scene-root` class** to avoid collision with scene components (M8).

---

## 9. Actionable Checklist

### 🔴 Must Fix (Blocks reliable operation)

- [ ] **C6** — Migrate `MirrorWrapper.tsx` from dead `useCarouselState` API to Zustand patterns

### 🟠 Should Fix (Performance / latent bugs)

- [ ] **H1** — Add functional support for `axis: 'both'` in solver pipeline (currently throws)
- [ ] **H4** — Split `Carousel.tsx` subscriptions using `subscribe.usePartial` for motion vs scene state
- [ ] **H8** — Add `shallow` equality comparator to `subscribe.usePartial` for object selectors

### 🟡 Should Address (Code quality / edge cases)

- [ ] **M3** — Migrate ambient global types to explicit imports
- [ ] **M4** — Wrap scene components in `React.memo`
- [ ] **M6** — Latch gate decision once per gesture (currently re-evaluates per frame with hysteresis)
- [ ] **M8** — Rename Root's container class to avoid `scene-root` collision
- [ ] **M9** — Remove redundant `ensure()` calls from hot-path mutation functions

### 🟢 Nice to Have (Cleanup)

- [ ] **L1** — Remove remaining dead/commented-out code (`Root.tsx`, `dragSolver.ts`, `sliderState.ts`, `dragState.ts`)
- [ ] **L5** — Rename `isStateFn2Arg` to `isMutationFn` (reflects actual behavior)
- [ ] **L6** — Delete unused `useCarouselScenes.ts` (move `SceneRole` type elsewhere)
- [ ] **L7** — Remove `[key: string]: unknown` index signature from `GestureUpdate`

---

*End of audit. Updated March 25, 2026.*
