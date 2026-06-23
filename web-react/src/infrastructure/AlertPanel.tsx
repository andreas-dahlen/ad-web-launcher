import { alertStore } from '@stores/alert.store';
import css from './System.module.css'
import Button from '@primitives/button/Button';

export default function AlertPanel() {
  const { open, message, onConfirm, onCancel, hide } = alertStore()

  if (!open) return null

  return (
    <div className={css.overlay}>
      <div className={css.alert}>
        <p>{message}</p>

        <Button
          id='confirmAlart'
          onPressRelease={() => { onConfirm?.(); hide() }}>
          Yes
        </Button>

        <Button
          id='cancelAlart'
          onPressRelease={() => { onCancel?.(); hide() }}>
          Cancel
        </Button>
      </div>
    </div>
  )
}