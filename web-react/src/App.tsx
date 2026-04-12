import { APP_SETTINGS } from '@config/appSettings.ts';
import DebugWrapper from '@debug/DebugWrapper.tsx';
import DebugPanel from '@debug/DebugPanel.tsx';
import Root from './app/Root.tsx';
import '@styles/main.css'

export default function App() {
  if (APP_SETTINGS.debugWrapper) {
    return (
      <DebugWrapper>
        <Root />
        <DebugPanel />
      </DebugWrapper >
    )
  }
  return <Root />;
};

