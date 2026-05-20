import { mkdtempSync } from 'node:fs';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import * as os from 'node:os';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { Command } from 'commander';
import { registerInitCommand } from '../src/commands/init.js';

let tmpDir: string;

afterAll(async () => {
  if (tmpDir) {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

describe('init command', () => {
  it('creates .forgecode.json with default config', async () => {
    tmpDir = mkdtempSync(path.join(os.tmpdir(), 'forgecode-test-init-'));

    // Override process.cwd to return our temp directory
    const originalCwd = process.cwd;
    const cwdMock = vi.fn(() => tmpDir);
    process.cwd = cwdMock as typeof process.cwd;

    // Capture console output
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (msg: string) => logs.push(msg);

    try {
      const program = new Command();
      registerInitCommand(program);
      await program.parseAsync(['node', 'forgecode', 'init']);

      const configPath = path.join(tmpDir, '.forgecode.json');
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config).toHaveProperty('provider');
      expect(config).toHaveProperty('model');
      expect(config).toHaveProperty('systemPrompt');
      expect(typeof config.provider).toBe('string');
      expect(typeof config.model).toBe('string');
      expect(typeof config.systemPrompt).toBe('string');

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toContain('.forgecode.json');
    } finally {
      process.cwd = originalCwd;
      console.log = originalLog;
    }
  });

  it('reads provider and model from env vars', async () => {
    const envDir = mkdtempSync(path.join(os.tmpdir(), 'forgecode-test-init-env-'));

    const originalCwd = process.cwd;
    const originalEnvProvider = process.env.FORGECODE_PROVIDER;
    const originalEnvModel = process.env.FORGECODE_MODEL;
    const cwdMock = vi.fn(() => envDir);
    process.cwd = cwdMock as typeof process.cwd;
    process.env.FORGECODE_PROVIDER = 'openai';
    process.env.FORGECODE_MODEL = 'gpt-4o';

    try {
      const program = new Command();
      registerInitCommand(program);
      await program.parseAsync(['node', 'forgecode', 'init']);

      const configPath = path.join(envDir, '.forgecode.json');
      const content = await readFile(configPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.provider).toBe('openai');
      expect(config.model).toBe('gpt-4o');
    } finally {
      process.cwd = originalCwd;
      process.env.FORGECODE_PROVIDER = originalEnvProvider;
      process.env.FORGECODE_MODEL = originalEnvModel;
      await rm(envDir, { recursive: true, force: true });
    }
  });
});
