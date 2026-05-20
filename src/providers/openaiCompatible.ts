import type { ProviderAdapter, ChatRequest, ChatResponse, ProviderConfig, ToolCall } from './types.js';

export type OpenAIConfig = ProviderConfig & {
  name?: string;
};

export function createOpenAICompatibleProvider(config: OpenAIConfig): ProviderAdapter {
  const baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
  const model = config.model ?? 'gpt-4o';

  async function chat(request: ChatRequest): Promise<ChatResponse> {
    // Pre-process messages: serialize tool_calls into OpenAI format (type: 'function')
    const serializedMessages = request.messages.map(msg => {
      const m: Record<string, unknown> = { role: msg.role, content: msg.content };
      if (msg.tool_call_id) m.tool_call_id = msg.tool_call_id;
      if (msg.name) m.name = msg.name;
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        m.tool_calls = msg.tool_calls.map(tc => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: tc.arguments },
        }));
      }
      return m;
    });

    const bodyObj: Record<string, unknown> = {
      model,
      messages: [
        ...(request.system ? [{ role: 'system' as const, content: request.system }] : []),
        ...serializedMessages,
      ],
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.7,
    };

    // Add tool definitions if provided
    if (request.tools && request.tools.length > 0) {
      bodyObj.tools = request.tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }));
    }

    const body = JSON.stringify(bodyObj);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Provider API error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as {
      choices: Array<{
        message: {
          content: string;
          tool_calls?: Array<{
            id: string;
            type: string;
            function: { name: string; arguments: string };
          }>;
        };
      }>;
      model: string;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };

    const choice = data.choices[0]?.message;

    // Extract native tool calls if the API returned them
    let toolCalls: ToolCall[] | undefined;
    if (choice?.tool_calls && choice.tool_calls.length > 0) {
      toolCalls = choice.tool_calls.map(tc => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments,
      }));
    }

    return {
      content: choice?.content ?? '',
      model: data.model,
      toolCalls,
      usage: data.usage
        ? { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens }
        : undefined,
    };
  }

  return { name: config.name ?? 'openai-compatible', chat };
}
