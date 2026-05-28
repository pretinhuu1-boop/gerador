import { GoogleGenAI, Modality, Part } from '@google/genai';
import {
  BODY_REFERENCE,
  RunnerProfile,
  getSexLabel,
  getSexPrompt,
  normalizeRunnerProfile,
} from '../data/runnerProfile';
import {
  CrewRenderContext,
  assertCrewRenderAssetPath,
} from '../data/crewRenderContext';
import { RunnerType } from '../data/runnerTypes';
import { SLOT_KEYS, WARDROBE, SlotKey, WardrobeItem } from '../data/wardrobe';

export type PhotoInput = { base64: string; mimeType: string };

export type SlotSelection = Partial<Record<SlotKey, string>>;

export type GenerateInput = {
  apiKey: string;
  photo: PhotoInput;
  profile: RunnerProfile;
  runnerType: RunnerType;
  crewContext: CrewRenderContext;
  locked: SlotSelection;
};

export type DemoGenerateInput = Omit<GenerateInput, 'apiKey'>;

export type SheetVariant = {
  index: 0 | 1 | 2 | 3;
  slots: Record<SlotKey, WardrobeItem>;
};

export type GenerateResult = {
  imageDataUrl: string;
  variants: SheetVariant[];
};

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const shuffle = <T,>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const buildVariants = (locked: SlotSelection): SheetVariant[] => {
  const randomItems: Record<SlotKey, WardrobeItem[]> = {
    top: shuffle(WARDROBE.top),
    bottom: shuffle(WARDROBE.bottom),
    shoes: shuffle(WARDROBE.shoes),
    accessory: shuffle(WARDROBE.accessory),
  };
  const variants: SheetVariant[] = [];
  for (let i = 0; i < 4; i++) {
    const v: Partial<Record<SlotKey, WardrobeItem>> = {};
    for (const slot of SLOT_KEYS) {
      const lockedId = locked[slot];
      const item = lockedId
        ? WARDROBE[slot].find((it) => it.id === lockedId) ?? pickRandom(WARDROBE[slot])
        : randomItems[slot][i % randomItems[slot].length];
      v[slot] = item;
    }
    variants.push({ index: i as 0 | 1 | 2 | 3, slots: v as Record<SlotKey, WardrobeItem> });
  }
  return variants;
};

const describeVariant = (cell: string, v: SheetVariant): string =>
  `${cell}: wearing ${v.slots.top.prompt}, ${v.slots.bottom.prompt}, ${v.slots.shoes.prompt}, and ${v.slots.accessory.prompt}.`;

const describeBodyScale = (profile: RunnerProfile): string => {
  const heightDelta = profile.heightCm - BODY_REFERENCE.heightCm;
  const weightDelta = profile.weightKg - BODY_REFERENCE.weightKg;
  const heightDirection =
    heightDelta > 8 ? 'noticeably taller than the reference body' :
      heightDelta < -8 ? 'noticeably shorter than the reference body' :
        'close to the reference height';
  const weightDirection =
    weightDelta > 10 ? 'heavier and broader than the reference body' :
      weightDelta < -10 ? 'lighter and leaner than the reference body' :
        'close to the reference weight';

  return `${profile.heightCm} cm and ${profile.weightKg} kg, ${heightDirection}, ${weightDirection}.`;
};

