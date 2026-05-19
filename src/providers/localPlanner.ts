import type { ProjectSummary } from '../core/projectScanner.js';
import type { ToolRegistry } from '../tools/registry.js';

export function buildLocalPlan(goal: string, summary: ProjectSummary, registry: ToolRegistry): string {
  const tools = registry.list().map(tool => `${tool.name} (${tool.access})`).join(', ');
  const signals = summary.signals.length > 0 ? summary.signals.join(', ') : 'no framework signals detected yet';

  return [
    `Goal: ${goal}`,
    '',
    'Workspace snapshot:',
    `- Root: ${summary.root}`,
    `- Files: ${summary.fileCount}`,
    `- Signals: ${signals}`,
    `- Available tools: ${tools}`,
    '',
    'Suggested next steps:',
    '1. Scan the repository shape and identify the smallest relevant files.',
    '2. Read only the files needed for the current task.',
    '3. Draft a concrete change plan before using write or execute tools.',
    '4. Run focused validation after each meaningful change.',
    '5. Record decisions that affect future contributors in docs.',
  ].join('\n');
}

