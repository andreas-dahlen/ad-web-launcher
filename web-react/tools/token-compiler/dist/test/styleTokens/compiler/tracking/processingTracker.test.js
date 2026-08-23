import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProcessingTracker } from '@styleTokens/compiler/tracking/processingTracker';
afterEach(() => {
    vi.useRealTimers();
});
describe('[COMPILER]', () => {
    describe('createProcessingTracker', () => {
        it('starts with all expected paths unresolved', () => {
            const tracker = createProcessingTracker([
                'button.module.css',
                'surface.module.css',
            ]);
            const state = tracker.__TEST_ONLY_API();
            expect(state.expectedPaths).toEqual(new Set([
                'button.module.css',
                'surface.module.css',
            ]));
            expect(state.resolvedPaths).toEqual(new Set());
        });
        it('starts with no resolved paths', () => {
            const tracker = createProcessingTracker([
                'button.module.css',
            ]);
            expect(tracker.__TEST_ONLY_API().resolvedPaths).toEqual(new Set());
        });
        it('marks a path as resolved', () => {
            const tracker = createProcessingTracker([
                'button.module.css',
            ]);
            tracker.markResolved('button.module.css');
            expect(tracker.__TEST_ONLY_API().resolvedPaths).toEqual(new Set(['button.module.css']));
        });
        it('marks multiple paths as resolved', () => {
            const tracker = createProcessingTracker([
                'button.module.css',
                'surface.module.css',
            ]);
            tracker.markResolved('button.module.css');
            tracker.markResolved('surface.module.css');
            expect(tracker.__TEST_ONLY_API().resolvedPaths).toEqual(new Set([
                'button.module.css',
                'surface.module.css',
            ]));
        });
        it('allows resolving an unexpected path', () => {
            const tracker = createProcessingTracker([
                'button.module.css',
            ]);
            tracker.markResolved('surface.module.css');
            expect(tracker.__TEST_ONLY_API().resolvedPaths).toEqual(new Set(['surface.module.css']));
        });
        it('invalidates a resolved path', () => {
            const tracker = createProcessingTracker([
                'button.module.css',
            ]);
            tracker.markResolved('button.module.css');
            tracker.invalidate('button.module.css');
            const state = tracker.__TEST_ONLY_API();
            expect(state.expectedPaths).toEqual(new Set(['button.module.css']));
            expect(state.resolvedPaths).toEqual(new Set());
        });
        it('adds an unknown path when invalidated', () => {
            const tracker = createProcessingTracker([]);
            tracker.invalidate('button.module.css');
            const state = tracker.__TEST_ONLY_API();
            expect(state.expectedPaths).toEqual(new Set(['button.module.css']));
            expect(state.resolvedPaths).toEqual(new Set());
        });
        it('does not expose mutable internal sets', () => {
            const tracker = createProcessingTracker([
                'button.module.css',
            ]);
            tracker.markResolved('button.module.css');
            const state = tracker.__TEST_ONLY_API();
            state.expectedPaths.clear();
            state.resolvedPaths.clear();
            const nextState = tracker.__TEST_ONLY_API();
            expect(nextState.expectedPaths).toEqual(new Set(['button.module.css']));
            expect(nextState.resolvedPaths).toEqual(new Set(['button.module.css']));
        });
        describe('PostCSS completion', () => {
            it('resolves when there are no expected paths', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([]);
                const completion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(500);
                await expect(completion).resolves.toBeUndefined();
            });
            it('resolves when all expected paths are already resolved', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                ]);
                tracker.markResolved('button.module.css');
                const completion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(500);
                await expect(completion).resolves.toBeUndefined();
            });
            it('resolves when all expected paths become resolved', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                    'surface.module.css',
                ]);
                const completion = tracker.awaitPostCssCompletion();
                tracker.markResolved('button.module.css');
                tracker.markResolved('surface.module.css');
                vi.advanceTimersByTime(500);
                await expect(completion).resolves.toBeUndefined();
            });
            it('rejects when expected paths remain unresolved', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                    'surface.module.css',
                ]);
                const completion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(500);
                await expect(completion).rejects.toThrow('Style token compilation stalled');
            });
            it('reports all unresolved CSS modules when processing stalls', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                    'surface.module.css',
                    'layout.module.css',
                ]);
                const completion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(500);
                await expect(completion).rejects.toThrow([
                    '❌ Style token compilation stalled',
                    '',
                    'Unresolved CSS modules:',
                    '  • button.module.css',
                    '  • surface.module.css',
                    '  • layout.module.css',
                ].join('\n'));
            });
            it('resolves when some paths are resolved and the rest are invalidated before completion', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                    'surface.module.css',
                ]);
                const completion = tracker.awaitPostCssCompletion();
                tracker.markResolved('button.module.css');
                tracker.invalidate('surface.module.css');
                tracker.markResolved('surface.module.css');
                vi.advanceTimersByTime(500);
                await expect(completion).resolves.toBeUndefined();
            });
            it('resets the flush timer when a path is resolved', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                    'surface.module.css',
                ]);
                const completion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(400);
                tracker.markResolved('button.module.css');
                vi.advanceTimersByTime(499);
                expect(tracker.__TEST_ONLY_API().resolvedPaths).toEqual(new Set(['button.module.css']));
                vi.advanceTimersByTime(1);
                await expect(completion).rejects.toThrow('Style token compilation stalled');
            });
            it('resets the flush timer when a path is invalidated', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                ]);
                tracker.markResolved('button.module.css');
                const completion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(400);
                tracker.invalidate('button.module.css');
                vi.advanceTimersByTime(499);
                expect(tracker.__TEST_ONLY_API().resolvedPaths).toEqual(new Set());
                const rejection = expect(completion).rejects.toThrow('Style token compilation stalled');
                vi.advanceTimersByTime(1);
                await rejection;
            });
            it('resets the flush timer when PostCSS activity occurs', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                ]);
                const completion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(400);
                tracker.notifyPostCssActivity();
                vi.advanceTimersByTime(499);
                const rejection = expect(completion).rejects.toThrow('Style token compilation stalled');
                vi.advanceTimersByTime(1);
                await rejection;
            });
            it('resolves after a path is invalidated and resolved again', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                ]);
                tracker.markResolved('button.module.css');
                const completion = tracker.awaitPostCssCompletion();
                tracker.invalidate('button.module.css');
                tracker.markResolved('button.module.css');
                vi.advanceTimersByTime(500);
                await expect(completion).resolves.toBeUndefined();
            });
            it('does not resolve before the flush delay', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                ]);
                tracker.markResolved('button.module.css');
                const completion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(499);
                expect(tracker.__TEST_ONLY_API().resolvedPaths).toEqual(new Set(['button.module.css']));
                vi.advanceTimersByTime(1);
                await expect(completion).resolves.toBeUndefined();
            });
            it('only settles the current completion once', async () => {
                vi.useFakeTimers();
                const tracker = createProcessingTracker([
                    'button.module.css',
                ]);
                const completion = tracker.awaitPostCssCompletion();
                tracker.markResolved('button.module.css');
                vi.advanceTimersByTime(500);
                await expect(completion).resolves.toBeUndefined();
                const secondCompletion = tracker.awaitPostCssCompletion();
                vi.advanceTimersByTime(500);
                await expect(secondCompletion).resolves.toBeUndefined();
            });
        });
    });
});
