// data/vibe_presets.ts
import { VibePreset } from '../types';

export const vibePresets: VibePreset[] = [
    {
        id: 'funk_ostentacao_noite',
        name: 'Funk Ostentação (Noite)',
        description: 'Luxo, carros, joias e a energia da noite paulistana. Estilo cinematográfico com neon e alto contraste.',
        settings: {
            culturalContext: 'PCC-02',
            narrativeTemplateId: 'default',
            noFaceLockMode: 'default'
        }
    },
    {
        id: 'funk_consciente_raiz',
        name: 'Funk Consciente (Raiz)',
        description: 'Retrato da realidade da comunidade, com foco em superação e gratidão. Estilo documental ao pôr do sol.',
        settings: {
            culturalContext: 'PCC-12',
            narrativeTemplateId: 'jornada_da_luz',
            noFaceLockMode: 'anonymous'
        }
    },
    {
        id: 'trap_hype_agressivo',
        name: 'Trap Hype (Agressivo)',
        description: 'A energia crua do drill e do trap. Ruas escuras, alta velocidade e uma atitude desafiadora.',
        settings: {
            culturalContext: 'PCC-06',
            narrativeTemplateId: 'default',
            noFaceLockMode: 'anonymous'
        }
    },
    {
        id: 'pagode_resenha_solar',
        name: 'Pagode (Resenha Solar)',
        description: 'A alegria contagiante de uma roda de samba no quintal. Amizade, romance e o calor do pôr do sol.',
        settings: {
            culturalContext: 'PCC-10',
            narrativeTemplateId: 'default',
            noFaceLockMode: 'default'
        }
    },
    {
        id: 'gospel_adoracao_epico',
        name: 'Gospel Adoração (Épico)',
        description: 'Cenas de fé e esperança em cenários grandiosos. Natureza, luz divina e uma atmosfera de paz.',
        settings: {
            culturalContext: 'PCC-15',
            narrativeTemplateId: 'jornada_da_luz',
            noFaceLockMode: 'default'
        }
    },
     {
        id: 'objeto_heroi_moto',
        name: 'Objeto-Herói (Moto)',
        description: 'A moto é a estrela. Cenas de ação e detalhes mecânicos com uma estética de "bad boy" anônimo.',
        settings: {
            culturalContext: 'PCC-01',
            narrativeTemplateId: 'default',
            noFaceLockMode: 'object_hero'
        }
    }
];