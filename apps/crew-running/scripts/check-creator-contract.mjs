#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const repoRoot = join(appRoot, '..', '..');
const expectedRunnerTypeIds = ['sprint', 'long-run', 'night-run', 'crew-pace', 'urban-trail'];
const expectedRunnerTypeLabels = ['Sprint', 'Long Run', 'Night Run', 'Crew Pace', 'Urban Trail'];
const errors = [];

const read = (path) => readFileSync(join(appRoot, path), 'utf8');
const fail = (message) => errors.push(message);
const assertIncludes = (text, value, path) => {
  if (!text.includes(value)) fail(`${path} must include ${value}`);
};
const assertNotIncludes = (text, value, path) => {
  if (text.includes(value)) fail(`${path} must not include ${value}`);
};

const walkFiles = (dir, extensions = new Set(['.ts', '.tsx'])) => {
  const root = join(appRoot, dir);
  const files = [];

  const walk = (current) => {
    for (const entry of readdirSync(current)) {
      const fullPath = join(current, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (entry === 'node_modules' || entry === 'dist' || entry === 'output') continue;
        walk(fullPath);
        continue;
      }

      const extension = entry.slice(entry.lastIndexOf('.'));
      if (extensions.has(extension)) files.push(relative(appRoot, fullPath));
    }
  };

  walk(root);
  return files;
};

const runnerTypesPath = 'data/runnerTypes.ts';
const runnerTypes = read(runnerTypesPath);
const actualIds = [...runnerTypes.matchAll(/id:\s*'([^']+)'/g)].map((match) => match[1]);

if (JSON.stringify(actualIds) !== JSON.stringify(expectedRunnerTypeIds)) {
  fail(`${runnerTypesPath} ids must be exactly ${expectedRunnerTypeIds.join(', ')}`);
}

for (const id of expectedRunnerTypeIds) {
  assertIncludes(runnerTypes, `| '${id}'`, runnerTypesPath);
  assertIncludes(runnerTypes, `id: '${id}'`, runnerTypesPath);
}
for (const label of expectedRunnerTypeLabels) {
  assertIncludes(runnerTypes, `label: '${label}'`, runnerTypesPath);
}
for (const forbidden of ['Crew Flow', 'crew-flow', 'group-pace']) {
  assertNotIncludes(runnerTypes, forbidden, runnerTypesPath);
}

const wardrobePath = 'data/wardrobe.ts';
const wardrobe = read(wardrobePath);
assertIncludes(wardrobe, "export type SlotKey = 'top' | 'bottom' | 'shoes' | 'accessory'", wardrobePath);
assertIncludes(wardrobe, "export const SLOT_KEYS: SlotKey[] = ['top', 'bottom', 'shoes', 'accessory']", wardrobePath);
for (const forbidden of ["'hair'", 'hair:', 'wardrobe/hair', 'Hairstyle']) {
  assertNotIncludes(wardrobe, forbidden, wardrobePath);
}

for (const path of [
  'components/CustomizeScreen.tsx',
  'components/RunnerTypePicker.tsx',
  'data/crewRenderContext.ts',
  'scripts/smoke-creator.mjs',
  'vault/CREATOR_CONTRACT.md',
]) {
  if (!existsSync(join(appRoot, path))) fail(`${path} must exist`);
}
for (const removedFile of ['components/StylePicker.tsx', 'data/styles.ts']) {
  if (existsSync(join(appRoot, removedFile))) fail(`${removedFile} must not exist`);
}

for (const path of ['App.tsx', ...walkFiles('components'), ...walkFiles('data'), ...walkFiles('services')]) {
  const source = read(path);
  for (const term of [
    'StylePicker',
    'CharacterStyle',
    'WARDROBE.hair',
    'slots.hair',
    "from '../data/styles'",
    "from './data/styles'",
    '/styles/',
    'public/styles',
    'group-pace',
    'crew-flow',
  ]) {
    assertNotIncludes(source, term, path);
  }
}

const customize = read('components/CustomizeScreen.tsx');
assertIncludes(customize, 'selectedCrewSlug: string', 'components/CustomizeScreen.tsx');
assertIncludes(customize, 'buildCrewRenderContext(selectedCrewSlug)', 'components/CustomizeScreen.tsx');
assertIncludes(customize, '<RunnerTypePicker', 'components/CustomizeScreen.tsx');
assertIncludes(customize, '<WardrobePicker', 'components/CustomizeScreen.tsx');
assertIncludes(customize, 'TESTAR LOCAL', 'components/CustomizeScreen.tsx');
assertIncludes(customize, "renderStyleId: 'street-v2'", 'components/CustomizeScreen.tsx');

const photoUpload = read('components/PhotoUpload.tsx');
assertIncludes(photoUpload, 'Subir foto do rosto', 'components/PhotoUpload.tsx');

