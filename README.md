# ForgeCode

ForgeCode is a local-first, provider-neutral CLI foundation for building agentic coding workflows.

It is an original implementation. The project was designed after studying common patterns in modern terminal coding assistants, but it does not copy Claude Code source, names, prompts, UI text, or module structure.

## What It Does Today

- Scans a workspace and summarizes project signals.
- Registers tools behind typed schemas.
- Separates read, write, and execute permissions.
- Runs safe read tools by default.
- Requires explicit confirmation for process execution.
- Generates a local task brief for a coding goal.
- Provides tests and CI from the first commit.

## Install

```sh
npm install
npm run build
```

Run locally during development:

```sh
npm run dev -- scan
npm run dev -- tools
npm run dev -- ask "add tests for the scanner"
```

After building:

```sh
node dist/index.js scan
```

## Commands

```sh
forgecode scan [path]
```

Summarize a workspace: file count, package-manager signals, top extensions, and key directories.

```sh
forgecode tools
```

List registered tools and their permission level.

```sh
forgecode run-tool <name> --input '<json>'
```

Run a registered tool. Tools with `execute` or `write` access require `--yes`.

```sh
forgecode ask "your coding goal"
```

Create a local execution brief for the goal using the current workspace summary.

## Tool Model

Each tool declares:

- `name`
- `description`
- `access`: `read`, `write`, or `execute`
- `inputSchema`: a Zod schema
- `run(input, context)`: the implementation

This keeps provider logic, permission checks, and tool execution separate.

## Current Tools

| Tool | Access | Purpose |
|---|---:|---|
| `list_files` | read | List files through a glob pattern |
| `read_file` | read | Read a UTF-8 file inside the workspace |
| `search_text` | read | Search matching lines in text files |
| `shell` | execute | Run a process with explicit permission |

## Project Status

ForgeCode is early-stage. The current release is a clean foundation, not a finished AI assistant.

Near-term work:

- Add provider adapters.
- Add write tools with diff previews.
- Add persistent sessions.
- Add richer terminal UI.
- Add plugin loading.

## Independence And Attribution

ForgeCode is not affiliated with Anthropic, Claude, or Claude Code.

The design process included reading a public source snapshot for architectural learning. The implementation here is intentionally original, uses its own naming and UI language, and is licensed only for code created in this repository.

## License

MIT

