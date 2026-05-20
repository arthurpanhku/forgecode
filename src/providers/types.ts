import type { z } from 'zod';

export type ProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
};

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  system?: string;
  maxTokens?: number;
  temperature?: number;
};

export type ChatResponse = {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
};

export interface ProviderAdapter {
  readonly name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
}
