# Building a Remote MCP Server on Cloudflare (Without Auth)

This example allows you to deploy a remote MCP server that doesn't require authentication on Cloudflare Workers. 

## Get started: 

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-authless)

This will deploy your MCP server to a URL like: `remote-mcp-server-authless.<your-account>.workers.dev/sse`

Alternatively, you can use the command line below to get the remote MCP Server created on your local machine:
```bash
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless
```

## Customizing your MCP Server

To add your own [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/) to the MCP server, define each tool inside the `init()` method of `src/index.ts` using `this.server.tool(...)`. 

## Connect to Cloudflare AI Playground

You can connect to your MCP server from the Cloudflare AI Playground, which is a remote MCP client:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`remote-mcp-server-authless.<your-account>.workers.dev/sse`)
3. You can now use your MCP tools directly from the playground!

## Connect Claude Desktop to your MCP server

You can also connect to your remote MCP server from local MCP clients, by using the [mcp-remote proxy](https://www.npmjs.com/package/mcp-remote). 

To connect to your MCP server from Claude Desktop, follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user) and within Claude Desktop go to Settings > Developer > Edit Config.

Update with this configuration:

```json
{
  "mcpServers": {
    "calculator": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "http://localhost:8787/sse"  // or remote-mcp-server-authless.your-account.workers.dev/sse
      ]
    }
  }
}
```

Restart Claude and you should see the tools become available. 

---

## Customer Profiles

Each demo is driven by a **customer profile** — a single TypeScript config file that controls the entire storefront: brand copy, product catalog, theme colors, payment settings, and widget metadata. Switching customers takes one command.

### Deploying a customer

```bash
# Deploy the Worldpay demo
npm run deploy:worldpay

# Deploy the Acme Tech Store demo
npm run deploy:acme-demo
```

Each deploy command automatically updates `src/customer.ts` to point to the correct profile, then runs `wrangler deploy` with the matching config file.

### Local development

To switch the active customer without deploying (e.g. for `npm run dev`):

```bash
npm run set-customer worldpay
npm run set-customer acme-demo
```

This rewrites `src/customer.ts` to import from the named profile folder. Commit the updated `src/customer.ts` to lock in a customer for CI/CD deploys.

### Adding a new customer

1. Copy an existing profile as a starting point:
   ```bash
   cp -r customers/worldpay customers/<new-id>
   ```
2. Edit `customers/<new-id>/config.ts` — fill in all fields in the `CustomerConfig` object.
3. Update `storefront.workerDomain` to the Cloudflare Workers URL for this customer (e.g. `https://<new-id>-acp-app.<account>.workers.dev`).
4. Copy a wrangler config and update the worker name:
   ```bash
   cp wrangler.worldpay.jsonc wrangler.<new-id>.jsonc
   # Edit wrangler.<new-id>.jsonc → set "name": "<new-id>-acp-app"
   ```
5. Add a deploy script to `package.json`:
   ```json
   "deploy:<new-id>": "node scripts/set-customer.mjs <new-id> && wrangler deploy --config wrangler.<new-id>.jsonc"
   ```
6. Set Cloudflare secrets (see below), then run `npm run deploy:<new-id>`.

### CustomerConfig schema

| Section | Fields | Description |
|---------|--------|-------------|
| `brand` | `title`, `subtitle`, `cartLabel`, `checkoutButtonText`, `emptyCartText` | UI copy shown in the storefront |
| `products` | `id`, `name`, `description`, `price.amount` (dollars), `price.currency`, `imageBase64?` | Product catalog — drives both the shop UI and server-side checkout |
| `theme` | `primaryColor`, `primaryFocusColor`, `primaryHighlightColor`, `primarySubtleColor`, `fontFamilyDisplay`, `fontFamilyDefault` | Brand colours and fonts injected as CSS custom properties |
| `storefront` | `workerDomain`, `widgetTitle`, `termsUrl`, `privacyUrl` | Widget CSP domain, MCP resource title, and legal links |
| `payment` | `narrative`, `merchantEntity`, `currency`, `apiVersion` | Worldpay payment instruction fields |
| `challengeContent` | `string` | **Dev-time fallback only.** Production always reads `env.CHALLENGE_CONTENT`. Leave as `""` in committed configs. |

### Cloudflare secrets

Each deployed worker needs its own secrets. Set them with:

```bash
wrangler secret put WORLDPAY_API_KEY --config wrangler.<id>.jsonc
wrangler secret put CHALLENGE_CONTENT --config wrangler.<id>.jsonc
wrangler secret put MERCHANT_ID       --config wrangler.<id>.jsonc
```

> ⚠️ Never commit real values for `WORLDPAY_API_KEY`, `CHALLENGE_CONTENT`, or `MERCHANT_ID` to source control. The `vars` blocks in wrangler config files intentionally contain empty strings as placeholders.
