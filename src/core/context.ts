export type ForgeContextOptions = {
  cwd?: string;
  allowWrite?: boolean;
  allowExecute?: boolean;
  maxBytes?: number;
};

export type ForgeContext = {
  cwd: string;
  allowWrite: boolean;
  allowExecute: boolean;
  maxBytes: number;
};

export function createForgeContext(options: ForgeContextOptions = {}): ForgeContext {
  return {
    cwd: options.cwd ?? process.cwd(),
    allowWrite: options.allowWrite ?? false,
    allowExecute: options.allowExecute ?? false,
    maxBytes: options.maxBytes ?? 256_000,
  };
}

