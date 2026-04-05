import { useState } from 'react';
import Button from '@components/primitives/button/Button';

export default function MirTop1() {
  const [interaction, setInteraction] = useState('idle')

  console.log(interaction)

  return (
    <div className="scene-root non-interactive">
      <Button
        id='test-button'
        className='test-button'
        data-state={interaction}
        reactPress
        reactPressRelease
        reactPressCancel
        onPress={() => setInteraction('pressed')}
        onPressRelease={() => setInteraction('released')}
        onPressCancel={() => setInteraction('cancel')}
      >
        <div className='button-base'>
          Click Me!!!
        </div>
      </Button>
    </div>
  )
}