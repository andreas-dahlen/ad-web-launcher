// import { useState } from 'react';
import Button from '@button/Button.tsx';

export default function MirTop1() {
  return (
    <div className="scene-root non-interactive">
      <Button
        id='test-button'
        className='button-default'
      >
        <div className='button-preset'>
          Click Me!!!
        </div>
      </Button>
    </div>
  )
}