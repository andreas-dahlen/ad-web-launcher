import { describe, expect, it } from 'vitest'
import { createCompilerRun } from '@styleTokens/compiler/tracking/compilerRun'
import type { IssueGroup } from '@styleTokens/types/issueCollector.types.ts'
import type { CssData, EmitResult } from '@styleTokens/types/compiler.types'

describe('[COMPILER]', () => {
  describe('createCompilerRun', () => {
    it('starts with all configured group paths as missing modules', () => {
      const run = createCompilerRun([
        'button',
        'surface',
        'layout',
      ])

      expect(run.getMissingModules()).toEqual([
        'button',
        'surface',
        'layout',
      ])
    })

    it('starts with no unused modules', () => {
      const run = createCompilerRun(['button'])

      expect(run.getUnusedModules()).toEqual([])
    })

    it('starts with no processed CSS data', () => {
      const run = createCompilerRun(['button'])

      expect(run.getGroups()).toEqual([])
    })

    it('starts with no emit result', () => {
      const run = createCompilerRun(['button'])

      expect(run.getEmitResult()).toBeUndefined()
    })

    it('starts with no issues', () => {
      const run = createCompilerRun(['button'])

      expect(run.getIssues()).toEqual([])
    })

    it('records a missing module', () => {
      const run = createCompilerRun([])

      run.recordMissingModule('button')

      expect(run.getMissingModules()).toEqual(['button'])
    })

    it('does not duplicate a missing module', () => {
      const run = createCompilerRun([])

      run.recordMissingModule('button')
      run.recordMissingModule('button')

      expect(run.getMissingModules()).toEqual(['button'])
    })

    it('records an unused module', () => {
      const run = createCompilerRun([])

      run.recordUnusedModule('Button.module.css')

      expect(run.getUnusedModules()).toEqual([
        'Button.module.css',
      ])
    })

    it('does not duplicate an unused module', () => {
      const run = createCompilerRun([])

      run.recordUnusedModule('Button.module.css')
      run.recordUnusedModule('Button.module.css')

      expect(run.getUnusedModules()).toEqual([
        'Button.module.css',
      ])
    })

    it('records CSS data for a group', () => {
      const run = createCompilerRun([])

      const cssData = {} as CssData

      run.recordCssData('button', cssData)

      expect(run.getCssData('button')).toBe(cssData)
      expect(run.getProcessedGroupPaths()).toEqual(['button'])
    })

    it('replaces CSS data when the same group is recorded again', () => {
      const run = createCompilerRun([])

      const first = {} as CssData
      const second = {} as CssData

      run.recordCssData('button', first)
      run.recordCssData('button', second)

      expect(run.getCssData('button')).toBe(second)
      expect(run.getProcessedGroupPaths()).toEqual(['button'])
    })

    it('returns undefined for an unknown group', () => {
      const run = createCompilerRun([])

      expect(run.getCssData('unknown')).toBeUndefined()
    })

    it('records an emit result', () => {
      const run = createCompilerRun([])

      const result = {} as EmitResult

      run.recordEmitResult(result)

      expect(run.getEmitResult()).toBe(result)
    })

    it('replaces the previous emit result', () => {
      const run = createCompilerRun([])

      const first = {} as EmitResult
      const second = {} as EmitResult

      run.recordEmitResult(first)
      run.recordEmitResult(second)

      expect(run.getEmitResult()).toBe(second)
    })

    it('records issues', () => {
      const run = createCompilerRun([])

      const issues = [
        {} as IssueGroup,
        {} as IssueGroup,
      ]

      run.recordIssues(issues)

      expect(run.getIssues()).toEqual(issues)
    })

    it('appends issues from multiple calls', () => {
      const run = createCompilerRun([])

      const first = [{} as IssueGroup]
      const second = [{} as IssueGroup]

      run.recordIssues(first)
      run.recordIssues(second)

      expect(run.getIssues()).toEqual([
        ...first,
        ...second,
      ])
    })

    it('resets the entire run', () => {
      const run = createCompilerRun(['initial'])

      const cssData = {} as CssData
      const emitResult = {} as EmitResult
      const issues = [{} as IssueGroup]

      run.recordMissingModule('missing')
      run.recordUnusedModule('unused.css')
      run.recordCssData('button', cssData)
      run.recordEmitResult(emitResult)
      run.recordIssues(issues)

      run.reset()

      expect(run.getMissingModules()).toEqual([])
      expect(run.getUnusedModules()).toEqual([])
      expect(run.getProcessedGroupPaths()).toEqual([])
      expect(run.getCssData('button')).toBeUndefined()
      expect(run.getEmitResult()).toBeUndefined()
      expect(run.getIssues()).toEqual([])
    })
  })
})