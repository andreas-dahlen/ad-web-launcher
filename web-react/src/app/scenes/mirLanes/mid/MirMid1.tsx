import Drag from '@drag/Drag.tsx';

export default function MirMid1() {

  const onPress = () => {

  }

  return (
    <div>
      <Drag
        id='mid1-drag'
        className='button-preset move-col'
        on-press={onPress}
      // locked={true}
      >
        {/* TODO make it an opt in CSS style */}

        <p>futurebtn</p>
      </Drag>
    </div >
  )
}