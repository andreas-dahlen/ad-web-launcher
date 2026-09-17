import { beforeEach, describe, expect, it, vi } from 'vitest'

import { processCssRoot } from '../../../src/compiler/processing/processCssRoot.ts'

const loadCssRootMock = vi.hoisted(() => vi.fn())
const createIssueCollectorMock = vi.hoisted(() => vi.fn())

vi.mock('../../../src/compiler/loaders/loadCssRoot.ts', () => ({
  loadCssRoot: loadCssRootMock,
}))

vi.mock('../../../src/compiler/tracking/issueCollector.ts', () => ({
  createIssueCollector: createIssueCollectorMock,
}))

describe('[COMPILER > PROCESSING]', () => {
  const collector = {
    setSubject: vi.fn(),
    scope: vi.fn(),
    set: vi.fn(),
    flush: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    createIssueCollectorMock.mockReturnValue(collector)
  })

  it('returns the loaded root without issues', () => {
    const root = { type: 'root' }

    loadCssRootMock.mockReturnValue(root)

    const result = processCssRoot(
      '/project/styles.module.css',
      '.button {}',
    )

    expect(loadCssRootMock).toHaveBeenCalledWith(
      '/project/styles.module.css',
      '.button {}',
    )
    expect(result).toEqual({
      root,
      issues: [],
    })
  })

  it('returns a scoped issue when loading throws an Error', () => {
    const error = new Error('Invalid CSS')
    const issues = ['issue']

    loadCssRootMock.mockImplementation(() => {
      throw error
    })
    collector.flush.mockReturnValue(issues)

    const result = processCssRoot('/project/styles.module.css')

    expect(collector.setSubject).toHaveBeenCalledWith('Css Root')
    expect(collector.scope).toHaveBeenCalledWith({
      value: '/project/styles.module.css',
      path: '/project/styles.module.css',
      context: 'file',
    })
    expect(collector.set).toHaveBeenCalledWith({
      reason: 'Invalid CSS',
    })
    expect(collector.flush).toHaveBeenCalled()

    expect(result).toEqual({
      root: undefined,
      issues,
    })
  })

  it('converts non-Error thrown values to a string issue', () => {
    loadCssRootMock.mockImplementation(() => {
      throw 'invalid css'
    })
    collector.flush.mockReturnValue(['issue'])

    const result = processCssRoot('/project/styles.module.css')

    expect(collector.set).toHaveBeenCalledWith({
      reason: 'invalid css',
    })

    expect(result).toEqual({
      root: undefined,
      issues: ['issue'],
    })
  })
})