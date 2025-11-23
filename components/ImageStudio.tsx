// components/ImageStudio.tsx
import React, { useState } from 'react';
import { ImageStudioMode } from '../types';
import FlyerCreator from './studios/FlyerCreator';
import TelaoCreator from './studios/TelaoCreator';
import EditorialStudio from './studios/EditorialStudio';
import DecupagemStudio from './studios/DecupagemStudio';
import { ClapperboardIcon } from './icons';

interface ImageStudioProps {
    apiKeyReady: boolean;
    onSelectKey: () => Promise<void>;
}

const ImageStudio: React.FC<ImageStudioProps> = ({ apiKeyReady, onSelectKey }) => {
    const [mode, setMode] = useState<ImageStudioMode>('editorial');

    const TabButton = ({ targetMode, label }: { targetMode: ImageStudioMode, label: string }) => (
        <button
            onClick={() => setMode(targetMode)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition ${mode === targetMode ? 'bg-[#7D4FFF] text-white' : 'bg-white/10 hover:bg-white/20'}`}
        >
            {label}
        </button>
    );

    return (
         <div className="h-full flex flex-col">
            <div className="flex-shrink-0 mb-4">
                <div className="bg-[#1E1F22] p-2 rounded-lg max-w-2xl mx-auto">
                     <div className="grid grid-cols-4 gap-2">
                        <TabButton targetMode="flyer" label="Criador de Flyer" />
                        <TabButton targetMode="telao" label="Telão de Show" />
                        <TabButton targetMode="editorial" label="Estúdio Editorial" />
                        <TabButton targetMode="decupagem" label="Decupagem (Roteiro)" />
                    </div>
                </div>
            </div>
            <div className="flex-grow h-[calc(100%-4rem)]">
                {mode === 'flyer' && <FlyerCreator apiKeyReady={apiKeyReady} onSelectKey={onSelectKey} />}
                {mode === 'telao' && <TelaoCreator />}
                {mode === 'editorial' && <EditorialStudio />}
                {mode === 'decupagem' && <DecupagemStudio apiKeyReady={apiKeyReady} onSelectKey={onSelectKey} />}
            </div>
        </div>
    )
};

export default ImageStudio;