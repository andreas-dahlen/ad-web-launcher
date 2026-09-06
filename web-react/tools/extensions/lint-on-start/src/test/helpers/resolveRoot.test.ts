import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as vscode from 'vscode'

import { resolveRoot } from '../../helpers/resolveRoot.ts'

describe('[Lint on Start] resolveRoot', () => {
  const appendLine = vi.fn()

  const output = {
    appendLine,
  } as unknown as vscode.OutputChannel

  const get = vi.fn()

  const settings = {
    get,
  } as unknown as vscode.WorkspaceConfiguration

  beforeEach(() => {
    vi.clearAllMocks()

    get.mockReturnValue('web-react')

    vi.spyOn(vscode.Uri, 'joinPath').mockReturnValue({
      fsPath: '/workspace/web-react',
    } as vscode.Uri)

    vi.spyOn(vscode.workspace, 'workspaceFolders', 'get').mockReturnValue([
      {
        uri: {
          fsPath: '/workspace',
        } as vscode.Uri,
      } as vscode.WorkspaceFolder,
    ])
  })

  it('resolves projectRoot relative to the workspace folder', () => {
    const result = resolveRoot(settings, output)

    expect(result).toBe('/workspace/web-react')

    expect(get).toHaveBeenCalledWith('projectRoot')

    expect(vscode.Uri.joinPath).toHaveBeenCalledWith(
      expect.objectContaining({
        fsPath: '/workspace',
      }),
      'web-react',
    )
  })

  it('supports nested projectRoot paths', () => {
    get.mockReturnValue('tools/lint-project')

    resolveRoot(settings, output)

    expect(vscode.Uri.joinPath).toHaveBeenCalledWith(
      expect.anything(),
      'tools',
      'lint-project',
    )
  })

  it('throws when the workspace folder is missing', () => {
    vi.spyOn(vscode.workspace, 'workspaceFolders', 'get')
      .mockReturnValue(undefined)

    expect(() => resolveRoot(settings, output))
      .toThrow('Workspace folder is missing')

    expect(appendLine).toHaveBeenCalledWith(
      '[Lint on Start] ERROR: workspace folder is missing',
    )

    expect(get).not.toHaveBeenCalled()
  })

  it('throws when projectRoot is missing', () => {
    get.mockReturnValue(undefined)

    expect(() => resolveRoot(settings, output))
      .toThrow('projectRoot setting is missing')

    expect(appendLine).toHaveBeenCalledWith(
      '[Lint on Start] ERROR: projectRoot setting is missing',
    )

    expect(vscode.Uri.joinPath).not.toHaveBeenCalled()
  })
})