import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AppShell } from './components/shell/AppShell';
import { LoginScreen } from './components/shell/LoginScreen';
import { Spinner } from './components/ui/Spinner';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [apiKeyReady, setApiKeyReady] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && (await window.aistudio.hasSelectedApiKey())) {
        setApiKeyReady(true);
      }
    };
    const t = setTimeout(checkKey, 100);
    return () => clearTimeout(t);
  }, []);

  const handleSelectKey = async (): Promise<void> => {
    if (!window.aistudio) return;
    try {
      await window.aistudio.openSelectKey();
      setApiKeyReady(true);
    } catch (e) {
      console.error('Failed to open API key selection:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen ambient-bg flex items-center justify-center">
        <Spinner size={32} className="text-brand" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <AppShell apiKeyReady={apiKeyReady} onSelectKey={handleSelectKey} />;
};

export default App;
