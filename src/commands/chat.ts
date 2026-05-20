import type { Command } from 'commander';
import type { ToolRegistry } from '../tools/registry.js';
import { ProviderManager } from '../providers/manager.js';
import { scanProject } from '../core/projectScanner.js';
import { createSession, saveSession, loadSession } from '../sessions/store.js';

export function registerChatCommand(program: Command, registry: ToolRegistry): void {
  program
    .command('chat')
    .description('Chat with an AI coding assistant about the current project')
    .argument('<message...>', 'message to send')
    .option('--session <id>', 'resume an existing session by ID')
    .option('--provider <name>', 'provider name', 'deepseek')
    .option('--model <name>', 'model name')
    .action(async (messageParts: string[], options: { session?: string; provider: string; model?: string }) => {
      const message = messageParts.join(' ');
      const providerName = options.provider;

      // Load or create session
      let session;
      if (options.session) {
        const loaded = await loadSession(options.session);
        if (!loaded) {
          console.error(`Session not found: ${options.session}`);
          process.exit(1);
        }
        session = loaded;
      } else {
        session = createSession(process.cwd());
      }

      // Set up provider
      const manager = new ProviderManager().loadFromEnv();
      const provider = manager.get(providerName);

      // Scan workspace for context
      const summary = await scanProject(process.cwd());

      // Build available tools description
      const tools = registry.list();
      const toolsDesc = tools
        .map((t) => `- ${t.name}: ${t.description} (access: ${t.access})`)
        .join('\n');

      // Build system prompt
      const systemPrompt = [
        'You are an AI coding assistant. The user is working on the following project:',
        '',
        `Project root: ${summary.root}`,
        `Files: ${summary.fileCount} files`,
        `Extensions: ${summary.topExtensions.map((e) => `${e.extension} (${e.count})`).join(', ')}`,
        `Directories: ${summary.directories.join(', ')}`,
        summary.signals.length > 0 ? `Signals: ${summary.signals.join(', ')}` : '',
        summary.packageManagers.length > 0 ? `Package manager(s): ${summary.packageManagers.join(', ')}` : '',
        '',
        'Available tools:',
        toolsDesc,
        '',
        'Use these tools when appropriate to help the user.',
      ]
        .filter(Boolean)
        .join('\n');

      // Add user message to session
      session.messages.push({ role: 'user', content: message });

      // Call provider
      const response = await provider.chat({
        system: systemPrompt,
        messages: session.messages,
      });

      // Add response to session
      session.messages.push({ role: 'assistant', content: response.content });
      session.updatedAt = new Date().toISOString();

      // Save session
      await saveSession(session);

      // Output results
      console.log(response.content);
      console.log('');
      console.log(`--- Session: ${session.id} | Model: ${response.model}${response.usage ? ` | Tokens: ${response.usage.inputTokens} in / ${response.usage.outputTokens} out` : ''} ---`);
    });
}
