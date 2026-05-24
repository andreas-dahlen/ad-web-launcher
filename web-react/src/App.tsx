import { useEffect, useState } from 'react';
import { APP_CONFIG } from '@config/appConfig.ts';
import DebugWrapper from '@components/system/DebugWrapper.tsx';
import Root from './app/Root.tsx';
import '@styles/index.css'
import LoadingScene from './components/system/LoadingScene.tsx';

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

