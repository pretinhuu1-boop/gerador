import { Suspense, lazy, type ReactNode } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Sidebar } from './Sidebar';
import { Spinner } from '../ui/Spinner';

const ImageStudio = lazy(() => import('../ImageStudio'));
const VideoStudio = lazy(() => import('../VideoStudio'));
const ToolsStudio = lazy(() => import('../ToolsStudio'));
const ChannelOSHome = lazy(() => import('../channel-os/Home'));

const StudioFallback = () => (
  <div className="h-full flex items-center justify-center">
    <Spinner size={32} className="text-brand" />
  </div>
);

export const AppShell = ({
  apiKeyReady,
  onSelectKey,
}: {
  apiKeyReady: boolean;
  onSelectKey: () => Promise<void>;
}) => {
  const surface = useAppStore((s) => s.surface);

  const legacyProps = { apiKeyReady, onSelectKey };

  const render = (): ReactNode => {
    switch (surface) {
      case 'channel-os':
        return <ChannelOSHome />;
      case 'image-studio':
        return <ImageStudio {...legacyProps} />;
      case 'video-studio':
        return <VideoStudio {...legacyProps} />;
      case 'tools-studio':
        return <ToolsStudio {...legacyProps} />;
    }
  };

  return (
    <div className="h-screen w-screen flex bg-bg-base overflow-hidden">
      <Sidebar />
      <main className="flex-1 min-w-0 ambient-bg overflow-hidden">
        <Suspense fallback={<StudioFallback />}>{render()}</Suspense>
      </main>
    </div>
  );
};
