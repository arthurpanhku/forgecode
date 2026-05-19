import type { Command } from 'commander';
import type { ToolRegistry } from '../tools/registry.js';

export function registerToolsCommand(program: Command, registry: ToolRegistry): void {
  program
    .command('tools')
    .description('List available tools')
    .action(() => {
      for (const tool of registry.list()) {
        console.log(`${tool.name.padEnd(14)} ${tool.access.padEnd(7)} ${tool.description}`);
      }
    });
}

