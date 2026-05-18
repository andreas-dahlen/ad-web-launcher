import { useEffect, useState } from 'react';
import { APP_CONFIG } from '@config/appConfig.ts';
import DebugWrapper from '@debug/DebugWrapper.tsx';
import Root from './app/Root.tsx';
import '@styles/index.css'
import LoadingScene from '@scenes/LoadingScene.tsx';

export default function App() {

  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (APP_CONFIG.debugMode) {
    console.log('DEBUG MODE')
  } else {
    console.log('PRODUCTION MODE')
  }

  const content = APP_CONFIG.debugMode
    ? <DebugWrapper><Root /></DebugWrapper>
    : <Root />

  return (
    <>
      {content}
      <LoadingScene visible={visible} />
    </>
  )
}