const buildPrompt = (
  crewContext: CrewRenderContext,
  runnerType: RunnerType,
  variants: SheetVariant[],
  runnerProfile: RunnerProfile,
): string => {
  const profile = normalizeRunnerProfile(runnerProfile);
  const runnerName = profile.name || 'Runner';
  const personality = profile.personality || 'focused, friendly and street-smart';
  const cells = [
    describeVariant('TOP-LEFT cell', variants[0]),
    describeVariant('TOP-RIGHT cell', variants[1]),
    describeVariant('BOTTOM-LEFT cell', variants[2]),
    describeVariant('BOTTOM-RIGHT cell', variants[3]),
  ].join('\n');
  return [
    'Use the attached face photo only as a broad physical-characteristics reference.',
    'Do NOT copy or preserve the exact face, identity, hair shape, hair color, facial marks, expression, clothing, or any recognizable person-specific details from the photo.',
    'Infer only general physical traits such as approximate age range, skin tone range, body build, posture and proportions, then create an original fictional runner character.',
    `Runner profile: name "${runnerName}" (do not render the name as text), sex/presentation ${getSexLabel(profile.sex)} / ${getSexPrompt(profile.sex)}, personality: ${personality}.`,
    `Runner type: ${runnerType.label} / ${runnerType.promptNote}. Treat this as profile metadata only; do not create a separate art style from it.`,
    `Height and weight reference: baseline character sheet is ${BODY_REFERENCE.heightCm} cm / ${BODY_REFERENCE.weightKg} kg. This runner is ${describeBodyScale(profile)} Adjust full-body proportions accordingly without caricature.`,
    'generate ONE square 1024x1024 image laid out as a clean 2x2 character sheet with a thin dark divider between cells.',
    'Render style is fixed: street-v2, mature hand-drawn street-running comic, bold black ink shadows, screen-print grit on the character only, tactile athletic clothing, no 3D, no photorealism.',
    `The selected crew is the only style and street-context influence: ${crewContext.name} (${crewContext.zone}), mission "${crewContext.mission}".`,
    `Use only the attached ${crewContext.name} crew reference assets from ${crewContext.basePath}/ to derive accent colors, patch language and street-running mood. Never borrow or invent assets from another crew.`,
    `Crew palette lock: primary ${crewContext.accent}, secondary ${crewContext.secondary}.`,
    'Apply the fixed street-v2 style only to the runner, clothing, linework and color treatment; ignore any idea that would add background marks, graphic splashes or a scene.',
    'The four cells show DIFFERENT outfits:',
    cells,
    'Create one fixed fictional head and one fixed hair shape for the runner, based on the face photo, profile fields and selected crew street-v2 direction, not copied from a real person.',
    'The same fictional runner must stay consistent across all four cells: same head, same hair shape, same hair color, same face design, same approximate skin tone range, same age range, same sex presentation, same height, same weight, same body build and same proportions.',
    'Only top, bottom, shoes and accessory may change between cells; do not change the runner into a different person.',
    'Full-body neutral standing reference pose in every cell, feet aligned to a consistent baseline, character centered, consistent body proportions and art style across all four cells.',
    'Background rule overrides the style: use a flat, neutral, matte light-gray studio background in every cell, no city scene, no graffiti, no texture, no props, no measurement marks, no colored marks behind the character, no graphic splashes, no shadows.',
    'Do not include any text, labels, watermarks, UI elements or borders other than the 2x2 divider.',
    'No realistic photography, no 3D render - illustrated only.',
  ].filter(Boolean).join('\n');
};

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

const topColorById: Record<string, string> = {
  top_hoodie_graf: '#24223a',
  top_tank_black: '#101010',
  top_hoodie_red: '#c6312b',
  top_jersey_teal: '#22aaa1',
};

const bottomColorById: Record<string, string> = {
  bot_shorts_maroon: '#6e223b',
  bot_leggings_blk: '#111111',
  bot_jogger_grey: '#6c7178',
  bot_shorts_teal: '#229c9c',
};

const shoeColorById: Record<string, string> = {
  sho_runners_teal: '#25b8aa',
  sho_sneak_red: '#cf342d',
  sho_sneak_white: '#f2eee4',
  sho_runners_blk: '#111111',
};

const accessoryColorById: Record<string, string> = {
  acc_reflective_armband: '#d7f35a',
  acc_hydration_belt: '#2ec4b6',
  acc_crossbody_pack: '#1b1b1b',
  acc_blank_bib: '#f3eee0',
};

const getCrewPalette = (crewContext: CrewRenderContext) => ({
  primary: crewContext.accent,
  secondary: crewContext.secondary,
  ink: '#101010',
});

type DemoIdentityTraits = {
  hairColor: string;
  hairShape: 'short' | 'curly' | 'long' | 'shaved' | 'cap';
  skinColor: string;
};

const resolveDemoIdentityTraits = (profile: RunnerProfile): DemoIdentityTraits => {
  const defaultSkin = profile.sex === 'female' ? '#9f6748' : profile.sex === 'male' ? '#8b5d43' : '#94624a';
  const hairColor = profile.sex === 'female' ? '#201915' : profile.sex === 'male' ? '#2b1f1a' : '#36251e';
  const hairShape: DemoIdentityTraits['hairShape'] =
    profile.sex === 'female' ? 'curly' : profile.sex === 'male' ? 'short' : 'shaved';

  return { hairColor, hairShape, skinColor: defaultSkin };
};

