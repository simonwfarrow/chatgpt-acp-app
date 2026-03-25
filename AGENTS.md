# AGENTS.md - Coding Agent Guide

This repository hosts a Cloudflare Workers application implementing an MCP server with Durable Objects and Worldpay tooling. Follow these guidelines when making changes.

## Build, Lint, and Test Commands

### Development
- `npm run dev` - Start local development with Wrangler.
- `npm start` - Alias for `npm run dev`.

### Code Quality
- `npm run type-check` - TypeScript type checking (`tsc --noEmit`).
- `npm run lint:fix` - Lint and auto-fix with Biome.
- `npm run format` - Format code with Biome.

### Deployment
- `npm run deploy` - Deploy the worker to Cloudflare.
- `npm run cf-typegen` - Generate Cloudflare Workers types.

### Testing
- No automated test framework is configured in this repo.
- If tests are added, prefer Vitest for Workers compatibility.
- Single test file: `npx vitest run path/to/file.test.ts`.
- Specific test by name: `npx vitest run -t "test name"`.

### Before Committing
- `npm run type-check && npm run lint:fix && npm run format`

## Code Style Guidelines

### Formatting (Biome)
- Indentation: 4 spaces (tabs in config, rendered to 4 spaces).
- Line width: 100 characters.
- Semicolons: required.
- Trailing commas: required in multiline literals.
- Quotes: double quotes for strings.

### Imports
- Group imports in this order: external packages, internal SDK/absolute imports, relative imports.
- Sort alphabetically within each group.
- Use `type` keyword for type-only imports.
- MCP SDK imports use the `.js` extension.

Example:
```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Agent } from "agents";
import { z } from "zod";

import { createMcpHandler, type TransportState, WorkerTransport } from "agents/mcp";

import { SHOP_HTML } from "./constants";
```

### Naming Conventions
- Classes, interfaces, types: `PascalCase`.
- Functions, variables, parameters: `camelCase`.
- Constants: `SCREAMING_SNAKE_CASE`.
- Filenames: `kebab-case` or `camelCase` (match existing file).

### TypeScript Usage
- Strict mode is enabled; avoid `any` unless unavoidable.
- Use Zod schemas to validate external input (requests, env, tool params).
- Prefer `as const` for literal types and immutable config objects.
- Keep type definitions close to usage unless shared broadly (`src/types.ts`).

### Error Handling
- Use `try/catch` for expected failures and non-fatal parsing.
- Include context in logs (session ID, tool name, operation).
- Avoid swallowing errors unless intentional; add a brief comment if ignored.

Example:
```ts
try {
  const body = (await request.clone().json()) as { method?: string };
  if (body?.method === "initialize") {
    console.log(`[${sessionId}] Initialize requested; resetting transport.`);
  }
} catch {
  // Ignore non-JSON bodies.
}
```

### Logging
- Use `console.log` for info and `console.error` for errors.
- Include session context: `"[${sessionId}]"`.
- Keep messages action-oriented and short.

### Async Patterns
- Prefer async/await over raw Promise chains.
- Always await storage operations.

Example:
```ts
const state = await this.ctx.storage.get<TransportState>(`transport-${sessionId}`);
await this.ctx.storage.put(`transport-${sessionId}`, state);
```

## Project Structure

```
src/
├── index.ts      # Worker entry point and Durable Object
├── types.ts      # Zod schemas and TypeScript types
└── constants.ts  # HTML templates and static content
```

### File Responsibilities
- `src/index.ts`: Fetch handler, MCP server setup, tool registration.
- `src/types.ts`: Shared Zod schemas and TS types.
- `src/constants.ts`: Static HTML and config strings.

## Cloudflare Workers Notes

### Environment Variables
- Access via the `env` parameter in handlers.
- Expected keys: `MERCHANT_ID`, `CHALLENGE_CONTENT`, `MCP_OBJECT`.

### Durable Objects
- Use `this.ctx.storage` for persistence.
- Prefer typed reads/writes: `get<T>()`, `put<T>()`.

### Request Handling
```ts
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Route handling logic.
  },
};
```

## MCP Server Patterns

### Tool Registration
```ts
this.server.registerTool(
  "tool_name",
  {
    title: "Human readable title",
    description: "What the tool does",
    inputSchema: toolSchema,
    _meta: { /* OpenAI-specific metadata */ },
  },
  async (params) => ({
    content: [{ type: "text" as const, text: "Result" }],
    structuredContent: { /* structured data */ },
  }),
);
```

### Resource Registration
```ts
this.server.registerResource(
  "Resource Name",
  "ui://widget/path.html",
  {},
  async () => ({
    contents: [{ uri: "...", mimeType: "text/html+skybridge", text: HTML }],
  }),
);
```

## Lint Rules (Biome)

Enabled rules (follow them):
- `noInferrableTypes`
- `noParameterAssign`
- `useDefaultParameterLast`
- `useSelfClosingElements`

Disabled rules (allowed but still avoid when possible):
- `noExplicitAny`
- `noNonNullAssertion`
- `noDebugger`

## Cursor/Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found in this repo.