const mainMenu = read('components/launch/MainMenu.tsx');
const homePanel = read('components/launch/menu/HomePanel.tsx');
assertIncludes(homePanel, '<span>RUNNER SALVO</span>', 'components/launch/menu/HomePanel.tsx');
assertIncludes(homePanel, 'Identidade salva para a proxima fase', 'components/launch/menu/HomePanel.tsx');
assertNotIncludes(mainMenu, 'RUNNER READY', 'components/launch/MainMenu.tsx');
assertNotIncludes(homePanel, 'RUNNER READY', 'components/launch/menu/HomePanel.tsx');
assertNotIncludes(mainMenu, 'PNG limpo salvo para a proxima fase', 'components/launch/MainMenu.tsx');
assertNotIncludes(homePanel, 'PNG limpo salvo para a proxima fase', 'components/launch/menu/HomePanel.tsx');

const runnerSavedTeaser = read('components/launch/RunnerSavedTeaser.tsx');
assertIncludes(runnerSavedTeaser, '<span>RUNNER SALVO</span>', 'components/launch/RunnerSavedTeaser.tsx');
assertIncludes(runnerSavedTeaser, 'tua identidade fica pronta na HQ', 'components/launch/RunnerSavedTeaser.tsx');
assertNotIncludes(runnerSavedTeaser, 'PNG limpo salvo para a proxima fase', 'components/launch/RunnerSavedTeaser.tsx');

const crewService = read('services/crewService.ts');
assertIncludes(crewService, 'CrewRenderContext', 'services/crewService.ts');
assertIncludes(crewService, 'assertCrewRenderAssetPath', 'services/crewService.ts');
assertIncludes(crewService, 'Render style is fixed: street-v2', 'services/crewService.ts');
assertIncludes(crewService, 'Only top, bottom, shoes and accessory may change between cells', 'services/crewService.ts');
assertIncludes(crewService, 'loadCrewReferenceParts', 'services/crewService.ts');
assertIncludes(crewService, 'Use the attached face photo only as a broad physical-characteristics reference.', 'services/crewService.ts');
assertIncludes(crewService, 'Do NOT copy or preserve the exact face, identity, hair shape, hair color, facial marks, expression, clothing, or any recognizable person-specific details from the photo.', 'services/crewService.ts');

const readme = read('README.md');
assertIncludes(readme, 'Crew Pace', 'README.md');
assertNotIncludes(readme, 'Crew Flow', 'README.md');
assertIncludes(readme, 'npm run check:creator-contract', 'README.md');
assertIncludes(readme, 'npm run smoke:creator', 'README.md');

const contract = read('vault/CREATOR_CONTRACT.md');
for (const id of expectedRunnerTypeIds) assertIncludes(contract, id, 'vault/CREATOR_CONTRACT.md');
for (const label of expectedRunnerTypeLabels) assertIncludes(contract, label, 'vault/CREATOR_CONTRACT.md');
assertIncludes(contract, 'Nunca usar `public/styles/*` como input de geracao.', 'vault/CREATOR_CONTRACT.md');
assertIncludes(contract, 'Slot `hair` nao existe no contrato do creator.', 'vault/CREATOR_CONTRACT.md');
assertIncludes(contract, 'npm run smoke:creator', 'vault/CREATOR_CONTRACT.md');

const wave6Closeout = read('vault/2026-05-28-wave6-final-qa-closeout.md');
assertIncludes(wave6Closeout, 'Crew Pace', 'vault/2026-05-28-wave6-final-qa-closeout.md');
assertIncludes(wave6Closeout, 'crew-pace', 'vault/2026-05-28-wave6-final-qa-closeout.md');
assertIncludes(wave6Closeout, 'RUNNER SALVO', 'vault/2026-05-28-wave6-final-qa-closeout.md');
assertNotIncludes(wave6Closeout, 'RUNNER READY', 'vault/2026-05-28-wave6-final-qa-closeout.md');
assertNotIncludes(wave6Closeout, 'PNG limpo', 'vault/2026-05-28-wave6-final-qa-closeout.md');

const packageJson = JSON.parse(read('package.json'));
if (packageJson.scripts?.['smoke:creator'] !== 'node scripts/smoke-creator.mjs') {
  fail('package.json must define smoke:creator as node scripts/smoke-creator.mjs');
}
assertIncludes(packageJson.scripts?.validate ?? '', 'npm run smoke:creator', 'package.json scripts.validate');

const smoke = read('scripts/smoke-creator.mjs');
for (const requiredSmokeTerm of [
  'north-breakers',
  'MONTAR RUNNER',
  'TESTAR LOCAL',
  'Equipar look 1',
  'crew.saved_character',
  "saved.runnerTypeId, 'sprint'",
  "saved.renderStyleId, 'street-v2'",
]) {
  assertIncludes(smoke, requiredSmokeTerm, 'scripts/smoke-creator.mjs');
}

const workflowPath = '.github/workflows/crew-running-validate.yml';
const workflowFullPath = join(repoRoot, workflowPath);
if (!existsSync(workflowFullPath)) {
  fail(`${workflowPath} must exist`);
} else {
  const workflow = readFileSync(workflowFullPath, 'utf8');
  assertIncludes(workflow, 'apps/crew-running', workflowPath);
  assertIncludes(workflow, 'npm run validate', workflowPath);
  assertIncludes(workflow, 'npx playwright install --with-deps chromium', workflowPath);
}

if (errors.length > 0) {
  console.error('Creator contract check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Creator contract check passed.');
