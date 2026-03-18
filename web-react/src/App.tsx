import { APP_SETTINGS } from '@config/appSettings.ts';
import  DebugWrapper  from '@debug/DebugWrapper.tsx';
import  DebugPanel  from '@debug/DebugPanel.tsx';
import  Root  from '@layout/Root.tsx';
import '@styles/main.css'

export default function App() {
  if (APP_SETTINGS.DebugWrapper) {
    return (
      <DebugWrapper>
        <DebugPanel />
        <Root />
      </DebugWrapper>
    )
  }
  return <Root />;
};

