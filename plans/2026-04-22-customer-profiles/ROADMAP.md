---
status: complete
phase: 6
updated: 2026-04-22
---

# Implementation Plan: Customer Profile System

## Goal
Enable a developer to swap the entire customer experience (brand, products, theme, payment config) by changing a single import identifier before redeployment.

## Context & Decisions
| Decision | Rationale | Source |
|----------|-----------|--------|
| Single re-export file `src/customer.ts` as the switch point | One line to change; no runtime magic, works inside Cloudflare Workers bundler | `ref:ses_24adec89dffeocJoJidNEDCdj9` |
| CustomerConfig in `src/types.ts` (not a new file) | Keeps type definitions co-located with existing `Product`, `LineItem`, `CheckoutSessionState` | direct analysis |
| Profiles live in `customers/<id>/config.ts` | Predictable tree; isolates all per-customer assets (images, copy, colors) in one folder | `ref:ses_24adec89dffeocJoJidNEDCdj9` |
| `buildShopHtml(config)` function replaces the `SHOP_HTML` string constant | Injects brand copy, theme tokens and product JSON at build time; eliminates the UI/server product-catalog drift | `ref:ses_24adec89dffeocJoJidNEDCdj9` |
| `getProducts(config)` helper converts CustomerConfig products to the internal `Product[]` type | Preserves the existing `Product` interface (`price` as dollars float); conversion to Worldpay cents stays in `index.ts` | direct analysis |
| Per-customer `wrangler.<id>.jsonc` files for worker name + vars shape | Keeps Cloudflare secrets out of source code while giving each customer its own worker deployment target | `ref:ses_24adec89dffeocJoJidNEDCdj9` |
| `set-customer.mjs` Node.js script rewrites `src/customer.ts` at switch time | Dead-simple; no build-tool plugins needed; works with existing Wrangler + `tsc` pipeline | `ref:ses_24adec89dffeocJoJidNEDCdj9` |
| `CustomerConfig.challengeContent` is a dev-time fallback only | Production reads `env.CHALLENGE_CONTENT` (Cloudflare secret); current constant in `constants.ts` is already unused at runtime | direct analysis |
| theme stores only the four semantic brand color values | The HTML already maps semantic tokens (`--color-brand-primary` etc.) to the deep-blue palette; swapping those four is sufficient for a full re-theme | direct analysis |
| price.amount in CustomerConfig is dollars (float), not cents | Matches the existing UI `toFixed(2)` display convention; `index.ts` already does `* 100` for Worldpay | direct analysis |

---

## Phase 1: CustomerConfig Schema [COMPLETE]

- [x] 1.1 Define `CustomerConfig` interface in `src/types.ts`
  - Goal: Establish the single source-of-truth type that all customer profiles must satisfy.
  - Input: `src/types.ts` (existing); research findings `ref:ses_24adec89dffeocJoJidNEDCdj9`
  - Output: New interfaces `CustomerProductConfig` and `CustomerConfig` appended to `src/types.ts`.
  - Shape to implement:
    ```ts
    export interface CustomerProductConfig {
        id: string;
        name: string;
        description: string;
        price: { amount: number; currency: string }; // amount in dollars
        imageBase64?: string; // full data-URL string (e.g. "data:image/png;base64,...")
    }

    export interface CustomerConfig {
        brand: {
            title: string;
            subtitle: string;
            cartLabel: string;
            checkoutButtonText: string;
            emptyCartText: string;
        };
        products: CustomerProductConfig[];
        theme: {
            primaryColor: string;           // maps to --color-brand-primary
            primaryFocusColor: string;      // maps to --color-brand-primary-focus
            primaryHighlightColor: string;  // maps to --color-brand-primary-highlight
            primarySubtleColor: string;     // maps to --color-brand-primary-subtle
            fontFamilyDisplay: string;      // CSS font-family string for headings
            fontFamilyDefault: string;      // CSS font-family string for body
        };
        storefront: {
            workerDomain: string;   // e.g. "https://chatgpt-acp-app.simonwfarrow.workers.dev"
            widgetTitle: string;    // MCP resource title shown in agent UI
            termsUrl: string;
            privacyUrl: string;
        };
        payment: {
            narrative: string;      // Worldpay instruction.narrative.line1
            merchantEntity: string; // Worldpay merchant.entity
            currency: string;       // ISO 4217 e.g. "USD"
            apiVersion: string;     // WP-Api-Version header e.g. "2024-06-01"
        };
        challengeContent: string;   // dev-time fallback; prod reads env.CHALLENGE_CONTENT
    }
    ```
  - Depends on: nothing

