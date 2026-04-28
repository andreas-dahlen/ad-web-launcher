import { APP_SETTINGS } from './stores/settingsStore.ts';
import DebugWrapper from '@debug/DebugWrapper.tsx';
import Root from './app/Root.tsx';
import '@styles/index.css'

export default function App() {
  if (APP_SETTINGS.debugWrapper) {
    return (
      <DebugWrapper>
        <Root />
      </DebugWrapper >
    )
  }
  return <Root />;
};

