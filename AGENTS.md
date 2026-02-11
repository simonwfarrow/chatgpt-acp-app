# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working in the `chatgpt-acp-app` repository.

## Project Overview

A **Cloudflare Workers** application implementing an MCP (Model Context Protocol) server for ChatGPT integration. Uses the **Agents SDK** with **Durable Objects** for session management and integrates with **Worldpay** payment processing.

**Tech Stack:** TypeScript, Cloudflare Workers, MCP SDK, Zod, Biome

## Build, Lint, and Test Commands

### Development
```bash
npm run dev          # Start local dev server (Wrangler)
npm start            # Alias for dev
```

### Code Quality
```bash
npm run type-check   # TypeScript type checking (tsc --noEmit)
npm run lint:fix     # Lint and auto-fix with Biome
npm run format       # Format code with Biome
```

### Deployment
```bash
npm run deploy       # Deploy to Cloudflare Workers
npm run cf-typegen   # Generate Cloudflare worker types
```

### Testing
**No test framework is currently configured.** If tests are added:
- Prefer Vitest for Cloudflare Workers compatibility
- Run single test: `npx vitest run path/to/file.test.ts`
- Run specific test: `npx vitest run -t "test name"`

### Before Committing
Always run these commands before committing:
```bash
npm run type-check && npm run lint:fix && npm run format
```

## Code Style Guidelines

### Formatting (Biome)
- **Indentation:** 4 spaces (tabs in config, converted to 4 spaces)
- **Line width:** 100 characters maximum
- **Semicolons:** Required
- **Trailing commas:** Use in multi-line structures
- **Quotes:** Double quotes for strings

### Import Organization
1. External packages first (alphabetical)
2. Internal SDK imports
3. Relative imports last (prefixed with `./`)

```typescript
// External packages
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Agent, getAgentByName } from "agents";
import { z } from "zod";

// Internal SDK with type imports
import {
    createMcpHandler,
    type TransportState,
    WorkerTransport,
} from "agents/mcp";

// Relative imports
import { CHALLENGE_CONTENT, SHOP_HTML } from "./constants";
```

**Note:** Use `.js` extension for MCP SDK imports. Use `type` keyword for type-only imports.

### Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Classes | PascalCase | `MyMCP`, `WorkerTransport` |
| Interfaces/Types | PascalCase | `Product`, `TransportState` |
| Functions/Variables | camelCase | `sessionId`, `createMcpHandler` |
| Constants | SCREAMING_SNAKE_CASE | `SHOP_HTML`, `PRODUCTS` |
| File names | kebab-case or camelCase | `constants.ts`, `index.ts` |

### TypeScript Guidelines
- **Strict mode enabled** - all strict checks apply
- Use Zod schemas for runtime validation of external inputs
- Use TypeScript interfaces for internal type definitions
- Prefer `type` assertions with `as const` where applicable
- Avoid `any` where possible (rule is off but discouraged)

```typescript
// Zod schema for runtime validation
export const addToCartSchema = z.object({
    productId: z.string(),
});

// TypeScript interface for type definitions
export interface Product {
    id: string;
    name: string;
    price: number;
}
```

### Error Handling
- Use try/catch for expected failures
- Empty catch blocks OK for ignorable errors (add comment explaining why)
- Log errors with context (session ID, operation name)
- Use optional chaining (`?.`) for defensive access

```typescript
try {
    const body = (await request.clone().json()) as { method?: string };
    if (body?.method === "initialize") {
        console.log(`[${sessionId}] Received initialize, resetting transport.`);
    }
} catch {
    // Ignore body parsing errors (e.g. if it's not JSON)
}
```

### Logging Conventions
- Include session context: `[${sessionId}]`
- Use `console.log` for info, `console.error` for errors
- Be descriptive about the operation being performed

### Async/Await Patterns
- Always use async/await (no raw Promises)
- Handle async storage operations properly

```typescript
storage: {
    get: async () => {
        return await this.ctx.storage.get<TransportState>(`transport-${sessionId}`);
    },
    set: async (state: TransportState) => {
        await this.ctx.storage.put<TransportState>(`transport-${sessionId}`, state);
    },
},
```

## Project Structure

```
src/
├── index.ts      # Main entry, Worker & Durable Object definition
├── types.ts      # Zod schemas and TypeScript interfaces
└── constants.ts  # Static content (HTML, challenge tokens, etc.)
```

### File Responsibilities
- **index.ts**: Worker fetch handler, MCP server setup, tool registration
- **types.ts**: All Zod validation schemas and TypeScript types
- **constants.ts**: HTML templates, static strings, configuration values

## Cloudflare Workers Specifics

### Environment Variables
Access via `env` object passed to handlers:
- `MERCHANT_ID` - Payment provider merchant identifier
- `CHALLENGE_CONTENT` - OpenAI verification challenge
- `MCP_OBJECT` - Durable Object binding

### Durable Objects
- Use for session state persistence
- Access storage via `this.ctx.storage`
- Use typed generics: `get<T>()`, `put<T>()`

### Request Handling
```typescript
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext) {
        // Route handling logic
    },
};
```

## MCP Server Patterns

### Registering Tools
```typescript
this.server.registerTool(
    "tool_name",
    {
        title: "Human readable title",
        description: "What the tool does",
        inputSchema: zodSchema,  // or {} for no params
        _meta: { /* OpenAI-specific metadata */ },
    },
    async (params) => {
        return {
            content: [{ type: "text" as const, text: "Result" }],
            structuredContent: { /* structured data */ },
        };
    },
);
```

### Registering Resources
```typescript
this.server.registerResource(
    "Resource Name",
    "ui://widget/path.html",
    {},
    async () => ({
        contents: [{ uri: "...", mimeType: "text/html+skybridge", text: HTML }],
    }),
);
```

## Linting Rules (Biome)

Enabled style rules:
- `noInferrableTypes`: Don't add types that can be inferred
- `noParameterAssign`: Don't reassign function parameters
- `useDefaultParameterLast`: Default params at end of signature
- `useSelfClosingElements`: Use `<div />` not `<div></div>`

Disabled rules (allowed):
- `noExplicitAny`: `any` is permitted when necessary
- `noNonNullAssertion`: `!` operator is allowed
- `noDebugger`: `debugger` statements allowed in dev
