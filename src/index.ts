import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Agent, getAgentByName } from "agents";
import {
	createMcpHandler,
	type TransportState,
	WorkerTransport,
} from "agents/mcp";
import { CHALLENGE_CONTENT, SHOP_HTML } from "./constants";

export class MyMCP extends Agent<Env> {
	server = new McpServer({
		name: "shop-app",
		version: "0.1.0",
	});

	// Store transports for different sessions
	transports = new Map<string, WorkerTransport>();

	async onMcpRequest(request: Request) {
		const sessionId = request.headers.get("x-mcp-session-id") || "unknown";

		// Robustness fix: If the client sends an "initialize" request, force a fresh transport.
		// This handles cases where the client (like ChatGPT) reconnects or resets its state
		// but sends the same session ID (or we mapped it to the same session), preventing
		// the "Server already initialized" error.
		try {
			const clone = request.clone();
			const body = (await clone.json()) as { method?: string };
			if (body?.method === "initialize") {
				console.log(`[${sessionId}] Received initialize, resetting transport.`);
				this.transports.delete(sessionId);
			}
		} catch {
			// Ignore body parsing errors (e.g. if it's not JSON)
		}

		let transport = this.transports.get(sessionId);
		if (!transport) {
			transport = new WorkerTransport({
				sessionIdGenerator: () => sessionId,
				enableJsonResponse: true,
				storage: {
					get: async () => {
						return await this.ctx.storage.get<TransportState>(
							`transport-${sessionId}`,
						);
					},
					set: async (state: TransportState) => {
						await this.ctx.storage.put<TransportState>(
							`transport-${sessionId}`,
							state,
						);
					},
				},
			});
			this.transports.set(sessionId, transport);
		}

		return createMcpHandler(this.server as any, {
			transport: transport,
		})(request, this.env, this.ctx as unknown as ExecutionContext);
	}

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		this.server.registerResource(
			"Open Worldpay Swag Shop",
			"ui://widget/shop.html",
			{},
			async () => ({
				contents: [
					{
						uri: "ui://widget/shop.html",
						mimeType: "text/html+skybridge",
						text: SHOP_HTML,
						_meta: {
							"openai/widgetPrefersBorder": true,
							"openai/widgetDomain":
								"https://chatgpt-acp-app.simonwfarrow.workers.dev",
							"openai/widgetCSP": {
								connect_domains: [
									"https://chatgpt-acp-app.simonwfarrow.workers.dev",
								],
								resource_domains: [
									"https://chatgpt-acp-app.simonwfarrow.workers.dev",
								],
							},
						},
					},
				],
			}),
		);

		this.server.registerTool(
			"create_checkout_session",
			{
				title: "Create checkout session",
				description:
					"Creates a checkout session with pre-selected items (Hoodie and T-Shirt).",
				inputSchema: {},
				_meta: {
					"openai/outputTemplate": "ui://widget/shop.html",
					"openai/toolInvocation/invoking": "Creating checkout session",
					"openai/toolInvocation/invoked": "Created checkout session",
				},
			},
			async () => {
				// Hardcoded line items for simplicity
				const line_items = [
					{
						id: "li_1",
						quantity: 1,
						base_amount: 5000,
						subtotal: 5000,
						total_amount: 5000,
						total: 5000,
						item: {
							id: "prod_hoodie",
							name: "Worldpay Hoodie",
							quantity: 1,
							description: "Cozy developer hoodie",
							price: {
								amount: 5000,
								currency: "USD",
							},
						},
					},
					{
						id: "li_2",
						quantity: 1,
						base_amount: 2500,
						subtotal: 2500,
						total_amount: 2500,
						total: 2500,
						item: {
							id: "prod_tshirt",
							name: "Worldpay T-Shirt",
							quantity: 1,
							description: "Classic logo tee",
							price: {
								amount: 2500,
								currency: "USD",
							},
						},
					},
				];

				const totalAmount = 7500;

				const session = {
					id: `sess_${Math.random().toString(36).slice(2)}`,
					payment_provider: {
						provider: "worldpay",
						merchant_id: this.env.MERCHANT_ID,
						supported_payment_methods: ["card"],
					},
					status: "ready_for_payment",
					currency: "USD",
					payment_mode: "test",
					line_items: line_items,
					totals: [
						{ type: "total", display_text: "Total", amount: totalAmount },
					],
					links: [
						{ type: "terms_of_use", url: "https://example.com/terms" },
						{ type: "privacy_policy", url: "https://example.com/privacy" },
					],
				};

				return {
					content: [
						{ type: "text" as const, text: "Checkout session created" },
					],
					structuredContent: session,
				};
			},
		);
	}
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/") {
			return new Response("Shop MCP server", {
				headers: { "content-type": "text/plain" },
			});
		}

		if (url.pathname === "/.well-known/openai-apps-challenge") {
			return new Response(this.env.CHALLENGE_CONTENT, {
				headers: { "content-type": "text/plain" },
			});
		}

		const sessionId =
			request.headers.get("mcp-session-id") ?? crypto.randomUUID();

		// Check if we need to pass headers to the agent
		const agentRequest = new Request(request);
		if (!request.headers.has("x-mcp-session-id")) {
			agentRequest.headers.set("x-mcp-session-id", sessionId);
		}

		// Use a fixed session ID for the Agent itself to ensure all requests route to the same DO instance
		// The individual MCP sessions are multiplexed inside this DO instance
		const agent = await getAgentByName(env.MCP_OBJECT, "global-session");
		return await agent.onMcpRequest(agentRequest);
	},
};
