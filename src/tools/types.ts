import type { z } from 'zod';
import type { ForgeContext } from '../core/context.js';

export type ToolAccess = 'read' | 'write' | 'execute';

export type ToolResult = {
  title: string;
  output: string;
  metadata?: Record<string, unknown>;
};

export type Tool<Input> = {
  name: string;
  description: string;
  access: ToolAccess;
  inputSchema: z.ZodType<Input>;
  isConcurrencySafe?: (input: Input) => boolean;
  run(input: Input, context: ForgeContext): Promise<ToolResult>;
};

