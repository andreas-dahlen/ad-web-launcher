import Drag from '@drag/Drag.tsx';

export default function MirWp2() {

  return (
    <div>
      <Drag
        id='wp2-drag'
        // className='button-preset'
        lockable={true}

      >
        <p>futurebtn</p>
      </Drag>
    </div>
  )
}