- [x] 1.2 Create `src/customer.ts` as the active-customer re-export stub
  - Goal: The one file a developer touches to switch customers.
  - Input: Interface from 1.1; `customers/worldpay/config.ts` path (created in 2.1)
  - Output: `src/customer.ts` containing exactly:
    ```ts
    // Change this import to switch the active customer profile.
    export { config as activeConfig } from "../customers/worldpay/config";
    ```
  - Depends on: 1.1

---

## Phase 2: Customer Profiles [COMPLETE]

- [x] 2.1 Create `customers/worldpay/config.ts` — migrate all existing hardcoded values
  - Goal: Extract every Worldpay-specific constant currently scattered across `constants.ts` and `index.ts` into a typed config object.
  - Input: `src/constants.ts` (SHOP_HTML text, PRODUCTS, CHALLENGE_CONTENT); `src/index.ts` (resource title line 108, workerDomain line 124, narrative line 371, default bundle lines 197–236, "USD" currency, terms/privacy URLs lines 253–255, merchantEntity line 359, WP-Api-Version line 409); `CustomerConfig` from 1.1
  - Output: `customers/worldpay/config.ts` satisfying `CustomerConfig`. Key values to migrate:
    - `brand.title`: `"Worldpay Swag Shop"`
    - `brand.subtitle`: `"Get your exclusive developer gear"`
    - `brand.cartLabel`: `"Shopping Cart"`
    - `brand.checkoutButtonText`: `"Checkout"`
    - `brand.emptyCartText`: `"Your cart is empty"`
    - `products[0]`: id `"tshirt"`, name `"Worldpay T-Shirt"`, description `"Classic logo tee"`, price `{ amount: 20.00, currency: "USD" }`, imageBase64: full data-URL from `constants.ts`
    - `products[1]`: id `"cup"`, name `"Worldpay Cup"`, description `"Developer mug"`, price `{ amount: 10.00, currency: "USD" }`, imageBase64: full data-URL from `constants.ts`
    - `theme.primaryColor`: `"#1b1b6f"`, `primaryFocusColor`: `"#4b4bd3"`, `primaryHighlightColor`: `"#eaeafa"`, `primarySubtleColor`: `"#f5f5fd"`
    - `theme.fontFamilyDisplay`: `'"Blinker","Helvetica","Arial","sans-serif","system-ui","-apple-system"'`
    - `theme.fontFamilyDefault`: `'"Inter","Helvetica","Arial","sans-serif","system-ui","-apple-system"'`
    - `storefront.workerDomain`: `"https://chatgpt-acp-app.simonwfarrow.workers.dev"`
    - `storefront.widgetTitle`: `"Open Worldpay Swag Shop"`
    - `storefront.termsUrl`: `"https://example.com/terms"`
    - `storefront.privacyUrl`: `"https://example.com/privacy"`
    - `payment.narrative`: `"Worldpay Swag Shop"`, `merchantEntity`: `"default"`, `currency`: `"USD"`, `apiVersion`: `"2024-06-01"`
    - `challengeContent`: `"erbHlsmNQvYZ7Rfq-P6ZH_ohgVs0_Mg53ZbXgsImNFE"`
  - Depends on: 1.1

