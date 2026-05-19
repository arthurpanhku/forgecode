import path from 'node:path';
import type { Command } from 'commander';
import { scanProject } from '../core/projectScanner.js';
import { renderProjectSummary } from '../ui/output.js';

export function registerScanCommand(program: Command): void {
  program
    .command('scan')
    .description('Summarize the current project structure')
    .argument('[path]', 'workspace path', '.')
    .action(async (inputPath: string) => {
      const root = path.resolve(process.cwd(), inputPath);
      const summary = await scanProject(root);
      console.log(renderProjectSummary(summary));
    });
}

