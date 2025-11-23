// components/PromptLibraryModal.tsx
import React from 'react';
import { promptLibrary } from '../data/prompt_library';

interface PromptLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const PromptLibraryModal: React.FC<PromptLibraryModalProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#1E1F22] rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col border border-white/10 modal-fade" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-xl font-bold text-white">Biblioteca de Prompts</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 gap-8">
            {/* Simple Prompts */}
            <div>
              <h4 className="text-lg font-semibold text-[#7D4FFF] mb-4">Prompts para Imagem e Vídeo</h4>
              {promptLibrary.map(version => {
                const totalPromptsInVersion = version.categories.reduce((acc, cat) => acc + cat.items.length, 0);
                return (
                <div key={version.version} className="mb-6">
                  <h5 className="font-bold text-white/90 mb-2">{version.description} <span className="text-sm font-normal text-white/50">(Total: {totalPromptsInVersion})</span></h5>
                  {version.categories.map(category => (
                    <div key={category.name} className="mb-4">
                      <p className="font-semibold text-white/70 mb-2">{category.name} <span className="font-normal text-white/50">({category.items.length} prompts)</span></p>
                      <ul className="space-y-2">
                        {category.items.map(item => (
                          <li key={item.id}>
                            <button 
                              onClick={() => {
                                onSelectPrompt(item.text);
                                onClose();
                              }}
                              className="w-full text-left text-sm text-white/80 bg-white/5 p-2 rounded-md hover:bg-[#7D4FFF]/20 transition-colors"
                            >
                              {item.text}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )})}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptLibraryModal;