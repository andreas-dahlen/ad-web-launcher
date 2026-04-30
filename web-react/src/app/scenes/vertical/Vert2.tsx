import Drag from '@drag/Drag.tsx';

export default function Wp2() {

  return (
    <div>
      <Drag
        id='wp2-drag-with-lock'
        lockable={true}

      >
        <p>lockbtn</p>
      </Drag>
      <Drag
        id='wp2-drag-with-snap'
        settingsSnap={true}

      >
        <p>snapbtn</p>
      </Drag>
    </div>
  )
}