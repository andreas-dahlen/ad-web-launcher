import {
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  loadExtensionData,
} from '../../variables/loadExtensionData.ts'

const createExtensionDataFile = (contents: string) => {
  const directory = mkdtempSync(
    path.join(tmpdir(), 'css-variable-completion-'),
  )

  const filePath = path.join(
    directory,
    'extension.generated.jsonc',
  )

  writeFileSync(filePath, contents)

  return {
    uri: {
      fsPath: filePath,
    } as Parameters<typeof loadExtensionData>[0],
    cleanup: () =>
      rmSync(directory, {
        recursive: true,
        force: true,
      }),
  }
}

describe('[EXTENSION] loadExtensionData', () => {
  it('returns an empty array when the file cannot be read', () => {
    const uri = {
      fsPath: path.join(
        tmpdir(),
        'css-variable-completion-does-not-exist.jsonc',
      ),
    } as Parameters<typeof loadExtensionData>[0]

    expect(loadExtensionData(uri)).toEqual([])
  })

  it('loads extension data from JSONC', () => {
    const file = createExtensionDataFile(`
      [
        // Generated variables
        {
          "cssPath": "/project/src/button.css",
          "variables": [
            "--color-primary",
            "--color-secondary",
          ],
        },
        {
          "cssPath": "/project/src/carousel.css",
          "variables": [
            "--carousel-height",
          ],
        },
      ]
    `)

    try {
      expect(loadExtensionData(file.uri)).toEqual([
        {
          cssPath: '/project/src/button.css',
          variables: [
            '--color-primary',
            '--color-secondary',
          ],
        },
        {
          cssPath: '/project/src/carousel.css',
          variables: [
            '--carousel-height',
          ],
        },
      ])
    } finally {
      file.cleanup()
    }
  })

  it('returns an empty array when the file does not contain valid extension data', () => {
    const file = createExtensionDataFile(`
      {
        "cssPath": "/project/src/button.css",
        "variables": [
          "--color-primary"
        ]
      }
    `)

    try {
      expect(loadExtensionData(file.uri)).toEqual([])
    } finally {
      file.cleanup()
    }
  })

  it('returns an empty array when variables are not strings', () => {
    const file = createExtensionDataFile(`
      [
        {
          "cssPath": "/project/src/button.css",
          "variables": [
            "--color-primary",
            42
          ]
        }
      ]
    `)

    try {
      expect(loadExtensionData(file.uri)).toEqual([])
    } finally {
      file.cleanup()
    }
  })
})