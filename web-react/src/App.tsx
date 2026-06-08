import { useEffect, useState } from 'react';
import { APP_CONFIG } from '@config/app.config.ts';
import DebugWrapper from './infrastructure/DebugWrapper.tsx';
import Root from './app/Root.tsx';
import '@styles/index.css'
import LoadingScene from './infrastructure/LoadingScene.tsx';

export default function App() {

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
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
      <LoadingScene visible={isLoading} />
    </>
  )
}

