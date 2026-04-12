import Button from '@button/Button.tsx';
import { useDragLock } from '@config/settingsHooks/useDragLock';

export default function DebugPanel() {
  const { dragLock, setDragLock } = useDragLock()

  const setLock = () => {
    setDragLock(!dragLock)
  }

  return (
    <div className='debug-pannel-layer'>
      <div className='debug-pannel-style' />
      <div className='debug-pannel-wrapper'>
        <Button
          id="lock-unlock-drag"
          className={`button-default ${dragLock ? 'locked-col' : 'move-col'}`}
          onPressRelease={setLock}
        >
          <div className='button-base'>
            {/* {dragLock ? 'locked' : 'unlocked'} */}
          </div>
        </Button>
        <Button
          id="other-settings"
          className={'button-default'}
        // onPressRelease={setLock}
        >
          <div className='button-base' />
        </Button>
      </div >
    </div >
  )
}