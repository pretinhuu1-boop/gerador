import { Suspense, lazy, type ReactNode } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Sidebar } from './Sidebar';
import { MobileMenuButton } from './MobileMenuButton';
import { StatusStrip } from './StatusStrip';
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

  const isChannelOS = surface === 'channel-os';

  return (
    <div className="h-screen w-screen flex bg-bg-base overflow-hidden">
      <Sidebar />
      <MobileMenuButton />
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <main className="flex-1 min-h-0 overflow-hidden">
          <Suspense fallback={<StudioFallback />}>{render()}</Suspense>
        </main>
        {isChannelOS && <StatusStrip />}
      </div>
    </div>
  );
};
