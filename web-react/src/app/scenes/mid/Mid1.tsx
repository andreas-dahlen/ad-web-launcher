import Drag from '@drag/Drag.tsx';

export default function Mid1() {

  const onPress = () => {

  }

  return (
    <div>
      <Drag
        id='mid1-drag'
        className='button-preset'
        on-press={onPress}
      // lockable={true}
      >
        {/* TODO make it an opt in CSS style */}

        <p>futurebtn</p>
      </Drag>
    </div >
  )
}