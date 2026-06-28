import { alertStore } from '@stores/alert.store';
import ButtonPrim from '@primitives/ButtonPrim/ButtonPrim';
import { PanelBase } from '../blocks/Panel/PanelBase';

export default function AlertPanel() {
  const { open, message, onConfirm, onCancel, hide } = alertStore()

  if (!open) return null

  return (
    <PanelBase>
      <p>{message}</p>

      <ButtonPrim
        id='confirmAlart'
        onPressRelease={() => { onConfirm?.(); hide() }}>
        Yes
      </ButtonPrim>

      <ButtonPrim
        id='cancelAlart'
        onPressRelease={() => { onCancel?.(); hide() }}>
        Cancel
      </ButtonPrim>
    </PanelBase>
  )
}