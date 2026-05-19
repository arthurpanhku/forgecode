import chalk from 'chalk';
import type { ProjectSummary } from '../core/projectScanner.js';
import type { ToolResult } from '../tools/types.js';

export function renderProjectSummary(summary: ProjectSummary): string {
  const extensions = summary.topExtensions
    .map(item => `${item.extension}: ${item.count}`)
    .join(', ');

  return [
    chalk.bold('Project Summary'),
    `Root: ${summary.root}`,
    `Files: ${summary.fileCount}`,
    `Package managers: ${summary.packageManagers.join(', ') || 'none detected'}`,
    `Signals: ${summary.signals.join(', ') || 'none detected'}`,
    `Top extensions: ${extensions || 'none'}`,
    '',
    chalk.bold('Directories'),
    summary.directories.join('\n') || '(no nested directories)',
  ].join('\n');
}

export function renderToolResult(result: ToolResult): string {
  return [chalk.bold(result.title), result.output].join('\n');
}