- [x] 2.2 Create `customers/acme-demo/config.ts` — realistic second customer profile
  - Goal: Prove the system works with a visually distinct, completely different brand and product set.
  - Input: `CustomerConfig` interface from 1.1; creative license for Acme brand
  - Output: `customers/acme-demo/config.ts` satisfying `CustomerConfig`. Suggested values:
    - `brand.title`: `"Acme Tech Store"`, subtitle: `"Premium gadgets for developers"`
    - products: 2–3 tech-themed items (e.g. USB Hub $35, Mechanical Keyboard $120) with compact SVG data-URL placeholders (no external assets needed)
    - `theme`: a teal/green palette (e.g. `primaryColor: "#0d5c4a"`, `primaryFocusColor: "#14a882"`, etc.)
    - `storefront.workerDomain`: `"https://acme-demo-acp-app.<your-account>.workers.dev"` (placeholder)
    - `storefront.widgetTitle`: `"Open Acme Tech Store"`
    - `payment.narrative`: `"Acme Tech Store"`, `merchantEntity`: `"acme-default"`
    - `challengeContent`: `""` (placeholder; set via Cloudflare secret in prod)
  - Depends on: 1.1

---

## Phase 3: Refactor src/constants.ts [COMPLETE]

- [x] 3.1 Convert `SHOP_HTML` string to `buildShopHtml(config: CustomerConfig): string`
  - Goal: Generate customer-specific HTML by injecting brand copy, theme color tokens, and product catalog JSON into the template at call time.
  - Input: `src/constants.ts` current `SHOP_HTML` string; `CustomerConfig` interface from 1.1
  - Output: Named export `buildShopHtml` function that:
    1. Injects `config.theme.*` into the `:root {}` CSS block, replacing the four `--color-brand-primary*` declarations and the two `--font-family-*` declarations
    2. Replaces `<h1>Worldpay Swag Shop</h1>` with `<h1>${config.brand.title}</h1>`
    3. Replaces `<p class="subtitle">Get your exclusive developer gear</p>` with the config subtitle
    4. Replaces `"Shopping Cart"` basket header text with `config.brand.cartLabel`
    5. Replaces `"Your cart is empty"` with `config.brand.emptyCartText`
    6. Replaces button label `"Checkout"` with `config.brand.checkoutButtonText`
    7. Replaces the hardcoded `const products = [...]` JS array with `const products = ${JSON.stringify(config.products.map(p => ({ id: p.id, name: p.name, price: p.price.amount, image: p.imageBase64 ?? "" })))};`
  - Note: All other CSS (layout, spacing, transitions) remains static; only the six semantic CSS variables and seven text/data injection points change.
  - Depends on: 1.1

- [x] 3.2 Convert `PRODUCTS` constant to `getProducts(config: CustomerConfig): Product[]`
  - Goal: Derive the server-side product catalog from config so it stays in sync with the UI products.
  - Input: `src/constants.ts` existing `PRODUCTS` array; `Product` interface from `src/types.ts`
  - Output: Named export `getProducts` function: `config.products.map(p => ({ id: p.id, name: p.name, price: p.price.amount }))`
  - Depends on: 1.1

- [x] 3.3 Remove the unused `CHALLENGE_CONTENT` export from `src/constants.ts`
  - Goal: Eliminate dead code; challenge content is exclusively owned by env vars + CustomerConfig now.
  - Input: `src/constants.ts` line 536
  - Output: Line removed; no call sites to update (confirmed unused in `index.ts` imports)
  - Depends on: 3.1, 3.2 (same file pass)

---

## Phase 4: Refactor src/index.ts [COMPLETE]

