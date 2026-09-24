import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const openTextDocumentMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({
  workspace: {
    openTextDocument: openTextDocumentMock,
  },
}))

import { openLspDocument } from '../../lsp/openLspDocument.ts'

describe(
  '[CSS Variable Completion] openLspDocument',
  () => {
    const appendLine = vi.fn()

    const output = {
      appendLine,
    }

    const lspPath = {
      fsPath:
        '/workspace/cascade/generated/metadata/lsp.ts',
    }

    beforeEach(() => {
      vi.clearAllMocks()

      openTextDocumentMock.mockResolvedValue({})
    })

    it('opens the LSP document and logs the refresh', async () => {
      await openLspDocument(
        lspPath as never,
        output as never,
      )

      expect(
        openTextDocumentMock,
      ).toHaveBeenCalledWith(lspPath)

      expect(
        appendLine,
      ).toHaveBeenCalledWith(
        '[css variable completion] LSP document refreshed',
      )
    })

    it('logs when opening the LSP document fails', async () => {
      const error = new Error('document unavailable')

      openTextDocumentMock.mockRejectedValue(error)

      await openLspDocument(
        lspPath as never,
        output as never,
      )

      expect(
        openTextDocumentMock,
      ).toHaveBeenCalledWith(lspPath)

      expect(
        appendLine,
      ).toHaveBeenCalledWith(
        `[css variable completion] failed to open LSP document: ${String(error)}`,
      )
    })
  },
)