import Drag from '../../../primitives/drag/Drag';
import { useSettingsStore } from '@hooks/useSettingsStore.hook';

export default function Vert2() {

  const { isLayoutEditMode } = useSettingsStore()

  return (
    <div>
      <Drag
        id='wp2-drag-with-lock'
        interactive={isLayoutEditMode}
      >
        <p>lockbtn</p>
      </Drag>
      <Drag
        id='wp2-drag-with-snap'
        useSettingsSnap={true}

      >
        <p>snapbtn</p>
      </Drag>
    </div>
  )
}