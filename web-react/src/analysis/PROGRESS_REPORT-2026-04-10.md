# Progress Report

## Trajectory
The system improved rapidly between the first and second reports (5.5 → 7), addressing the most critical architectural issues: store hooks moved init into `useEffect`, `useShallow` was adopted, stores gained cleanup on unmount, the monolithic `intentUtils` and `solverUtils` files were split into focused modules, the `zunstand/` directory was renamed, assertion type guards were eliminated, `CtxPartial` was split into per-primitive partials, callback props were properly typed, and significant commented-out code was removed. The third report (04-09) showed continued incremental improvement — `toAxis`/`toType` validators replaced unsafe casts, store `.get()` return types were corrected, naming improvements landed (`prim/sub` → `main/cross`, `utils` → `gestureUtils`, `Context` → `DomContext`), and `Normalized1D` double-optionality was fixed. Since then, the system has plateaued at 7/10. The fourth report (04-10) shows identical scores in 8 of 10 categories. The remaining issues are either naming/convention matters the developer has consciously deprioritised, or structural patterns that require higher-effort redesign.

## Score History
| Date       | Score | Delta |
|------------|-------|-------|
| 2026-04-05 | 5.5   | —     |
| 2026-04-07 | 7     | +1.5  |
| 2026-04-09 | 7     | 0     |
| 2026-04-10 | 7     | 0     |

## Category Trends

| Category                      | 04-05 | 04-07 | 04-09 | 04-10 | Trend     |
|-------------------------------|-------|-------|-------|-------|-----------|
| 1. Type Safety                | 5     | 6     | 7     | 7     | ▲ → flat  |
| 2. State Management           | 6     | 7     | 8     | 8     | ▲ → flat  |
| 3. Separation of Concerns     | 6     | 7     | 7     | 7     | ▲ → flat  |
| 4. Naming & Discoverability   | 5     | 6     | 6     | 6     | ▲ → stuck |
| 5. Consistency Across Prims   | 6     | 7     | 7     | 7     | ▲ → flat  |
| 6. Error Handling & Edge Cases| 4     | 6     | 6     | 6     | ▲ → stuck |
| 7. Performance                | 7     | 7     | 7     | 7     | flat      |
| 8. Testability                | 7     | 7     | 7     | 7     | flat*     |
| 9. Dead or Redundant Code     | 5     | 6     | 7     | 6     | ▲ → ▼    |
| 10. Scalability               | 5     | 7     | 6     | 7     | oscillating |

*Testability jumped from 6 to 7 between 04-05 and 04-07 (gestureTypeGuards removed, stores became testable via `getState()`), then held.

## What's Actually Improving

**04-05 → 04-07 (the big jump):**
- Store init moved from render-time to `useEffect` in all `use[X]Store` hooks — eliminated the side-effect-during-render violation.
- `useShallow` adopted in store hooks — prevented re-renders from unrelated binding changes.
- Store cleanup via `delete(id)` on unmount — fixed the indefinite persistence leak.
- `intentUtils.ts` split into `gestureUtils.ts` + `buildContext.ts` — resolved the responsibility grab-bag.
- `solverUtils.ts` split into per-primitive files (`carouselUtils.ts`, `dragUtils.ts`, `sliderUtils.ts`) — eliminated the shared-file bottleneck.
- `zunstand/` renamed to `stores/` — fixed the discoverability issue.
- Assertion type guards (`gestureTypeGuards.ts`) removed entirely — eliminated the production-mode silent degradation.
- `CtxPartial` split into `CarouselCtxPartial`, `SliderCtxPartial`, `DragCtxPartial` — added per-primitive type safety.
- `DragCtxPartial` fixed to include `delta` field — resolved the type drift.
- Store name shadowing resolved — `carouselStore.getState().carouselStore[id]` became `carouselStore.getState().bindings[id]`.
- `Slider.offset` dead state removed from `sliderStore.ts`.
- `useCarouselScenes.ts` dead hook removed.
- `pointercancel` handled via `pipeline.abortGesture` in `pointerBridge.ts`.
- Gesture overflow changed from full wipe to targeted eviction in `interpreter.ts`.
- Callback props typed as `CtxType` instead of `unknown`.
- `Builder` interface unexported from `buildDesc.ts`.
- Significant commented-out code cleaned across `carouselStore.ts`, `ctxType.ts`, `primitiveType.ts`, `pipeline.ts`.