const drawRunnerFigure = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  variant: SheetVariant,
  profile: RunnerProfile,
  palette: { primary: string; secondary: string; ink: string },
  identity: DemoIdentityTraits,
) => {
  const heightDelta = Math.max(-24, Math.min(24, profile.heightCm - BODY_REFERENCE.heightCm));
  const weightDelta = Math.max(-26, Math.min(30, profile.weightKg - BODY_REFERENCE.weightKg));
  const figureHeight = 326 + heightDelta * 1.35;
  const shoulder = 70 + weightDelta * 0.7;
  const hip = 52 + weightDelta * 0.45;
  const centerX = x + cellSize / 2;
  const baseY = y + cellSize * 0.84;
  const headRadius = 31 + weightDelta * 0.06;
  const headY = baseY - figureHeight + headRadius + 18;
  const neckY = headY + headRadius + 8;
  const torsoTopY = neckY + 8;
  const torsoBottomY = torsoTopY + figureHeight * 0.31;
  const kneeY = torsoBottomY + figureHeight * 0.24;
  const skin = identity.skinColor;
  const fixedHeadDetailColor = identity.hairColor;
  const topColor = topColorById[variant.slots.top.id] ?? palette.primary;
  const bottomColor = bottomColorById[variant.slots.bottom.id] ?? palette.ink;
  const shoeColor = shoeColorById[variant.slots.shoes.id] ?? palette.secondary;
  const accessoryColor = accessoryColorById[variant.slots.accessory.id] ?? palette.secondary;

  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.shadowColor = 'rgba(0, 0, 0, 0.2)';
  context.shadowBlur = 0;
  context.shadowOffsetX = 7;
  context.shadowOffsetY = 7;

  context.strokeStyle = palette.ink;
  context.lineWidth = 18;
  context.beginPath();
  context.moveTo(centerX - shoulder * 0.56, torsoTopY + 18);
  context.lineTo(centerX - shoulder * 0.95, torsoBottomY - 8);
  context.moveTo(centerX + shoulder * 0.56, torsoTopY + 18);
  context.lineTo(centerX + shoulder * 0.95, torsoBottomY - 8);
  context.stroke();

  context.strokeStyle = skin;
  context.lineWidth = 12;
  context.beginPath();
  context.moveTo(centerX - shoulder * 0.56, torsoTopY + 18);
  context.lineTo(centerX - shoulder * 0.95, torsoBottomY - 8);
  context.moveTo(centerX + shoulder * 0.56, torsoTopY + 18);
  context.lineTo(centerX + shoulder * 0.95, torsoBottomY - 8);
  context.stroke();

  context.shadowColor = 'transparent';
  context.strokeStyle = palette.ink;
  context.lineWidth = 16;
  context.beginPath();
  context.moveTo(centerX - hip * 0.34, torsoBottomY - 2);
  context.lineTo(centerX - hip * 0.46, kneeY);
  context.lineTo(centerX - hip * 0.58, baseY - 24);
  context.moveTo(centerX + hip * 0.34, torsoBottomY - 2);
  context.lineTo(centerX + hip * 0.46, kneeY);
  context.lineTo(centerX + hip * 0.58, baseY - 24);
  context.stroke();

  context.strokeStyle = bottomColor;
  context.lineWidth = variant.slots.bottom.id === 'bot_leggings_blk' ? 12 : 18;
  context.beginPath();
  context.moveTo(centerX - hip * 0.34, torsoBottomY + 2);
  context.lineTo(centerX - hip * 0.46, kneeY);
  context.lineTo(centerX - hip * 0.58, baseY - 24);
  context.moveTo(centerX + hip * 0.34, torsoBottomY + 2);
  context.lineTo(centerX + hip * 0.46, kneeY);
  context.lineTo(centerX + hip * 0.58, baseY - 24);
  context.stroke();

  context.fillStyle = topColor;
  context.strokeStyle = palette.ink;
  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(centerX - shoulder * 0.54, torsoTopY);
  context.lineTo(centerX + shoulder * 0.54, torsoTopY);
  context.lineTo(centerX + hip * 0.54, torsoBottomY);
  context.lineTo(centerX - hip * 0.54, torsoBottomY);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = palette.secondary;
  context.globalAlpha = 0.75;
  drawRoundedRect(context, centerX - 28, torsoTopY + 42, 56, 16, 7);
  context.fill();
  context.globalAlpha = 1;

  if (variant.slots.accessory.id === 'acc_crossbody_pack') {
    context.strokeStyle = accessoryColor;
    context.lineWidth = 9;
    context.beginPath();
    context.moveTo(centerX - shoulder * 0.42, torsoTopY + 18);
    context.lineTo(centerX + hip * 0.4, torsoBottomY - 12);
    context.stroke();
    context.fillStyle = accessoryColor;
    context.strokeStyle = palette.ink;
    context.lineWidth = 5;
    drawRoundedRect(context, centerX + hip * 0.1, torsoBottomY - 36, 48, 34, 10);
    context.fill();
    context.stroke();
  } else if (variant.slots.accessory.id === 'acc_blank_bib') {
    context.fillStyle = accessoryColor;
    context.strokeStyle = palette.ink;
    context.lineWidth = 4;
    drawRoundedRect(context, centerX - 24, torsoTopY + 50, 48, 36, 4);
    context.fill();
    context.stroke();
  }

  context.fillStyle = bottomColor;
  context.strokeStyle = palette.ink;
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(centerX - hip * 0.58, torsoBottomY - 6);
  context.lineTo(centerX + hip * 0.58, torsoBottomY - 6);
  context.lineTo(centerX + hip * 0.52, torsoBottomY + 58);
  context.lineTo(centerX + 10, torsoBottomY + 45);
  context.lineTo(centerX - hip * 0.52, torsoBottomY + 58);
  context.closePath();
  context.fill();
  context.stroke();

  context.fillStyle = shoeColor;
  context.strokeStyle = palette.ink;
  context.lineWidth = 6;
  drawRoundedRect(context, centerX - hip * 0.78, baseY - 18, 62, 24, 10);
  context.fill();
  context.stroke();
  drawRoundedRect(context, centerX + hip * 0.22, baseY - 18, 62, 24, 10);
  context.fill();
  context.stroke();

  if (variant.slots.accessory.id === 'acc_hydration_belt') {
    context.strokeStyle = accessoryColor;
    context.lineWidth = 9;
    context.beginPath();
    context.moveTo(centerX - hip * 0.56, torsoBottomY + 5);
    context.lineTo(centerX + hip * 0.56, torsoBottomY + 5);
    context.stroke();
    context.fillStyle = palette.secondary;
    drawRoundedRect(context, centerX + hip * 0.2, torsoBottomY - 4, 20, 25, 7);
    context.fill();
  } else if (variant.slots.accessory.id === 'acc_reflective_armband') {
    context.strokeStyle = accessoryColor;
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(centerX - shoulder * 0.79, torsoTopY + 48);
    context.lineTo(centerX - shoulder * 0.9, torsoTopY + 69);
    context.stroke();
  }

  context.fillStyle = skin;
  context.strokeStyle = palette.ink;
  context.lineWidth = 7;
  context.beginPath();
  context.arc(centerX, headY, headRadius, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  context.fillStyle = fixedHeadDetailColor;
  context.strokeStyle = palette.ink;
  context.lineWidth = 6;
  if (identity.hairShape === 'long') {
    context.beginPath();
    context.ellipse(centerX, headY - headRadius * 0.38, headRadius * 0.95, 24, 0, Math.PI, Math.PI * 2);
    context.fill();
    context.stroke();
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(centerX - headRadius * 0.72, headY - 4);
    context.lineTo(centerX - headRadius * 0.9, headY + headRadius * 0.75);
    context.moveTo(centerX + headRadius * 0.72, headY - 4);
    context.lineTo(centerX + headRadius * 0.9, headY + headRadius * 0.75);
    context.stroke();
  } else if (identity.hairShape === 'curly') {
    for (let i = 0; i < 6; i += 1) {
      const offset = (i - 2.5) * headRadius * 0.34;
      context.beginPath();
      context.arc(centerX + offset, headY - headRadius * 0.58, 10, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }
  } else if (identity.hairShape === 'shaved') {
    context.lineWidth = 5;
    context.beginPath();
    context.ellipse(centerX, headY - headRadius * 0.58, headRadius * 0.78, 11, 0, Math.PI, Math.PI * 2);
    context.fill();
    context.stroke();
  } else if (identity.hairShape === 'cap') {
    context.fillStyle = palette.primary;
    context.beginPath();
    context.ellipse(centerX, headY - headRadius * 0.48, headRadius * 0.9, 18, 0, Math.PI, Math.PI * 2);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(centerX + headRadius * 0.38, headY - headRadius * 0.5);
    context.lineTo(centerX + headRadius * 1.18, headY - headRadius * 0.42);
    context.stroke();
  } else {
    context.beginPath();
    context.ellipse(centerX, headY - headRadius * 0.52, headRadius * 0.88, 19, 0, Math.PI, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  context.strokeStyle = palette.ink;
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(centerX - 12, headY + 8);
  context.lineTo(centerX + 12, headY + 8);
  context.stroke();

  context.restore();
};

const drawDemoCell = (
  context: CanvasRenderingContext2D,
  cellX: number,
  cellY: number,
  cellSize: number,
  variant: SheetVariant,
  profile: RunnerProfile,
  crewContext: CrewRenderContext,
  identity: DemoIdentityTraits,
) => {
  const palette = getCrewPalette(crewContext);
  context.save();
  context.fillStyle = '#d8d7cf';
  context.fillRect(cellX, cellY, cellSize, cellSize);

  drawRunnerFigure(context, cellX, cellY, cellSize, variant, profile, palette, identity);
  context.restore();
};

export const generateDemoCharacterSheet = async (input: DemoGenerateInput): Promise<GenerateResult> => {
  const variants = buildVariants(input.locked);
  const profile = normalizeRunnerProfile(input.profile);
  const identity = resolveDemoIdentityTraits(profile);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('O teste local não conseguiu abrir o canvas.');

  const size = 1024;
  const cellSize = size / 2;

  canvas.width = size;
  canvas.height = size;
  context.fillStyle = '#111111';
  context.fillRect(0, 0, size, size);

  variants.forEach((variant) => {
    const column = variant.index % 2;
    const row = Math.floor(variant.index / 2);
    drawDemoCell(
      context,
      column * cellSize,
      row * cellSize,
      cellSize,
      variant,
      profile,
      input.crewContext,
      identity,
    );
  });

  context.fillStyle = '#151515';
  context.fillRect(cellSize - 4, 0, 8, size);
  context.fillRect(0, cellSize - 4, size, 8);

  return {
    imageDataUrl: canvas.toDataURL('image/png'),
    variants,
  };
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return window.btoa(binary);
};

const loadCrewReferenceParts = async (context: CrewRenderContext): Promise<Part[]> => {
  const parts: Part[] = [];

  for (const asset of context.referenceAssets) {
    assertCrewRenderAssetPath(context, asset.path);
    const response = await fetch(asset.path);

    if (!response.ok) {
      throw new Error(`Não foi possível carregar asset da crew: ${asset.label}.`);
    }

    const blob = await response.blob();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    parts.push({ text: `Selected crew reference asset: ${asset.label} (${asset.path})` });
    parts.push({
      inlineData: {
        data: bytesToBase64(bytes),
        mimeType: blob.type || 'image/png',
      },
    });
  }

  return parts;
};

export const generateCharacterSheet = async (input: GenerateInput): Promise<GenerateResult> => {
  if (!input.apiKey) throw new Error('Credencial local do estúdio não encontrada.');
  if (!input.photo) {
    throw new Error('Envie uma foto do rosto do runner.');
  }

  const ai = new GoogleGenAI({ apiKey: input.apiKey });
  const variants = buildVariants(input.locked);
  const prompt = buildPrompt(
    input.crewContext,
    input.runnerType,
    variants,
    input.profile,
  );
  const crewReferenceParts = await loadCrewReferenceParts(input.crewContext);

  const parts: Part[] = [
    { inlineData: { data: input.photo.base64, mimeType: input.photo.mimeType } },
    { text: `Selected crew render context is locked to ${input.crewContext.basePath}/.` },
    ...crewReferenceParts,
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
  throw new Error('O estúdio não retornou imagem para o runner.');
};
