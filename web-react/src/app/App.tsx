import { useEffect, useState } from 'react';
import { APP_CONFIG } from '@config/app.config.ts';
import DebugWrapper from './infrastructure/DebugWrapper.tsx';
import Root from './Root.tsx'
import LoadingScene from './infrastructure/LoadingScene.tsx';
import { __TEST_ONLY_API } from '../interaction/input/gesture.utils.ts';
export default function App() {

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

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

