import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Command } from 'commander';

type ForgecodeConfig = {
  provider: string;
  model: string;
  systemPrompt: string;
};

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize .forgecode.json in the current directory')
    .action(async () => {
      const config: ForgecodeConfig = {
        provider: process.env.FORGECODE_PROVIDER ?? 'deepseek',
        model: process.env.FORGECODE_MODEL ?? 'deepseek-chat',
        systemPrompt: 'You are an AI coding assistant.',
      };

      const configPath = path.resolve(process.cwd(), '.forgecode.json');

      await writeFile(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

      console.log(`Created ${configPath}`);
    });
}