**04-07 → 04-09:**
- `toAxis()` / `toType()` validators added in `primitiveType.ts` — replaced the raw `ds.axis as Axis` / `ds.type as InteractionType` casts in `buildContext.ts`.
- Store `.get()` return types corrected — `carouselStore.get()` and `sliderStore.get()` now declare `| null`.
- `Context` renamed to `DomContext` in `baseType.ts` — partially disambiguated the "context" overload.
- `utils` export renamed to `gestureUtils` — removed the ambiguous import name.
- `prim`/`sub` renamed to `main`/`cross` in `vectorUtils.ts` — improved readability.
- `Normalized1D` simplified — removed `null` union from fields, leaving only `?` optionality.
- `SliderData.constraints` fields made `readonly` — aligned with `DragData.constraints`.
- `Slider.dragging` made required (`boolean` not `boolean?`) — removed need for `?? false` fallback.
- Dead `typeof delta !== "object"` guard removed from `vectorUtils.ts`.
- `sliderStore.setThumbSize()` equality guard added.
- Stale comments partially cleaned (`//carousel only`, `//future me`).

**04-09 → 04-10:**
- No measurable code changes detected between these reports. The 04-10 report is a fresh analysis by a different reviewer confirming the 04-09 scores.

## What's Stuck

**Naming & Discoverability (6/10 since 04-07):** Three reports in a row have flagged the same issues — "context" naming overload (`CtxType` vs `DomContext` vs `buildContext`), `Reactions` interface name not conveying "capabilities", `delta1D` carrying different semantics per primitive, `GestureUpdate` being slider-specific with a generic name, and `onVolumeChange` leaking domain into the generic slider API. The developer has consciously SKIPPED the `delta1D` rename (disagreeing with the recommendation) and the `onVolumeChange` rename is blocked on a design decision about custom reaction callbacks. The remaining items (`Reactions` rename, `GestureUpdate` relocation, "context" disambiguation) have no developer verdict — they're simply not being worked on. This category cannot move past 6 without addressing at least the "context" overload.

**Error Handling & Edge Cases (6/10 since 04-07):** The `onTransitionEnd` `"scene-default"` class guard in `useCarouselMotion` has been flagged in two consecutive reports as either dead code or a bug. No action taken. `NaN` propagation from `buildContext` numeric conversions has been flagged since 04-09. Division-by-zero risk in `sliderUtils.resolveStart` has been flagged since 04-10. Stale `dragging` state on unmount has been flagged since 04-05 (when it was a more severe "no cleanup" issue). The pattern is: edge cases are identified, but none are being fixed because they haven't caused user-visible bugs yet. This category is stuck at 6 because the remaining issues are all latent — they only manifest under race conditions or malformed input.

**Performance (7/10 since 04-05):** This category has never moved. The findings are architectural: immer on every swipe frame, per-component ResizeObservers, no event coalescing, `Object.keys(gestures).length` allocation. The developer has not addressed any of these because they don't cause observable performance problems at the current scale. This is a rational prioritisation — the 7/10 reflects the gap between "works fine now" and "optimised for scale."

## What's Getting Worse

**Dead or Redundant Code (7 → 6, 04-09 → 04-10):** The 04-10 report identified findings not present in 04-09: `Reactions.modifiable` as a fully dead computed field, `buildReactions` checking `ds.swipe` and `ds.modifiable` for attributes no component sets, and `BASE_STYLE` with `willChange` as an inconsistency across motion hooks. The 04-09 report had scored this 7 after significant cleanup work (removing `Slider.offset`, `useCarouselScenes`, commented-out code, dead type guards). The regression in score suggests that the cleanup pass addressed the most visible dead code but missed subtler structural dead paths. Additionally, the `onTransitionEnd` class guard issue — which was present in 04-09 but categorised under Error Handling — is now also flagged under Dead Code, reflecting its dual nature.

**Scalability (oscillating: 5 → 7 → 6 → 7):** This category is unstable across reviewers. The 04-05 report scored it 5 (focused on the ~12-file change surface and `solverUtils` bottleneck). After splitting `solverUtils`, 04-07 scored it 7. The 04-09 report scored it 6, newly emphasising the module-level singleton in `interpreter.ts` and the lack of dynamic registration. The 04-10 report scored it back at 7, noting the `EVENT_MAP` with `satisfies` as a positive. The underlying facts haven't changed between 04-09 and 04-10 — the score difference reflects reviewer emphasis rather than code change.

## Verdict

The 7/10 ceiling is primarily unfinished work, not a measurement problem or complexity ceiling. The architecture is sound — the pipeline, solver, and store patterns are clean and repeatable. The jump from 5.5 to 7 proved the system responds well to targeted fixes: splitting files, adding `useShallow`, typing return values, removing dead code. The stall at 7 reflects a rational triage: the remaining issues are either naming conventions the developer disagrees with (and has SKIPPED with documented reasoning), edge cases that haven't caused real bugs, or performance optimisations not yet justified by scale. To break past 7, the developer would need to address three specific items: fix the `onTransitionEnd` `"scene-default"` guard (which is either a bug or dead code — either way it needs resolution), add `NaN`/zero guards to `buildContext` and `sliderUtils`, and tackle at least the "context" naming disambiguation. These are all medium-effort changes with concrete scope. The system isn't hitting a complexity ceiling — it's hitting a prioritisation ceiling, where the remaining work competes with feature development and the current 7/10 is "good enough" for a working product.
