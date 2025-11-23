// services/dnaEngine.ts
import { Emotion, CreativeDNA } from '../types';

interface DnaData {
    flyer_dna_engine: {
        modules: {
            emotion_matrix: {
                levels: Emotion[];
                mapping: Record<Emotion, string>;
            };
        };
        presets: Record<string, {
            style: string;
            palette: string[];
            texture: string;
            emotion: string;
            lighting: string;
        }>;
    }
}

let dnaDataCache: DnaData | null = null;

const loadDnaData = async (): Promise<DnaData> => {
    if (dnaDataCache) {
        return dnaDataCache;
    }
    try {
        const response = await fetch('./flyer_dna_engine.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        dnaDataCache = data;
        return data;
    } catch (error) {
        console.error("Could not load flyer_dna_engine.json", error);
        throw new Error("Failed to load DNA data.");
    }
};


export const getArtistPresets = async (): Promise<string[]> => {
    const data = await loadDnaData();
    return Object.keys(data.flyer_dna_engine.presets);
};

export const getEmotionMatrix = async (): Promise<Emotion[]> => {
    const data = await loadDnaData();
    return data.flyer_dna_engine.modules.emotion_matrix.levels;
};

export const getCreativeDNA = async (artistName: string, emotion: Emotion): Promise<CreativeDNA> => {
    const data = await loadDnaData();
    const presets = data.flyer_dna_engine.presets;

    const artistPreset = presets[artistName] || Object.values(presets)[0]; // Fallback to first preset

    if (!artistPreset) {
        throw new Error(`Preset for artist "${artistName}" not found.`);
    }

    // Generate keywords from the DNA profile for contextual analysis
    const combinedStrings = [artistPreset.style, artistPreset.emotion, artistPreset.texture, emotion].join(' ').toLowerCase();
    const keywords = Array.from(new Set(combinedStrings.match(/\b(\w+)\b/g) || []));


    return {
        ...artistPreset,
        emotion: emotion, // Override preset emotion with user's choice
        keywords: keywords,
    };
};