import DragButton from '@components/composites/DragButton';
import Drag from '@drag/Drag.tsx';

export default function Mid1() {

  return (
    <div>¨
      <DragButton
        id='drag-btn-test'

      >

      </DragButton>

      <Drag
        id='mid1-drag'
        className='button-preset'
      // lockable={true}
      >
        {/* TODO make it an opt in CSS style */}

        <p>futurebtn</p>
      </Drag>
    </div >
  )
}