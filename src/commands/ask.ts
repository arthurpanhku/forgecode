import type { Command } from 'commander';
import { scanProject } from '../core/projectScanner.js';
import { buildLocalPlan } from '../providers/localPlanner.js';
import type { ToolRegistry } from '../tools/registry.js';

export function registerAskCommand(program: Command, registry: ToolRegistry): void {
  program
    .command('ask')
    .description('Create a local execution brief for a coding goal')
    .argument('<goal...>', 'goal to analyze')
    .action(async (goalParts: string[]) => {
      const goal = goalParts.join(' ');
      const summary = await scanProject(process.cwd());
      console.log(buildLocalPlan(goal, summary, registry));
    });
}

