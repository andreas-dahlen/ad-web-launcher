import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const fetchTasksMock = vi.hoisted(() =>
  vi.fn(),
)

const executeTaskMock = vi.hoisted(() =>
  vi.fn(),
)

const getMock = vi.hoisted(() =>
  vi.fn(),
)

vi.mock('vscode', () => ({
  tasks: {
    fetchTasks: fetchTasksMock,
    executeTask: executeTaskMock,
  },

  workspace: {
    getConfiguration: vi.fn(() => ({
      get: getMock,
    })),
  },
}))

import { runTask } from '../vscode/runTask.ts'

describe(
  '[Project Lint] runTask',
  () => {
    const appendLine = vi.fn()

    const output = {
      appendLine,
    }

    beforeEach(() => {
      vi.clearAllMocks()

      getMock.mockReturnValue('project-lint')

      fetchTasksMock.mockResolvedValue([
        {
          name: 'project-lint',
        },
      ])
    })

    it('executes the configured task', async () => {
      const task = {
        name: 'project-lint',
      }

      fetchTasksMock.mockResolvedValue([
        {
          name: 'other-task',
        },
        task,
      ])

      await runTask(output as never)

      expect(
        fetchTasksMock,
      ).toHaveBeenCalledOnce()

      expect(
        getMock,
      ).toHaveBeenCalledWith('taskLabel')

      expect(
        executeTaskMock,
      ).toHaveBeenCalledWith(task)
    })

    it('logs when the configured task cannot be found', async () => {
      fetchTasksMock.mockResolvedValue([
        {
          name: 'other-task',
        },
      ])

      await runTask(output as never)

      expect(
        executeTaskMock,
      ).not.toHaveBeenCalled()

      expect(
        appendLine,
      ).toHaveBeenCalledWith(
        "Couldn't find any task with the name: project-lint",
      )
    })
  },
)