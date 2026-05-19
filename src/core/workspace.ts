import path from 'node:path';

export function resolveInsideWorkspace(cwd: string, inputPath: string): string {
  const root = path.resolve(cwd);
  const target = path.resolve(root, inputPath);
  const relative = path.relative(root, target);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escapes workspace: ${inputPath}`);
  }

  return target;
}

