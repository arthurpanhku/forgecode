import { Command } from 'commander';
import { registerAskCommand } from './commands/ask.js';
import { registerRunToolCommand } from './commands/runTool.js';
import { registerScanCommand } from './commands/scan.js';
import { registerToolsCommand } from './commands/tools.js';
import { createDefaultToolRegistry } from './tools/registry.js';

export function buildProgram(): Command {
  const program = new Command();
  const registry = createDefaultToolRegistry();

  program
    .name('forgecode')
    .description('Local-first CLI foundation for agentic coding workflows')
    .version('0.1.0');

  registerScanCommand(program);
  registerToolsCommand(program, registry);
  registerRunToolCommand(program, registry);
  registerAskCommand(program, registry);

  return program;
}

export async function runCli(argv: string[]): Promise<void> {
  await buildProgram().parseAsync(argv);
}

