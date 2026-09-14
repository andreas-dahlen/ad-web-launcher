import { alertStore } from '@stores/alert.store.ts';
import ButtonPrim from '@primitives/Button/ButtonPrim.tsx';
import Frame from '@composites/Frame/Frame.tsx';

export default function AlertPanel() {
  const { open, message, onConfirm, onCancel, hide } = alertStore()

  if (!open) return null

  return (
    <Frame
    // presets={["frame", "bg"]}
    >
      <p>{message}</p>

      <Frame
      // presets={["row"]}
      >


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
      </Frame>
    </Frame>
  )
}