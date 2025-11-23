// components/studios/IntelligentPipeline.tsx
import React from 'react';
import { LayersIcon, SparklesIcon, FilmIcon, VideoIcon } from '../icons';

const IntelligentPipeline: React.FC = () => {
    const stages = [
        {
            icon: <div className="bg-primary/20 p-3 rounded-full"><SparklesIcon className="w-8 h-8 text-primary" /></div>,
            title: 'Etapa 1: O Diretor Mestre (Super Prompt)',
            description: 'Nesta fase consolidada, um único "super prompt" guia um agente de IA avançado através de todo o processo criativo. Ele recebe a música e os assets e executa internamente todas as tarefas de pré-produção, garantindo uma visão coesa do início ao fim.',
            subtasks: [
                'Análise Musical e Extração de DNA (Ritmo, Tom, Emoção)',
                'Definição do Conceito Criativo e Narrativa',
                'Seleção e Injeção de Contexto Cultural (PCC)',
                'Criação do Roteiro Mestre e Decupagem em Cenas',
                'Validação de Física e Continuidade em tempo real',
                'Refinamento com Transições e Efeitos de Pós-Produção',
            ],
            output: 'Um "Blueprint" de produção completo em formato JSON, contendo o roteiro final de cada cena, prompts para moodboard e thumbnail, e o estado final do universo do clipe (GSM).'
        },
        {
            icon: <div className="bg-accent/20 p-3 rounded-full"><VideoIcon className="w-8 h-8 text-accent" /></div>,
            title: 'Etapa 2: A Unidade de Produção (Geração)',
            description: 'Esta é a fase de execução. Uma unidade de automação "burra" recebe o blueprint do Diretor Mestre e executa as ordens de geração, uma a uma, sem tomar decisões criativas. É a linha de montagem que materializa a visão.',
            subtasks: [
                'Geração das imagens do Moodboard.',
                'Criação do "Master Frame" (o primeiro quadro) de cada cena.',
                'Animação de cada Master Frame para gerar os clipes de vídeo.',
                'Geração da Thumbnail final.',
            ],
            output: 'Todos os assets de mídia finalizados: videoclipe montado, imagens de moodboard e thumbnail promocional.'
        },
    ];

    const flow = "🎵 Música → [SUPER PROMPT: DIRETOR MESTRE] → 📝 Blueprint JSON → [UNIDADE DE PRODUÇÃO] → 🚀 Vídeo Final";

    return (
        <div className="bg-[#131314] p-6 rounded-lg h-full overflow-y-auto text-white/90 font-sans">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-extrabold mb-2 text-primary tracking-tight">🎛️ Pipeline Reimaginada: O Diretor Mestre</h1>
                <p className="max-w-3xl mx-auto text-white/70">
                    A arquitetura foi evoluída. Em vez de uma cadeia de agentes, agora um único e poderoso **Agente Diretor Mestre** orquestra toda a visão criativa, entregando um blueprint completo para uma **Unidade de Produção** automatizada. Mais coesão, mais poder, menos erros.
                </p>
            </header>

            <div className="space-y-8">
                {stages.map((stage, index) => (
                    <div key={index} className="bg-panel p-6 rounded-lg border border-border flex flex-col md:flex-row items-start gap-6">
                        <div className="flex-shrink-0">{stage.icon}</div>
                        <div className="flex-grow">
                            <h2 className="text-xl font-bold mb-2">{stage.title}</h2>
                            <p className="text-sm text-white/70 mb-4">{stage.description}</p>
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-white/80">Tarefas Internas:</h3>
                                <ul className="space-y-2 list-inside list-disc text-sm text-white/80 marker:text-primary">
                                    {stage.subtasks.map((task, i) => <li key={i}>{task}</li>)}
                                </ul>
                            </div>
                            <div className="mt-4 bg-black/30 p-3 rounded-md">
                                <p className="text-xs font-semibold text-white/60 mb-1">SAÍDA DESTA ETAPA:</p>
                                <p className="text-sm font-medium text-accent">{stage.output}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="my-12">
                <h2 className="text-xl font-bold text-center mb-4">⚙️ Novo Fluxo Visual</h2>
                <div className="bg-panel p-4 rounded-lg border border-border text-center overflow-x-auto">
                    <code className="text-sm text-accent whitespace-nowrap">{flow}</code>
                </div>
            </div>

             <div className="text-center">
                <h2 className="text-xl font-bold mb-4">Análise Estrutural</h2>
                 <div className="max-w-3xl mx-auto text-left space-y-4 text-sm text-white/80">
                    <p>A arquitetura anterior, com 9 agentes em série, era modular mas suscetível a erros de "telefone quebrado", onde o contexto era perdido ou mal interpretado entre as etapas. A manutenção do estado (como o GSM) entre chamadas de API independentes era complexa e frágil.</p>
                    <p>A nova pipeline de "Super Prompt" resolve isso ao consolidar toda a lógica criativa numa única chamada a um modelo mais poderoso (como o Gemini 2.5 Pro). O modelo mantém um contexto unificado, permitindo-lhe tomar decisões mais holísticas e criativas. A validação de física e a aplicação de contexto cultural, por exemplo, agora acontecem durante a criação do roteiro, e não como uma etapa de correção posterior, resultando em prompts de cena fundamentalmente mais coesos e lógicos.</p>
                     <p className="font-bold text-white/90">Esta mudança representa uma transição de uma <span className="text-primary">linha de montagem de especialistas</span> para um <span className="text-accent">único diretor de génio</span> que delega apenas a execução mecânica.</p>
                </div>
            </div>
        </div>
    );
};

export default IntelligentPipeline;
