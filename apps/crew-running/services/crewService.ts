import { GoogleGenAI, Modality, Part } from '@google/genai';
import { WARDROBE, SlotKey, WardrobeItem } from '../data/wardrobe';
import { CharacterStyle } from '../data/styles';

export type PhotoInput = { base64: string; mimeType: string };

export type SlotSelection = Partial<Record<SlotKey, string>>;

export type GenerateInput = {
  apiKey: string;
  photo: PhotoInput;
  style: CharacterStyle;
  locked: SlotSelection;
};

export type SheetVariant = {
  index: 0 | 1 | 2 | 3;
  slots: Record<SlotKey, WardrobeItem>;
};

export type GenerateResult = {
  imageDataUrl: string;
  variants: SheetVariant[];
};

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const buildVariants = (locked: SlotSelection): SheetVariant[] => {
  const slots: SlotKey[] = ['hair', 'top', 'bottom', 'shoes'];
  const variants: SheetVariant[] = [];
  for (let i = 0; i < 4; i++) {
    const v: Partial<Record<SlotKey, WardrobeItem>> = {};
    for (const slot of slots) {
      const lockedId = locked[slot];
      const item = lockedId
        ? WARDROBE[slot].find((it) => it.id === lockedId) ?? pickRandom(WARDROBE[slot])
        : pickRandom(WARDROBE[slot]);
      v[slot] = item;
    }
    variants.push({ index: i as 0 | 1 | 2 | 3, slots: v as Record<SlotKey, WardrobeItem> });
  }
  return variants;
};

const describeVariant = (cell: string, v: SheetVariant): string =>
  `${cell}: ${v.slots.hair.prompt}; wearing ${v.slots.top.prompt}, ${v.slots.bottom.prompt}, and ${v.slots.shoes.prompt}.`;

const buildPrompt = (style: CharacterStyle, variants: SheetVariant[]): string => {
  const cells = [
    describeVariant('TOP-LEFT cell', variants[0]),
    describeVariant('TOP-RIGHT cell', variants[1]),
    describeVariant('BOTTOM-LEFT cell', variants[2]),
    describeVariant('BOTTOM-RIGHT cell', variants[3]),
  ].join('\n');

  return [
    'Using the attached reference photo as identity (preserve face shape, skin tone, ethnicity and approximate age),',
    'generate ONE square 1024x1024 image laid out as a clean 2x2 character sheet with a thin dark divider between cells.',
    `Each cell shows the SAME person stylized as: ${style.promptStyle}.`,
    'The four cells show DIFFERENT outfits:',
    cells,
    'Full-body framing in every cell, character centered, consistent art style across all four cells.',
    'Do not include any text, labels, watermarks, UI elements or borders other than the 2x2 divider.',
    'No realistic photography, no 3D render — illustrated only.',
  ].join('\n');
};

export const generateCharacterSheet = async (input: GenerateInput): Promise<GenerateResult> => {
  if (!input.apiKey) throw new Error('Cole sua Gemini API key primeiro.');

  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const variants = buildVariants(input.locked);
  const prompt = buildPrompt(input.style, variants);

  const parts: Part[] = [
    { inlineData: { data: input.photo.base64, mimeType: input.photo.mimeType } },
    { text: prompt },
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { responseModalities: [Modality.IMAGE] },
  });

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    if (part.inlineData) {
      const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      return { imageDataUrl: url, variants };
    }
  }
  throw new Error('A API não retornou nenhuma imagem.');
};
