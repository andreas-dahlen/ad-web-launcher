import { useEffect, useState } from 'react';
import { APP_SETTINGS } from './stores/settingsStore.ts';
import DebugWrapper from '@debug/DebugWrapper.tsx';
import Root from './app/Root.tsx';
import '@styles/index.css'
import { useAppStore } from './hooks/useAppStore.ts';
import LoadingScene from '@scenes/LoadingScene.tsx';
import { appStore } from './stores/appStore.ts';

export default function App() {

  const { loading } = useAppStore()

  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!loading) {
      setTimeout(() => setVisible(false), 300)
    }
  }, [loading])

  useEffect(() => {
    const timer = setTimeout(() => {
      appStore.getState().setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  if (APP_SETTINGS.debugWrapper) {
    return (
      <>
        <DebugWrapper>
          <Root />
        </DebugWrapper >
        {visible && <LoadingScene fading={!loading} />}
      </>

    )
  }
  return (
    <>
      <Root />
      {visible && <LoadingScene fading={!loading} />}
    </>
  )
};

