import Drag from '@drag/Drag.tsx';

export default function MirMid1() {

  const onPress = () => {

  }

  return (
    <div className="scene-root non-interactive">
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