- [x] 4.1 Import active config and update resource registration
  - Goal: The MCP resource title and widget CSP domain must reflect the active customer profile.
  - Input: `src/index.ts` lines 107–138 (resource registration); `src/customer.ts` from 1.2; `buildShopHtml` from 3.1
  - Output:
    - Add import: `import { activeConfig } from "./customer";`
    - Change import from `./constants`: replace `SHOP_HTML` with `buildShopHtml`, replace `PRODUCTS` with `getProducts`
    - Resource name arg (line 108): `activeConfig.storefront.widgetTitle`
    - `_meta["openai/widgetDomain"]` (line 124): `activeConfig.storefront.workerDomain`
    - `_meta["openai/widgetCSP"]` connect/resource domains (lines 127–130): `[activeConfig.storefront.workerDomain]`
    - `text: SHOP_HTML` → `text: buildShopHtml(activeConfig)`
  - Depends on: 1.2, 3.1

- [x] 4.2 Replace remaining hardcoded customer values in `create_checkout_session` and `complete_checkout` tools
  - Goal: Currency, narrative, merchant entity, terms/privacy URLs, and fallback bundle must all derive from active config.
  - Input: `src/index.ts` lines 159–282 (`create_checkout_session`), 356–412 (`complete_checkout`); `getProducts` from 3.2
  - Output:
    - `PRODUCTS.find(...)` → `getProducts(activeConfig).find(...)`
    - `currency: "USD"` (lines ~188, 246, 487) → `activeConfig.payment.currency`
    - Default fallback bundle (lines 197–235): replace hardcoded `"Worldpay Hoodie"` / `"Worldpay T-Shirt"` items with `getProducts(activeConfig).slice(0, 2)` mapped to LineItem shape, using `activeConfig.payment.currency`
    - `merchant: { entity: "default" }` (line 359) → `merchant: { entity: activeConfig.payment.merchantEntity }`
    - `narrative: { line1: "Worldpay Swag Shop" }` (line 371) → `narrative: { line1: activeConfig.payment.narrative }`
    - `"WP-Api-Version": "2024-06-01"` (lines 400, 409) → `activeConfig.payment.apiVersion`
    - `{ type: "terms_of_use", url: "https://example.com/terms" }` → `activeConfig.storefront.termsUrl`
    - `{ type: "privacy_policy", url: "https://example.com/privacy" }` → `activeConfig.storefront.privacyUrl`
    - `currency: "USD"` in success result (line 487) → `activeConfig.payment.currency`
  - Depends on: 4.1, 3.2

---

## Phase 5: Switch Tooling [COMPLETE]

- [x] 5.1 Create `scripts/set-customer.mjs` — customer switcher script
  - Goal: One command rewrites `src/customer.ts` to point to a named customer profile.
  - Input: Customer ID from `process.argv[2]`; `customers/` directory convention from Phase 2
  - Output: `scripts/set-customer.mjs` that:
    1. Validates the argument is provided (exit 1 with usage message if not)
    2. Writes `src/customer.ts` with: `export { config as activeConfig } from "../customers/${customerId}/config";\n`
    3. Logs `Active customer set to: ${customerId}`
  - Depends on: 2.1, 2.2

- [x] 5.2 Create per-customer wrangler config files
  - Goal: Each customer deploys to its own named Cloudflare Worker with appropriate vars shape.
  - Input: `wrangler.jsonc` (current base config); customer worker names
  - Output: Two new files:
    - `wrangler.worldpay.jsonc`: inherits all base settings, overrides `"name": "chatgpt-acp-app"` (existing), preserves `vars` shape with empty placeholders
    - `wrangler.acme-demo.jsonc`: same structure but `"name": "acme-demo-acp-app"`, separate vars shape
  - Note: Both files copy the full `durable_objects`, `migrations`, and `compatibility_*` fields from base; there is no "extends" in Wrangler jsonc. The base `wrangler.jsonc` is left intact as the local dev default.
  - Depends on: 2.1, 2.2

- [x] 5.3 Add npm scripts to `package.json`
  - Goal: Developer runs one command to switch + deploy.
  - Input: `package.json` existing scripts; `scripts/set-customer.mjs` from 5.1; wrangler configs from 5.2
  - Output: Add to `"scripts"`:
    ```json
    "set-customer": "node scripts/set-customer.mjs",
    "deploy:worldpay": "node scripts/set-customer.mjs worldpay && wrangler deploy --config wrangler.worldpay.jsonc",
    "deploy:acme-demo": "node scripts/set-customer.mjs acme-demo && wrangler deploy --config wrangler.acme-demo.jsonc"
    ```
  - Depends on: 5.1, 5.2

