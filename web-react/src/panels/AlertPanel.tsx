import { alertStore } from '@stores/alert.store';
import Button from '@primitives/Button/Button';
import { PanelBase } from '@composites/controls/PanelBase/PanelBase';

export default function AlertPanel() {
  const { open, message, onConfirm, onCancel, hide } = alertStore()

  if (!open) return null

  return (
    <PanelBase>
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
    </PanelBase>
  )
}