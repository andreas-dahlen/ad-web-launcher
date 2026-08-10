import { describe, expect, it } from 'vitest'

import { alertStore } from '@shared/state/stores/alert.store'

describe('[ALERT STORE]', () => {
  const reset = () => {
    alertStore.setState({
      open: false,
      message: '',
      onConfirm: null,
      onCancel: null
    })
  }

  it('starts closed with empty state', () => {
    reset()

    expect(alertStore.getState()).toMatchObject({
      open: false,
      message: '',
      onConfirm: null,
      onCancel: null
    })
  })

  it('opens an alert with a message and confirm callback', () => {
    reset()

    const onConfirm = () => { }

    alertStore.getState().show({
      message: 'Delete this item?',
      onConfirm
    })

    expect(alertStore.getState()).toMatchObject({
      open: true,
      message: 'Delete this item?',
      onConfirm,
      onCancel: null
    })
  })

  it('stores the optional cancel callback', () => {
    reset()

    const onConfirm = () => { }
    const onCancel = () => { }

    alertStore.getState().show({
      message: 'Delete this item?',
      onConfirm,
      onCancel
    })

    expect(alertStore.getState()).toMatchObject({
      open: true,
      message: 'Delete this item?',
      onConfirm,
      onCancel
    })
  })

  it('replaces the current alert when shown again', () => {
    reset()

    const firstConfirm = () => { }
    const secondConfirm = () => { }

    alertStore.getState().show({
      message: 'First',
      onConfirm: firstConfirm,
      onCancel: () => { }
    })

    alertStore.getState().show({
      message: 'Second',
      onConfirm: secondConfirm
    })

    expect(alertStore.getState()).toMatchObject({
      open: true,
      message: 'Second',
      onConfirm: secondConfirm,
      onCancel: null
    })
  })

  it('hides the alert and clears all state', () => {
    reset()

    const onConfirm = () => { }
    const onCancel = () => { }

    alertStore.getState().show({
      message: 'Delete this item?',
      onConfirm,
      onCancel
    })

    alertStore.getState().hide()

    expect(alertStore.getState()).toMatchObject({
      open: false,
      message: '',
      onConfirm: null,
      onCancel: null
    })
  })
})