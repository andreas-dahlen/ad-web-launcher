import Drag from '@drag/Drag.tsx';
import { useSettingsStore } from '../../../hooks/useSettingsStore';

export default function Wp2() {

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