import { describe, expect, it } from 'vitest'

import {
  createId,
  generateId
} from '@data/generators/idGenerator'

describe('[DATA] idGenerator', () => {
  describe('generateId', () => {
    it('generates an 8-character alphanumeric id', () => {
      const id = generateId()

      expect(id).toHaveLength(8)
      expect(id).toMatch(/^[a-z0-9]+$/)
    })
  })

  describe('createId', () => {
    it('creates an id from the type and generated id', () => {
      const id = createId('lane')

      expect(id).toMatch(/^lane_[a-z0-9]{8}$/)
    })

    it('uses the provided id', () => {
      expect(
        createId('scene', 'MyScene')
      ).toBe('scene_myscene')
    })

    it('normalizes the type', () => {
      expect(
        createId('My Type')
      ).toMatch(/^my-type_[a-z0-9]{8}$/)
    })

    it('normalizes the provided id', () => {
      expect(
        createId('scene', 'My Scene')
      ).toBe('scene_my-scene')
    })

    it('removes invalid characters from the type', () => {
      expect(
        createId('My@Type!')
      ).toMatch(/^mytype_[a-z0-9]{8}$/)
    })

    it('removes invalid characters from the provided id', () => {
      expect(
        createId('scene', 'Scene@#$!')
      ).toBe('scene_scene')
    })

    it('preserves underscores and hyphens', () => {
      expect(
        createId(
          'Some_Type',
          'My_Scene-01'
        )
      ).toBe('some_type_my_scene-01')
    })

    it('includes the infix when provided', () => {
      expect(
        createId(
          'token',
          'button',
          'primary'
        )
      ).toBe('token_primary_button')
    })

    it('normalizes the infix', () => {
      expect(
        createId(
          'token',
          'button',
          'Primary Mode'
        )
      ).toBe('token_primary-mode_button')
    })

    it('omits the infix when it is an empty string', () => {
      expect(
        createId(
          'scene',
          'button',
          ''
        )
      ).toBe('scene_button')
    })

    it('generates an id when the provided id is empty', () => {
      const id = createId(
        'scene',
        ''
      )

      expect(id).toMatch(
        /^scene_[a-z0-9]{8}$/
      )
    })
  })
})