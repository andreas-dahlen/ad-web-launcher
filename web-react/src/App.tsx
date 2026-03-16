import { APP_SETTINGS } from './app/config/appSettings.ts';
import  DebugWrapper  from './app/debug/DebugWrapper.tsx';
import  DebugPanel  from './app/debug/DebugPanel.tsx';
import  Root  from './layout/Root.tsx';
import './app/styles/main.css'

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

