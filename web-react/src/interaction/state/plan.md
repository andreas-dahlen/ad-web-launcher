# Plan: Fix Carousel Animation Reset on Index Commit

## TL;DR

Carousel scenes remount and animations reset when `setPosition` commits the index change because: (1) the two-phase mutation (immediate + rAF) creates a one-frame flash where offset=0 but index hasn't advanced yet, and (2) scenes are positionally rendered without React keys, so changing the scene-to-slot assignment causes unmount/remount. Fix by making `setPosition` atomic and using React keys on scene wrappers.

---

## Root Cause Analysis

### Bug 1: Two-phase `setPosition` creates a visible flash

In `carouselState.ts` → `setPosition()`:

- **Phase 1 (immediate)**: `settling=true, offset=0` — this causes the scene that animated off-screen to **jump back to center** for one frame (because `offset=0` but `index` hasn't changed yet)
- **Phase 2 (rAF)**: `index=newIndex, pendingDir=null, settling=false` — now slots recompute correctly

Between these two mutations, React renders the intermediate state → visible **flash/jump**.

### Bug 2: Positional scene rendering causes component unmount/remount

In `Carousel.tsx`, scenes are rendered at fixed JSX positions (slots[0], slots[1], slots[2]):

```
<div style={styleForRole(slots[0].role)}> <Scene0 /> </div>
<div style={styleForRole(slots[1].role)}> <Scene1 /> </div>
<div style={styleForRole(slots[2].role)}> <Scene2 /> </div>
```

When `index` changes, `slots` useMemo recomputes → scene components change at each position → React unmounts old component, mounts new one → **CSS animations in scene content reset**.

### Bug 3 (latent): rAF race condition in `swipeStart` early commit

If a user starts a new swipe while `setPosition`'s rAF is pending, `swipeStart` commits the index early (clears `pendingDir`), but the old rAF still fires with a stale `lane.pendingDir` from its closure → **double index advance**. The atomic approach eliminates this.

---

## Steps

### Phase 1: Atomic `setPosition` (eliminates flash + race condition)

1. **Rewrite `carouselStateFn.setPosition()`** in `carouselState.ts`:
   - Replace the two-mutation (immediate + rAF) pattern with a **single synchronous `store.mutate`** that sets `settling=true`, `index=newIndex`, `offset=0`, `pendingDir=null` atomically.
   - Follow with a **single `requestAnimationFrame`** that only sets `settling=false` (re-enables CSS transitions).
   - The rAF no longer touches `index` or `pendingDir`, so even if it races with a new `swipeStart`, it only flips `settling` — harmless.

   Why this works: in the atomic mutation render, `settling=true` → `transition="none"` → all transform changes are instant. The continuing scenes (old "next" → new "current") have **identical computed transforms** before and after (e.g., `1*laneSize + (-laneSize)` = `0*laneSize + 0` = 0), so no visual change occurs. The recycled off-screen scene teleports invisibly (transition="none").

2. **Simplify `swipeStart` early commit path** in `carouselState.ts`:
   - The `if (s.pendingDir !== null)` branch in `swipeStart` currently duplicates the index advance logic. After step 1, the atomic `setPosition` can't have a pending rAF that modifies `index`, so the early commit path is simpler: just advance `index`, reset `offset`, clear `pendingDir`. `settling` can stay true or be set by the dragging→true override. Verify this path still works correctly after the `setPosition` rewrite.

### Phase 2: Keyed scene slots (eliminates component remounting)

3. **Add React `key` to scene wrapper divs** in `Carousel.tsx`:
   - Change from three static `<div>` elements to a `slots.map()` with `key={slot.sceneIdx}` on each wrapper div.
   - This tells React to match DOM elements by scene index rather than position. When `index` changes and slots recompute, React **preserves mounted components** that remain in the slot set (only unmounts the one scene that leaves and mounts the new one entering).
   - Scenes that stay (e.g., old "next" → new "current") keep their DOM node and all ongoing CSS animations intact.

4. **Verify `onTransitionEnd` still fires correctly** after the keyed rearrangement:
   - Each wrapper div has `onTransitionEnd`. After the atomic commit with `settling=true`, no CSS transitions run → no `transitionEnd` events fire → correct.
   - After `settling=false` in the next frame, transforms haven't changed → no transitions start → no spurious `transitionEnd` events → correct.
   - Guard in `setPosition` (`if (!lane.pendingDir) return false`) still prevents duplicate processing when multiple transition events fire from the swipe animation.

### Phase 3 (Optional): Selective Zustand subscriptions

5. **Replace `subscribe.useFull` with `subscribe.usePartial`** in `Carousel.tsx` (*parallel with steps 1-4*):
   - Create two separate subscriptions:
     - **Motion subscription**: `subscribe.usePartial('carousel', id, d => ({offset: d.offset, dragging: d.dragging, settling: d.settling}))` — for `useCarouselMotion`
     - **Index subscription**: `subscribe.usePartial('carousel', id, d => ({index: d.index, count: d.count, size: d.size}))` — for slot computation and sizing
   - Add `shallow` equality from `zustand/shallow` as a second argument to `useStore` in `subscribe.usePartial`, so that object selectors don't trigger re-renders when values are unchanged.
   - Benefit: motion-only changes (offset during drag) don't trigger slot recomputation; index changes don't trigger motion recalculation. Reduces render work.

6. **Optional: Wrap scene components in `React.memo`**:
   - Scene components receive no props, so `React.memo` would prevent child re-renders when the parent Carousel re-renders for motion updates.
   - Low-priority; only matters if scene components are expensive to render.

---

## Relevant Files

- `web-react/src/interaction/state/carouselState.ts` — Rewrite `setPosition()` (step 1), verify `swipeStart` early commit (step 2). Key functions: `setPosition`, `swipeStart`, `getNextIndex`.
- `web-react/src/components/primitives/carousel/Carousel.tsx` — Add `key={slot.sceneIdx}` to scene divs (step 3), optionally split subscriptions (step 5). Key code: the `slots` useMemo, the three `<div className="scene-default">` elements, `subscribe.useFull` call.
- `web-react/src/components/primitives/carousel/hooks/useCarouselMotion.ts` — No changes needed, but verify `onTransitionEnd` guard logic still works (step 4). Key code: `transition` useMemo, `onTransitionEnd` useCallback.
- `web-react/src/interaction/state/zustandHook.ts` — Optionally add `shallow` equality support to `usePartial` (step 5). Key function: `subscribe.usePartial`.
- `web-react/src/interaction/state/zustandStore.ts` — No changes needed. Reference for `store.mutate` behavior (single `useStore.setState` → single React render).
- `web-react/src/config/types/storeTypes.d.ts` — Reference for `CarouselState` interface shape.

---

## Verification

1. **Swipe and observe scene animations**: Swipe the carousel and confirm scene content animations (CSS transitions, GIFs, etc.) do not restart or flash when the carousel commits to the next index.
2. **Fast consecutive swipes**: Start a new swipe before the previous commit animation finishes. Confirm the carousel advances exactly once per swipe (no double-advance from the rAF race condition).
3. **Check all 3 scenes stay mounted**: Use React DevTools to confirm that after a swipe commit, only 1 of the 3 scene components unmounts (the one leaving the viewport) and 1 new one mounts (entering). The other 2 stay mounted.
4. **Verify mirror carousels** (`InteractiveLayer.tsx`): Non-interactive carousels share the same state ID. Confirm they still animate in sync after the changes to `setPosition`.
5. **Resize during animation**: Resize the browser during a swipe animation. Confirm no crash or visual glitch from `setSize` mutations interleaving with `setPosition`.
6. **Lock at boundaries**: Test with `lockPrevAt`/`lockNextAt` props to confirm locked carousels still block correctly.

---

## Decisions

- **Atomic setPosition is a must** — the two-phase mutation is the primary cause of the flash. This is a correctness fix, not just an optimization.
- **Keyed scene slots are a must** — without keys, component remounting is unavoidable when index changes. This is required to preserve scene animations.
- **Selective subscriptions are optional** — they reduce render work but are not required for correctness. Can be done in a follow-up.
- **`settling` flag is still needed** — it prevents the recycled off-screen scene from animating through the visible area (overflow:hidden clips it spatially, but the scene passes through `transform: translate3d(0,0,0)` during transit, briefly visible).
- **Scope boundary**: MirrorWrapper.tsx uses a different slot rotation mechanism (ref-based). It may have similar issues but is out of scope for this plan. It already references an old `useCarouselState` API that appears broken.
