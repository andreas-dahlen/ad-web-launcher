import Drag from '@components/primitives/drag/Drag'
import Button from '@components/primitives/button/Button'
import type { DragButtonProps } from '@typeScript/propsType'

export default function DragButton({
  id,
  snapX,
  snapY,
  settingsSnap = false, //set to true always?
  onSwipeCommit,
  children,
  className,
  action,
  isDrag,
  onPressRelease,
  buttonDataAttrs,
  dragDataAttrs
}: DragButtonProps) {

  return (

    <Drag
      id={`${id}-drag`}
      className={className}
      snapX={snapX}
      snapY={snapY}
      settingsSnap={settingsSnap}
      lockable={true}
      onSwipeCommit={onSwipeCommit}
      dragDataAttrs={dragDataAttrs}
    >
      <Button
        id={`${id}-button`}
        interactive={!isDrag}
        className={className}
        action={action}
        onPressRelease={onPressRelease}
        buttonDataAttrs={buttonDataAttrs}
      >
        {children}
      </Button>

      {/* {children} */}
    </Drag>
  )

}