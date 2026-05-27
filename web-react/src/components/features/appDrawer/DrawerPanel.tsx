import Scroll from '@components/primitives/scroll/Scroll';

export default function DrawerPanel() {

  return (
    <Scroll
      id='drawer'
      axis="vertical"
      onEdgeDir='up'
    >
      {/* 
      <div className='test-frame'>
        <div className='test-content'></div>
      </div> */}
    </Scroll>
  )
}