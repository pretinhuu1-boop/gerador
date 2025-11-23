import React, { useState, useEffect } from 'react';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import ToolsStudio from './components/ToolsStudio';
import { ImageIcon, VideoIcon, SparklesIcon, GemIcon, KeyIcon } from './components/icons';
import { CreationMode } from './types';

const App: React.FC = () => {
    const [creationMode, setCreationMode] = useState<CreationMode>('image');
    const [apiKeyReady, setApiKeyReady] = useState<boolean>(false);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setApiKeyReady(true);
            }
        };
        const timer = setTimeout(checkKey, 100); // Small delay to ensure window.aistudio is available
        return () => clearTimeout(timer);
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            try {
                await window.aistudio.openSelectKey();
                // Assume success to avoid race conditions, parent state will re-render eventually
                setApiKeyReady(true);
            } catch (e) {
                console.error("Failed to open API key selection:", e);
                // Optionally show an error to the user in a global toast/modal
            }
        }
    };

    const renderStudio = () => {
        const props = { apiKeyReady, onSelectKey: handleSelectKey };
        switch (creationMode) {
            case 'image':
                return <ImageStudio {...props} />;
            case 'video':
                return <VideoStudio {...props} />;
            case 'tools':
                return <ToolsStudio {...props} />;
            default:
                return <ImageStudio {...props} />;
        }
    };

    const ModeButton = ({ mode, label, icon }: { mode: CreationMode, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setCreationMode(mode)}
            className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors duration-200 w-full text-center ${
                creationMode === mode
                    ? 'bg-[#7D4FFF] text-white shadow-lg'
                    : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
        >
            {icon}
            <span className="font-semibold text-xs sm:text-sm">{label}</span>
        </button>
    );

    return (
        <div className="bg-[#131314] text-white min-h-screen h-screen flex flex-col font-sans">
            <header className="flex-shrink-0 bg-[#1E1F22] p-2 sm:p-4 shadow-md z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <GemIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#7D4FFF]" />
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">AI Content Studio</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <nav className="flex items-center gap-2 sm:gap-4">
                            <ModeButton mode="image" label="Imagem" icon={<ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />} />
                            <ModeButton mode="video" label="Vídeo" icon={<VideoIcon className="w-5 h-5 sm:w-6 sm:h-6" />} />
                            <ModeButton mode="tools" label="Ferramentas" icon={<SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6" />} />
                        </nav>
                        <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
                        <button
                            onClick={handleSelectKey}
                            title="Selecionar ou alterar chave de API para geração de vídeo"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                                apiKeyReady
                                    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                    : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 animate-pulse'
                            }`}
                        >
                            <KeyIcon className="w-4 h-4" />
                            <span className="hidden md:inline">{apiKeyReady ? 'Chave de API' : 'Selecionar Chave'}</span>
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex-grow p-2 sm:p-6 overflow-hidden">
                <div className="h-full">
                    {renderStudio()}
                </div>
            </main>
        </div>
    );
};

export default App;