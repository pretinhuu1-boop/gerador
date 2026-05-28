export type RunnerTypeId =
  | 'sprint'
  | 'long-run'
  | 'night-run'
  | 'crew-pace'
  | 'urban-trail';

export type RunnerType = {
  id: RunnerTypeId;
  label: string;
  description: string;
  promptNote: string;
};

export const RUNNER_TYPES: RunnerType[] = [
  {
    id: 'sprint',
    label: 'Sprint',
    description: 'explosao curta',
    promptNote: 'short-distance sprint runner profile',
  },
  {
    id: 'long-run',
    label: 'Long Run',
    description: 'ritmo longo',
    promptNote: 'long-distance steady runner profile',
  },
  {
    id: 'night-run',
    label: 'Night Run',
    description: 'rota noturna',
    promptNote: 'night-route runner profile',
  },
  {
    id: 'crew-pace',
    label: 'Crew Pace',
    description: 'ritmo da crew',
    promptNote: 'shared crew pace runner profile',
  },
  {
    id: 'urban-trail',
    label: 'Urban Trail',
    description: 'asfalto bruto',
    promptNote: 'urban-trail runner profile',
  },
];

export const DEFAULT_RUNNER_TYPE = RUNNER_TYPES[0];

export const getRunnerTypeById = (id?: string): RunnerType => {
  return RUNNER_TYPES.find((type) => type.id === id) ?? DEFAULT_RUNNER_TYPE;
};
