import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { homedir } from 'node:os';
import type { ChatMessage } from '../providers/types.js';

export type Session = {
  id: string;
  createdAt: string;
  updatedAt: string;
  cwd: string;
  goal?: string;
  messages: ChatMessage[];
  metadata?: Record<string, unknown>;
};

function sessionDir(): string {
  return path.join(homedir(), '.forgecode', 'sessions');
}

export async function ensureSessionDir(): Promise<string> {
  const dir = sessionDir();
  await mkdir(dir, { recursive: true });
  return dir;
}

export function createSession(cwd: string, goal?: string): Session {
  const id = `fc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  return {
    id,
    createdAt: now,
    updatedAt: now,
    cwd,
    goal,
    messages: [],
  };
}

export async function saveSession(session: Session): Promise<void> {
  const dir = await ensureSessionDir();
  const filePath = path.join(dir, `${session.id}.json`);
  await writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');
}

export async function loadSession(id: string): Promise<Session | null> {
  const dir = sessionDir();
  const filePath = path.join(dir, `${id}.json`);
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data) as Session;
  } catch {
    return null;
  }
}

export async function listSessions(): Promise<Session[]> {
  const dir = sessionDir();
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const sessions: Session[] = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const data = await readFile(path.join(dir, file), 'utf-8');
      sessions.push(JSON.parse(data) as Session);
    } catch {
      // Skip corrupt session files
      continue;
    }
  }
  // Sort by updatedAt descending (most recent first)
  sessions.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  return sessions;
}

export async function deleteSession(id: string): Promise<void> {
  const dir = sessionDir();
  const filePath = path.join(dir, `${id}.json`);
  await rm(filePath, { force: true });
}
