// components/studios/BRollLibrary.tsx
import React, { useState } from 'react';
import { bRollLibrary } from '../../data/b_roll_library';
import { promptLibrary, bananaPromptLibrary } from '../../data/prompt_library';
import { CopyIcon, CheckCircleIcon } from '../icons';

const BRollLibrary: React.FC = () => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const bRollCount = bRollLibrary.reduce((acc, category) => acc + category.scenarios.length, 0);
    const promptLibCount = promptLibrary.reduce((versionAcc, version) =>
        versionAcc + version.categories.reduce((catAcc, category) => catAcc + category.items.length, 0),
    0);
    const bananaLibCount = bananaPromptLibrary.length;
    const totalPrompts = bRollCount + promptLibCount + bananaLibCount;

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const bananaPromptsByCategory = bananaPromptLibrary.reduce((acc, prompt) => {
        (acc[prompt.category] = acc[prompt.category] || []).push(prompt);
        return acc;
    }, {} as Record<string, typeof bananaPromptLibrary>);

    return (
        <div className="bg-[#131314] p-6 rounded-lg h-full overflow-y-auto text-white/90 font-sans">
             <header className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold mb-2 text-primary tracking-tight">📚 Biblioteca Mestra de Prompts (IA)</h1>
                <p className="max-w-4xl mx-auto text-white/70">
                    Um acervo com <span className="font-bold text-accent">{totalPrompts.toLocaleString('pt-BR')}</span> prompts, cenas de B-Roll, texturas e roteiros cinematográficos para pré-produção de IA.
                </p>
            </header>
            <div className="space-y-12">
                {bRollLibrary.map(category => (
                    <section key={category.title}>
                        <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">{category.title}</h2>
                        <p className="text-sm text-white/70 mb-6 -mt-2">{category.subtitle}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {category.scenarios.map(scenario => {
                                const itemId = `broll-${scenario.id}`;
                                return (
                                <div key={itemId} className="bg-panel p-4 rounded-lg border border-border group relative transition-all hover:border-primary/50">
                                    <p className="text-sm pr-8 whitespace-pre-wrap">{scenario.description}</p>
                                    <button 
                                        onClick={() => handleCopy(scenario.description, itemId)}
                                        className="absolute top-3 right-3 p-1.5 bg-panel-light text-white/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                        title="Copiar prompt"
                                    >
                                        {copiedId === itemId ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            )})}
                        </div>
                    </section>
                ))}

                {promptLibrary.map(version => (
                    <section key={version.version}>
                        <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">{version.description}</h2>
                        <div className="space-y-8">
                            {version.categories.map(category => (
                                <div key={category.name}>
                                    <h3 className="text-xl font-semibold text-white/80 mb-4">{category.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {category.items.map(item => {
                                            const itemId = `prompt-${version.version}-${item.id}`;
                                            return (
                                                <div key={itemId} className="bg-panel p-4 rounded-lg border border-border group relative transition-all hover:border-primary/50">
                                                    <p className="text-sm pr-8 whitespace-pre-wrap">{item.text}</p>
                                                    <button 
                                                        onClick={() => handleCopy(item.text, itemId)}
                                                        className="absolute top-3 right-3 p-1.5 bg-panel-light text-white/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                                        title="Copiar prompt"
                                                    >
                                                        {copiedId === itemId ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                <section>
                    <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">PROMPTS AVANÇADOS (ESTRUTURADOS)</h2>
                    <div className="space-y-8">
                        {Object.entries(bananaPromptsByCategory).map(([categoryName, prompts]) => (
                            <div key={categoryName}>
                                <h3 className="text-xl font-semibold text-white/80 mb-4">{categoryName}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {prompts.map(item => {
                                        const combinedText = `[TITLE] ${item.title}\n\n[POSITIVE]\n${item.positive}\n\n[NEGATIVE]\n${item.negative}`;
                                        const itemId = `banana-${item.id}`;
                                        return (
                                            <div key={itemId} className="bg-panel p-4 rounded-lg border border-border group relative transition-all hover:border-primary/50">
                                                <p className="font-bold text-sm mb-2 text-accent">{item.title}</p>
                                                <p className="text-sm pr-8 whitespace-pre-wrap">{item.positive}</p>
                                                <button 
                                                    onClick={() => handleCopy(combinedText, itemId)}
                                                    className="absolute top-3 right-3 p-1.5 bg-panel-light text-white/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                                    title="Copiar prompt completo (com negativos)"
                                                >
                                                    {copiedId === itemId ? <CheckCircleIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BRollLibrary;
