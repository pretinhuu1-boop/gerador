import { useAppStore } from '../../stores/appStore';
import { ChatHome } from './chat/ChatHome';
import { ScoutWorkspace } from './scout/ScoutWorkspace';
import { ContentWorkspace } from './content/ContentWorkspace';
import { ChannelsWorkspace } from './channels/ChannelsWorkspace';
import { MemoryWorkspace } from './memory/MemoryWorkspace';

const ChannelOSHome = () => {
  const workspace = useAppStore((s) => s.activeWorkspace);

  switch (workspace) {
    case 'scout':
      return <ScoutWorkspace />;
    case 'content':
      return <ContentWorkspace />;
    case 'channels':
      return <ChannelsWorkspace />;
    case 'memory':
      return <MemoryWorkspace />;
    default:
      return <ChatHome />;
  }
};

export default ChannelOSHome;
