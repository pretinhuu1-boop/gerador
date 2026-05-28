export type RunnerSex = 'female' | 'male' | 'non_binary';

export type RunnerProfile = {
  name: string;
  sex: RunnerSex;
  heightCm: number;
  weightKg: number;
  personality: string;
};

export const BODY_REFERENCE = {
  heightCm: 170,
  weightKg: 70,
} as const;

export const DEFAULT_RUNNER_PROFILE: RunnerProfile = {
  name: '',
  sex: 'female',
  heightCm: BODY_REFERENCE.heightCm,
  weightKg: BODY_REFERENCE.weightKg,
  personality: '',
};

export const RUNNER_SEX_OPTIONS: Array<{ label: string; value: RunnerSex; prompt: string }> = [
  { label: 'Feminino', value: 'female', prompt: 'female runner body presentation' },
  { label: 'Masculino', value: 'male', prompt: 'male runner body presentation' },
  { label: 'Nao-binario', value: 'non_binary', prompt: 'androgynous non-binary runner body presentation' },
];

export const getSexPrompt = (sex: RunnerSex): string =>
  RUNNER_SEX_OPTIONS.find((option) => option.value === sex)?.prompt ?? RUNNER_SEX_OPTIONS[0].prompt;

export const getSexLabel = (sex: RunnerSex): string =>
  RUNNER_SEX_OPTIONS.find((option) => option.value === sex)?.label ?? RUNNER_SEX_OPTIONS[0].label;

const CONTROL_CHARS = new RegExp('[\\u0000-\\u001F\\u007F]', 'g');
const PROMPT_BREAKERS = /["`\\]/g;
const WHITESPACE_RUN = /\s+/g;

// Split by code points (not code units) so ZWJ emoji sequences like
// 👨‍👩‍👧 don't break apart at the maxLength boundary.
const truncateGraphemes = (value: string, max: number): string => {
  const chars = Array.from(value);
  return chars.length <= max ? value : chars.slice(0, max).join('');
};

export const sanitizePromptInput = (value: string, maxLength: number): string => {
  const cleaned = value
    .replace(CONTROL_CHARS, ' ')
    .replace(PROMPT_BREAKERS, '')
    .replace(WHITESPACE_RUN, ' ')
    .trim();
  return truncateGraphemes(cleaned, maxLength);
};

export const normalizeRunnerProfile = (profile: RunnerProfile): RunnerProfile => ({
  name: sanitizePromptInput(profile.name, 40),
  sex: profile.sex,
  heightCm: Math.min(230, Math.max(120, Math.round(profile.heightCm || BODY_REFERENCE.heightCm))),
  weightKg: Math.min(220, Math.max(35, Math.round(profile.weightKg || BODY_REFERENCE.weightKg))),
  personality: sanitizePromptInput(profile.personality, 120),
});
