#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const appRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const smokeCrewSlug = 'north-breakers';
const outputDir = join(appRoot, 'output', 'playwright');
const failureScreenshot = join(outputDir, 'creator-smoke-failure.png');
const photoPath = join(appRoot, 'public', 'crews', smokeCrewSlug, 'leader.png');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isPortAvailable = (port) =>
  new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });

const findPort = async (startPort) => {
  for (let port = startPort; port < startPort + 50; port += 1) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No local port available from ${startPort}.`);
};

const SERVER_WAIT_TIMEOUT_MS = Number(process.env.SMOKE_SERVER_WAIT_MS) || 60000;

const waitForServer = async (url, serverProcess) => {
  const startedAt = Date.now();
  while (Date.now() - startedAt < SERVER_WAIT_TIMEOUT_MS) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Vite exited before smoke could start with code ${serverProcess.exitCode}.`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Vite is still booting.
    }

    await wait(250);
  }

  throw new Error(`Timed out waiting for ${url}.`);
};

const stopServer = async (serverProcess) => {
  if (!serverProcess || serverProcess.exitCode !== null) return;

  serverProcess.kill('SIGTERM');
  await Promise.race([
    once(serverProcess, 'exit'),
    wait(5000).then(() => {
      if (serverProcess.exitCode === null) serverProcess.kill('SIGKILL');
    }),
  ]);
};

const assertEqual = (actual, expected, message) => {
  if (actual !== expected) throw new Error(`${message}: expected ${expected}, got ${actual}`);
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const readSavedCharacter = async (page) => {
  const raw = await page.evaluate(() => window.localStorage.getItem('crew.saved_character'));
  assert(raw, 'crew.saved_character was not saved');

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`crew.saved_character is not valid JSON: ${error.message}`);
  }
};

const seedLaunchStorage = async (context) => {
  await context.addInitScript((slug) => {
    window.localStorage.clear();
    window.localStorage.setItem('crewConsoleBootSeen', 'true');
    window.localStorage.setItem('crewBootSeen', 'true');
    window.localStorage.setItem('crewTitleSeen', 'true');
    window.localStorage.setItem('crewCitySignalSeen', 'true');
    window.localStorage.setItem('crewGameIntroSeen', 'true');
    window.localStorage.setItem('crewMainMenuSeen', 'true');
    window.localStorage.setItem('crewGuidedSetupComplete', 'true');
    window.localStorage.setItem('crewOnboardingComplete', 'true');
    window.localStorage.setItem('crewSelectedCrewSlug', slug);
    window.localStorage.removeItem('crewRunnerCustomized');
    window.localStorage.removeItem('crew.saved_character');
  }, smokeCrewSlug);
};

const assertSavedCharacter = async (page, runnerName) => {
  const saved = await readSavedCharacter(page);
  const slotKeys = Object.keys(saved.slots ?? {}).sort();
  assertEqual(saved.crewSlug, smokeCrewSlug, `${runnerName} saved crewSlug`);
  assertEqual(saved.runnerTypeId, 'sprint', `${runnerName} saved runnerTypeId`);
  assertEqual(saved.renderStyleId, 'street-v2', `${runnerName} saved renderStyleId`);
  assertEqual(JSON.stringify(slotKeys), JSON.stringify(['accessory', 'bottom', 'shoes', 'top']), `${runnerName} saved slot keys`);
  assert(!('hair' in (saved.slots ?? {})), `${runnerName} saved slots must not include hair`);
  assert(
    typeof saved.imageDataUrl === 'string' && saved.imageDataUrl.startsWith('data:image/png'),
    `${runnerName} saved imageDataUrl must be a PNG data URL`,
  );

  const customized = await page.evaluate(() => window.localStorage.getItem('crewRunnerCustomized'));
  assertEqual(customized, 'true', `${runnerName} crewRunnerCustomized`);
};

const openCreator = async (page) => {
  await page.getByRole('button', { name: 'MONTAR RUNNER' }).click();

  const creatorHeading = page.getByRole('heading', { name: 'CRIE SEU RUNNER' });
  const creatorOpened = await creatorHeading
    .waitFor({ timeout: 1200 })
    .then(() => true)
    .catch(() => false);

  if (!creatorOpened) {
    await page.getByRole('button', { name: /^MONTAR$/ }).click();
  }

  await creatorHeading.waitFor({ timeout: 10000 });
};

const runSmoke = async () => {
  await access(photoPath);

  const port = await findPort(5177);
  const baseUrl = `http://127.0.0.1:${port}`;
  const serverProcess = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
    {
      cwd: appRoot,
      env: { ...process.env, BROWSER: 'none' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let serverOutput = '';
  serverProcess.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  serverProcess.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  let browser;
  let page;

  try {
    await waitForServer(baseUrl, serverProcess);

    browser = await chromium.launch({ headless: true });
    const runScenario = async ({ runnerName }) => {
      const context = await browser.newContext({
        reducedMotion: 'reduce',
        viewport: { width: 1280, height: 900 },
      });
      await seedLaunchStorage(context);

      page = await context.newPage();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
      await openCreator(page);

      await page
        .locator('input[type="file"][aria-label="Subir foto do rosto"]')
        .setInputFiles(photoPath);

      await page.locator('input[placeholder="nome do runner"]').fill(runnerName);
      await page.getByRole('button', { name: 'Abrir ajuste do estúdio' }).click();
      await page.getByRole('button', { name: 'TESTAR LOCAL' }).click();

      const equipButtons = page.getByRole('button', { name: /Equipar look/ });
      await equipButtons.first().waitFor({ state: 'visible', timeout: 10000 });
      assertEqual(await equipButtons.count(), 4, `${runnerName} 2x2 sheet equip button count`);

      await page.getByRole('button', { name: 'Equipar look 1' }).click();
      await page.getByRole('heading', { name: `${runnerName} pronto.` }).waitFor({ timeout: 10000 });
      await assertSavedCharacter(page, runnerName);

      await context.close();
      page = undefined;
    };

    await runScenario({ runnerName: 'Nina North' });

    console.log('Creator smoke passed: photo upload -> TESTAR LOCAL -> 2x2 -> crew.saved_character.');
  } catch (error) {
    if (page) {
      mkdirSync(outputDir, { recursive: true });
      await page.screenshot({ path: failureScreenshot, fullPage: true }).catch(() => {});
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`Creator smoke failed: ${message}`);
    if (serverOutput.trim()) console.error(serverOutput.trim());
    throw error;
  } finally {
    if (browser) await browser.close();
    await stopServer(serverProcess);
  }
};

runSmoke().catch(() => {
  process.exit(1);
});
