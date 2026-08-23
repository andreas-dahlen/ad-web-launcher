import { describe, expect, it } from 'vitest';
import { createCompilerRun } from '@styleTokens/compiler/tracking/compilerRun';
describe('[COMPILER]', () => {
    describe('createCompilerRun', () => {
        it('starts with no processed paths', () => {
            const run = createCompilerRun();
            expect(run.getProcessedPaths()).toEqual([]);
        });
        it('starts with no emit result', () => {
            const run = createCompilerRun();
            expect(run.getEmitResult()).toBeUndefined();
        });
        it('starts with no issues', () => {
            const run = createCompilerRun();
            expect(run.getIssues()).toEqual([]);
        });
        it('records a processed path', () => {
            const run = createCompilerRun();
            run.recordProcessed('button.module.css');
            expect(run.getProcessedPaths()).toEqual([
                'button.module.css',
            ]);
        });
        it('does not duplicate a processed path', () => {
            const run = createCompilerRun();
            run.recordProcessed('button.module.css');
            run.recordProcessed('button.module.css');
            expect(run.getProcessedPaths()).toEqual([
                'button.module.css',
            ]);
        });
        it('preserves processed path insertion order', () => {
            const run = createCompilerRun();
            run.recordProcessed('button.module.css');
            run.recordProcessed('surface.module.css');
            run.recordProcessed('layout.module.css');
            expect(run.getProcessedPaths()).toEqual([
                'button.module.css',
                'surface.module.css',
                'layout.module.css',
            ]);
        });
        it('records an emit result', () => {
            const run = createCompilerRun();
            const result = {};
            run.recordEmitResult(result);
            expect(run.getEmitResult()).toBe(result);
        });
        it('replaces the previous emit result', () => {
            const run = createCompilerRun();
            const first = {};
            const second = {};
            run.recordEmitResult(first);
            run.recordEmitResult(second);
            expect(run.getEmitResult()).toBe(second);
        });
        it('records issues', () => {
            const run = createCompilerRun();
            const issues = [
                {},
                {},
            ];
            run.recordIssues(issues);
            expect(run.getIssues()).toEqual(issues);
        });
        it('appends issues from multiple calls', () => {
            const run = createCompilerRun();
            const first = [{}];
            const second = [{}];
            run.recordIssues(first);
            run.recordIssues(second);
            expect(run.getIssues()).toEqual([
                ...first,
                ...second,
            ]);
        });
        it('returns a snapshot of processed paths', () => {
            const run = createCompilerRun();
            run.recordProcessed('button.module.css');
            const paths = run.getProcessedPaths();
            paths.length = 0;
            expect(run.getProcessedPaths()).toEqual([
                'button.module.css',
            ]);
        });
        it('returns a snapshot of issues', () => {
            const run = createCompilerRun();
            const issue = {};
            run.recordIssues([issue]);
            const issues = run.getIssues();
            issues.length = 0;
            expect(run.getIssues()).toEqual([issue]);
        });
        it('resets the entire run', () => {
            const run = createCompilerRun();
            run.recordProcessed('button.module.css');
            run.recordProcessed('surface.module.css');
            run.recordEmitResult({});
            run.recordIssues([{}]);
            run.reset();
            expect(run.getProcessedPaths()).toEqual([]);
            expect(run.getEmitResult()).toBeUndefined();
            expect(run.getIssues()).toEqual([]);
        });
        it('can be reused after reset', () => {
            const run = createCompilerRun();
            run.recordProcessed('button.module.css');
            run.recordEmitResult({});
            run.recordIssues([{}]);
            run.reset();
            const result = {};
            const issue = {};
            run.recordProcessed('surface.module.css');
            run.recordEmitResult(result);
            run.recordIssues([issue]);
            expect(run.getProcessedPaths()).toEqual([
                'surface.module.css',
            ]);
            expect(run.getEmitResult()).toBe(result);
            expect(run.getIssues()).toEqual([issue]);
        });
    });
});