---

## Phase 6: Documentation [COMPLETE]

- [x] 6.1 Update `README.md` with customer-switching workflow
  - Goal: Any developer can onboard a new customer or deploy an existing one in under 5 minutes.
  - Input: `README.md` (current); completed Phases 1–5
  - Output: New section **"Customer Profiles"** added to README covering:
    1. How to switch and deploy an existing customer: `npm run deploy:worldpay`
    2. How to create a new customer profile: copy `customers/worldpay/config.ts` → `customers/<new-id>/config.ts`, update values, add `wrangler.<new-id>.jsonc`, add `deploy:<new-id>` script
    3. Schema reference: describe each top-level `CustomerConfig` field and what it controls
    4. Cloudflare secrets: remind that `WORLDPAY_API_KEY`, `CHALLENGE_CONTENT`, and `MERCHANT_ID` must be set via `wrangler secret put` for each worker name
  - Depends on: 5.3

---

## Dependency Graph

```
1.1 ─── 1.2
 │
 ├── 2.1
 ├── 2.2
 ├── 3.1 ─── 4.1 ─── 4.2
 └── 3.2 ─── 4.2
         └── 3.3

2.1 ──┬── 5.1 ──┬── 5.3
2.2 ──┘    5.2 ─┘

5.3 ── 6.1
```

---

## Parallelization Summary

- **Phase 1**: Sequential — 1.2 references the interface type from 1.1
- **Phase 2**: Parallel — 2.1 and 2.2 are independent profile files; both need only the `CustomerConfig` type from 1.1
- **Phase 3**: Sequential within phase — all three tasks touch `constants.ts`; 3.3 is a cleanup step after 3.1 and 3.2
- **Phase 4**: Sequential — 4.2 modifies the same file as 4.1 and depends on `getProducts` from 3.2
- **Phase 5**: 5.1 and 5.2 are parallel; 5.3 depends on both
- **Phase 6**: Sequential after all code phases

---

## Notes

- 2026-04-22: `CHALLENGE_CONTENT` exported in `constants.ts` (line 536) is **not imported** in `index.ts`; the runtime reads `env.CHALLENGE_CONTENT` exclusively (line 571). The constant is dead code and safe to remove in Phase 3. `ref:ses_24adec89dffeocJoJidNEDCdj9`
- 2026-04-22: Two product lists exist — client-side JS array inside `SHOP_HTML` and the server-side `PRODUCTS` export. After Phase 3, both derive from `config.products`, eliminating drift. `ref:ses_24adec89dffeocJoJidNEDCdj9`
- 2026-04-22: Base `wrangler.jsonc` is preserved untouched as the local dev default (`npm run dev`). Per-customer files are deploy-only configs.
- 2026-04-22: The `Product` interface in `src/types.ts` (`price: number`) is intentionally preserved; `getProducts` adapts `CustomerProductConfig.price.amount` to it. No existing `LineItem` or `CheckoutSessionState` types need to change.
- 2026-04-22: Worldpay API key, merchant ID, and challenge content remain as Cloudflare secrets (`wrangler secret put`) and are never committed to source. `CustomerConfig.challengeContent` is a local dev convenience value only.
- 2026-04-22: Code review identified C-1 (committed token in worldpay config), M-1 (dead image constants in constants.ts), M-2 (raw emptyCartText injection), M-4 (missing customer ID validation in set-customer script), m-2 (inconsistent satisfies usage), m-4 (missing wrangler schema), m-7 (customers/ not in tsconfig include). All critical, major, and selected minor issues fixed. ref:ses_24ac6e209ffeWAYcfh550drqC0
