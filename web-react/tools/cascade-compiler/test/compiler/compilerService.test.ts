import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initializeCompiler } from '../../src/compiler/compilerService.ts'
import type { CompilerConfig } from '../../src/types/run.types.ts'

const findTokenPathsMock = vi.hoisted(() => vi.fn())
const compileTokenGroupsMock = vi.hoisted(() => vi.fn())
const createTokenCacheMock = vi.hoisted(() => vi.fn())
const createCompilerRunMock = vi.hoisted(() => vi.fn())
const applyTokenChangeMock = vi.hoisted(() => vi.fn())
const processPostMock = vi.hoisted(() => vi.fn())
const processModuleMock = vi.hoisted(() => vi.fn())
const emitFilesMock = vi.hoisted(() => vi.fn())
const runDiagnosticsMock = vi.hoisted(() => vi.fn())
const processCssRootMock = vi.hoisted(() => vi.fn())

vi.mock('../../src/compiler/discovery/findTokenPaths.ts', () => ({
  findTokenPaths: findTokenPathsMock,
}))

vi.mock('../../src/compiler/pipeline/compileTokenGroups.ts', () => ({
  compileTokenGroups: compileTokenGroupsMock,
}))

vi.mock('../../src/compiler/tracking/tokenCache.ts', () => ({
  createTokenCache: createTokenCacheMock,
}))

vi.mock('../../src/compiler/tracking/compilerRun.ts', () => ({
  createCompilerRun: createCompilerRunMock,
}))

vi.mock('../../src/compiler/pipeline/applyTokenChange.ts', () => ({
  applyTokenChange: applyTokenChangeMock,
}))

vi.mock('../../src/postCss/processPost.ts', () => ({
  processPost: processPostMock,
}))

vi.mock('../../src/postCss/processModule.ts', () => ({
  processModule: processModuleMock,
}))

vi.mock('../../src/emitters/emitFiles.ts', () => ({
  emitFiles: emitFilesMock,
}))

vi.mock('../../src/diagnostics/runDiagnostics.ts', () => ({
  runDiagnostics: runDiagnosticsMock,
}))

vi.mock('../../src/compiler/processing/processCssRoot.ts', () => ({
  processCssRoot: processCssRootMock,
}))

