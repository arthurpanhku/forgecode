import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';

const DEFAULT_IGNORES = [
  '**/.git/**',
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.next/**',
  '**/.cache/**',
];

export type ProjectSummary = {
  root: string;
  fileCount: number;
  directories: string[];
  topExtensions: Array<{ extension: string; count: number }>;
  packageManagers: string[];
  signals: string[];
};

export async function scanProject(root: string): Promise<ProjectSummary> {
  const cwd = path.resolve(root);
  const files = await fg('**/*', {
    cwd,
    dot: true,
    onlyFiles: true,
    ignore: DEFAULT_IGNORES,
    followSymbolicLinks: false,
  });

  const directories = [...new Set(files.map(file => path.dirname(file)).filter(dir => dir !== '.'))]
    .sort()
    .slice(0, 20);

  const extensionCounts = new Map<string, number>();
  for (const file of files) {
    const extension = path.extname(file).replace(/^\./, '') || '[none]';
    extensionCounts.set(extension, (extensionCounts.get(extension) ?? 0) + 1);
  }

  const topExtensions = [...extensionCounts.entries()]
    .map(([extension, count]) => ({ extension, count }))
    .sort((a, b) => b.count - a.count || a.extension.localeCompare(b.extension))
    .slice(0, 10);

  return {
    root: cwd,
    fileCount: files.length,
    directories,
    topExtensions,
    packageManagers: detectPackageManagers(files),
    signals: await detectProjectSignals(cwd, files),
  };
}

function detectPackageManagers(files: string[]): string[] {
  const managers: string[] = [];
  if (files.includes('package-lock.json')) managers.push('npm');
  if (files.includes('pnpm-lock.yaml')) managers.push('pnpm');
  if (files.includes('yarn.lock')) managers.push('yarn');
  if (files.includes('bun.lockb') || files.includes('bun.lock')) managers.push('bun');
  return managers;
}

async function detectProjectSignals(cwd: string, files: string[]): Promise<string[]> {
  const signals: string[] = [];

  if (files.includes('package.json')) {
    signals.push('Node.js package');
    const packageJson = await readTextFile(path.join(cwd, 'package.json'));
    if (packageJson?.includes('"typescript"')) signals.push('TypeScript');
    if (packageJson?.includes('"vitest"')) signals.push('Vitest tests');
    if (packageJson?.includes('"react"')) signals.push('React');
  }

  if (files.includes('tsconfig.json')) signals.push('TypeScript config');
  if (files.includes('Cargo.toml')) signals.push('Rust package');
  if (files.includes('pyproject.toml')) signals.push('Python package');
  if (files.includes('go.mod')) signals.push('Go module');

  return signals;
}

async function readTextFile(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

