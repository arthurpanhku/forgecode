import { spawn } from 'node:child_process';
import { z } from 'zod';
import type { Tool } from './types.js';

const inputSchema = z
  .object({
    command: z.string().min(1),
    args: z.array(z.string()).default([]),
    timeoutMs: z.number().int().positive().max(60_000).default(10_000),
  })
  .strict();

type Input = z.infer<typeof inputSchema>;

export const shellTool: Tool<Input> = {
  name: 'shell',
  description: 'Run a process in the workspace. Requires explicit execution permission.',
  access: 'execute',
  inputSchema,
  isConcurrencySafe: () => false,
  async run(input, context) {
    const result = await runProcess(input.command, input.args, context.cwd, input.timeoutMs);
    return {
      title: `Ran ${input.command}`,
      output: result.output || '(no output)',
      metadata: {
        exitCode: result.exitCode,
        timedOut: result.timedOut,
      },
    };
  },
};

function runProcess(
  command: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<{ output: string; exitCode: number | null; timedOut: boolean }> {
  return new Promise(resolve => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    let timedOut = false;
    const append = (chunk: Buffer) => {
      output += chunk.toString('utf8');
      if (output.length > 32_000) {
        output = `${output.slice(0, 32_000)}\n[output truncated]`;
      }
    };

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeoutMs);

    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.on('error', error => {
      clearTimeout(timer);
      resolve({ output: error.message, exitCode: 1, timedOut });
    });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ output: output.trimEnd(), exitCode: code, timedOut });
    });
  });
}