describe('[COMPILER > COMPILER SERVICE]', () => {
  const config: CompilerConfig = {
    projectRoot: '/project',
    tokenPath: '/project/tokens',
    logging: {
      trace: false,
      emissions: 'summary',
    },
    outputs: { extension: false, lsp: false, meta: false, pathPatches: false, presets: false, tokens: false, schema: false, package: false },
    internal: {
      initialProcessing: false,
      willEmitCss: true,
      generatedPath: '/project/generated',
    },

    presetIgnore: []
  }

  const cache = {
    getCssPaths: vi.fn(),
    getGroupByCssPath: vi.fn(),
    addPostData: vi.fn(),
    addCssData: vi.fn(),
    isCssProcessingComplete: vi.fn(),
  }

  const run = {
    recordIssues: vi.fn(),
    recordProcessed: vi.fn(),
    recordEmitResult: vi.fn(),
    reset: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    findTokenPathsMock.mockReturnValue({ tokenPaths: ['tokens.json'], issues: [] })
    compileTokenGroupsMock.mockReturnValue({
      groups: ['group'],
      issues: [],
    })
    createTokenCacheMock.mockReturnValue(cache)
    createCompilerRunMock.mockReturnValue(run)

    processCssRootMock.mockReturnValue({
      root: {
        toString: () => 'processed css',
      },
      issues: [],
    })

    processPostMock.mockReturnValue({
      postData: 'post data',
      issues: [],
    })

    processModuleMock.mockReturnValue({
      cssData: 'css data',
      issues: [],
    })

    cache.getGroupByCssPath.mockReturnValue({
      cssPath: '/project/styles.module.css',
    })

    cache.isCssProcessingComplete.mockReturnValue(true)
    emitFilesMock.mockReturnValue('emit result')
  })

  it('initializes the compiler from discovered token groups', () => {
    const compiler = initializeCompiler({ config, issues: [] })

    expect(findTokenPathsMock).toHaveBeenCalledWith(config.tokenPath)
    expect(compileTokenGroupsMock).toHaveBeenCalledWith(
      config.projectRoot,
      ['tokens.json'],
    )
    expect(createTokenCacheMock).toHaveBeenCalledWith(
      ['group'],
      config,
    )
    expect(createCompilerRunMock).toHaveBeenCalledWith([])
    expect(compiler).toEqual({
      handleCssChange: expect.any(Function),
      handleTokenChange: expect.any(Function),
      finalize: expect.any(Function),
    })
  })

  it('processes existing CSS during initial processing', () => {
    cache.getCssPaths.mockReturnValue([
      '/project/a.module.css',
      '/project/b.module.css',
    ])

    initializeCompiler({
      config: {
        ...config,
        internal: {
          ...config.internal,
          initialProcessing: true,
        }
      }, issues: []
    })

    expect(processCssRootMock).toHaveBeenCalledTimes(2)
    expect(processCssRootMock).toHaveBeenNthCalledWith(
      1,
      '/project/a.module.css',
      undefined,
    )
    expect(processCssRootMock).toHaveBeenNthCalledWith(
      2,
      '/project/b.module.css',
      undefined,
    )
    expect(emitFilesMock).toHaveBeenCalled()
    expect(runDiagnosticsMock).toHaveBeenCalled()
    expect(run.reset).toHaveBeenCalled()
  })

  it('handles a token change by processing its associated CSS', () => {
    applyTokenChangeMock.mockReturnValue({
      group: {
        cssPath: '/project/styles.module.css',
      },
      issues: ['token issue'],
    })

    const compiler = initializeCompiler({ config, issues: [] })

    const result = compiler.handleTokenChange('/project/token.json')

    expect(applyTokenChangeMock).toHaveBeenCalledWith({
      tokenPath: '/project/token.json',
      cache,
    })
    expect(run.recordIssues).toHaveBeenCalledWith(['token issue'])
    expect(processCssRootMock).toHaveBeenCalledWith(
      '/project/styles.module.css',
      undefined,
    )
    expect(result).toBe('/project/styles.module.css')
  })

  it('returns null when a token change has no associated CSS', () => {
    applyTokenChangeMock.mockReturnValue({
      group: {},
      issues: [],
    })

    const compiler = initializeCompiler({ config, issues: [] })

    const result = compiler.handleTokenChange('/project/token.json')

    expect(run.recordIssues).toHaveBeenCalledWith([])
    expect(processCssRootMock).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('returns null when CSS processing fails', () => {
    processCssRootMock.mockReturnValue({
      root: null,
      issues: ['CSS issue'],
    })

    const compiler = initializeCompiler({ config, issues: [] })

    const result = compiler.handleCssChange('/project/styles.module.css')

    expect(run.recordIssues).toHaveBeenCalledWith(['CSS issue'])
    expect(processPostMock).not.toHaveBeenCalled()
    expect(result).toBeNull()
  })

  it('returns unchanged CSS when no token group matches', () => {
    const root = {
      toString: () => 'original css',
    }

    processCssRootMock.mockReturnValue({
      root,
      issues: [],
    })

    cache.getGroupByCssPath.mockReturnValue(undefined)

    const compiler = initializeCompiler({ config, issues: [] })

    const result = compiler.handleCssChange('/project/styles.module.css')

    expect(cache.addPostData).toHaveBeenCalledWith('post data')
    expect(processModuleMock).not.toHaveBeenCalled()
    expect(result).toBe('original css')
  })

  it('processes CSS and records it when a matching group exists', () => {
    processPostMock.mockReturnValue({
      postData: 'post data',
      issues: ['post issue'],
    })

    processModuleMock.mockReturnValue({
      cssData: 'css data',
      issues: ['module issue'],
    })

    const compiler = initializeCompiler({ config, issues: [] })

    const result = compiler.handleCssChange(
      '/project/styles.module.css',
      'source css',
    )

    expect(processCssRootMock).toHaveBeenCalledWith(
      '/project/styles.module.css',
      'source css',
    )

    expect(processPostMock).toHaveBeenCalledWith({
      root: expect.any(Object),
      cssPath: '/project/styles.module.css',
      trace: false,
      mutate: true,
    })

    expect(run.recordIssues).toHaveBeenCalledWith(['post issue'])
    expect(cache.addPostData).toHaveBeenCalledWith('post data')

    expect(processModuleMock).toHaveBeenCalledWith({
      root: expect.any(Object),
      group: {
        cssPath: '/project/styles.module.css',
      },
      trace: false,
      mutate: true,
    })

    expect(run.recordIssues).toHaveBeenCalledWith(['module issue'])

    expect(cache.addCssData).toHaveBeenCalledWith('css data')

    expect(run.recordProcessed).toHaveBeenCalledWith(
      '/project/styles.module.css',
    )

    expect(result).toBe('processed css')
  })

  it('does not finalize while CSS processing is incomplete', () => {
    cache.isCssProcessingComplete.mockReturnValue(false)

    const compiler = initializeCompiler({ config, issues: [] })

    compiler.finalize()

    expect(emitFilesMock).not.toHaveBeenCalled()
    expect(runDiagnosticsMock).not.toHaveBeenCalled()
    expect(run.reset).not.toHaveBeenCalled()
  })

  it('emits files, runs diagnostics, and resets the run when processing is complete', () => {
    const compiler = initializeCompiler({ config, issues: [] })

    compiler.finalize()

    expect(emitFilesMock).toHaveBeenCalledWith(cache, run)
    expect(run.recordEmitResult).toHaveBeenCalledWith('emit result')
    expect(runDiagnosticsMock).toHaveBeenCalledWith(cache, run)
    expect(run.reset).toHaveBeenCalled()
  })
})