import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { nudgeCssModule } from '../../lsp/nudgeModule.ts'

const visibleTextEditors = vi.hoisted(
  () => [] as unknown[],
)

const PositionMock = vi.hoisted(() =>
  vi.fn(function (
    this: {
      line: number
      character: number
      translate: (
        lineDelta: number,
        characterDelta: number,
      ) => unknown
    },
    line: number,
    character: number,
  ) {
    this.line = line
    this.character = character

    this.translate = (
      lineDelta: number,
      characterDelta: number,
    ) => new PositionMock(
      line + lineDelta,
      character + characterDelta,
    )
  }),
)

const RangeMock = vi.hoisted(() =>
  vi.fn(function (
    this: {
      start: unknown
      end: unknown
    },
    start: unknown,
    end: unknown,
  ) {
    this.start = start
    this.end = end
  }),
)

vi.mock('vscode', () => ({
  Position: PositionMock,
  Range: RangeMock,
  window: {
    get visibleTextEditors() {
      return visibleTextEditors
    },
  },
}))

afterEach(() => {
  visibleTextEditors.length = 0
})

describe('[EXTENSION] nudgeCssModule', () => {
  it('does nothing when the document has no visible editor', async () => {
    const document = {}

    await nudgeCssModule(document as never)

    expect(PositionMock).not.toHaveBeenCalled()
  })

  it('nudges the document and saves it', async () => {
    const document = {
      save: vi.fn().mockResolvedValue(true),
    }

    const insert = vi.fn()
    const deleteText = vi.fn()

    const edit = vi
      .fn()
      .mockImplementationOnce(async (callback) => {
        callback({
          insert,
        })

        return true
      })
      .mockImplementationOnce(async (callback) => {
        callback({
          delete: deleteText,
        })

        return true
      })

    visibleTextEditors.push({
      document,
      edit,
    })

    await nudgeCssModule(document as never)

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        line: 0,
        character: 0,
      }),
      ' '
    )

    const deleteRange = deleteText.mock.calls[0][0]

    expect(deleteRange).toMatchObject({
      start: {
        line: 0,
        character: 0,
      },
      end: {
        line: 0,
        character: 1,
      },
    })

    expect(document.save).toHaveBeenCalledOnce()
  })

  it('does not delete or save when the insert fails', async () => {
    const document = {
      save: vi.fn().mockResolvedValue(true),
    }

    const insert = vi.fn()
    const deleteText = vi.fn()

    const edit = vi.fn().mockImplementation(async (callback) => {
      callback({
        insert,
      })

      return false
    })

    visibleTextEditors.push({
      document,
      edit,
    })

    await nudgeCssModule(document as never)

    expect(insert).toHaveBeenCalledOnce()
    expect(deleteText).not.toHaveBeenCalled()
    expect(document.save).not.toHaveBeenCalled()
  })
})