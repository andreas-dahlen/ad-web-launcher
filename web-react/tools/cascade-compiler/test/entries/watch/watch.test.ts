import { beforeEach, describe, expect, it, vi } from 'vitest'

import { watch } from '../../../src/entries/watch/watch.ts'

const createRuntimeMock = vi.hoisted(() => vi.fn())

vi.mock(
  '../../../src/entries/watch/createRuntime.ts',
  () => ({
    createRuntime: createRuntimeMock,
  }),
)

const runtime = {
  dispose: vi.fn(),
}

describe('[ENTRIES > WATCH]', () => {
  describe('watch', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('creates a runtime for the project', async () => {
      createRuntimeMock.mockReturnValue(runtime)

      await watch('/project')

      expect(createRuntimeMock).toHaveBeenCalledWith(
        '/project',
        expect.any(Function),
      )
    })

    it('restarts the runtime when config changes', async () => {
      createRuntimeMock
        .mockReturnValueOnce(runtime)
        .mockReturnValueOnce(runtime)

      await watch('/project')

      const restart = createRuntimeMock.mock.calls[0][1]

      await restart()

      expect(runtime.dispose).toHaveBeenCalledOnce()
      expect(createRuntimeMock).toHaveBeenCalledTimes(2)
      expect(createRuntimeMock).toHaveBeenLastCalledWith(
        '/project',
        expect.any(Function),
      )
    })

    it('handles a disabled runtime', async () => {
      createRuntimeMock.mockReturnValue(null)

      await watch('/project')

      expect(createRuntimeMock).toHaveBeenCalledOnce()
    })
  })
})