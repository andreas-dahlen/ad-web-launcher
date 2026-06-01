import DragButton from '../../../composites/DragButton';
import Drag from '../../../primitives/drag/Drag';
import { createTestDescriptor } from '@test/functions';

export default function Mid1() {

  return (
    <div>¨
      <DragButton
        id='drag-btn-test'
        onPressRelease={() => createTestDescriptor('drag')}
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