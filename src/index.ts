import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Agent, getAgentByName } from "agents";
import {
	createMcpHandler,
	type TransportState,
	WorkerTransport,
} from "agents/mcp";
import type { z } from "zod";
import { CHALLENGE_CONTENT, PRODUCTS, SHOP_HTML } from "./constants";
import { addToCartSchema, completeCheckoutSchema } from "./types";

const STATE_KEY = "mcp-transport-state";

type ShopState = {
	cart: string[];
};

export class MyMCP extends Agent<Env, ShopState> {
	initialState: ShopState = {
		cart: [],
	};

	server = new McpServer({
		name: "shop-app",
		version: "0.1.0",
	});

	transport = new WorkerTransport({
		sessionIdGenerator: () => this.name,
		storage: {
			get: async () => {
				return await this.ctx.storage.get<TransportState>(STATE_KEY);
			},
			set: async (state: TransportState) => {
				await this.ctx.storage.put<TransportState>(STATE_KEY, state);
			},
		},
	});

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
			"add_to_cart",
			{
				title: "Add to cart",
				description: "Adds a product to the cart by ID.",
				inputSchema: addToCartSchema.shape,
				_meta: {
					"openai/outputTemplate": "ui://widget/shop.html",
					"openai/toolInvocation/invoking": "Adding to cart",
					"openai/toolInvocation/invoked": "Added to cart",
				},
			},
			async (args: z.infer<typeof addToCartSchema>) => {
				const productId = args.productId;
				const product = PRODUCTS.find((p) => p.id === productId);

				if (!product) {
					return {
						content: [
							{
								type: "text" as const,
								text: `Product "${productId}" not found.`,
							},
						],
						isError: true,
					};
				}

				const cart = this.state.cart;
				const newCart = [...cart, productId];
				this.setState({ ...this.state, cart: newCart });
				return this.replyWithCart(newCart, `Added ${product.name} to cart.`);
			},
		);

		this.server.registerTool(
			"reset_cart",
			{
				title: "Reset cart",
				description: "Clears the shopping cart.",
				inputSchema: {},
				_meta: {
					"openai/outputTemplate": "ui://widget/shop.html",
					"openai/toolInvocation/invoking": "Resetting cart",
					"openai/toolInvocation/invoked": "Reset cart",
				},
			},
			async () => {
				this.setState({ ...this.state, cart: [] });
				return this.replyWithCart([], "Cart cleared.");
			},
		);

		this.server.registerTool(
			"create_checkout_session",
			{
				title: "Create checkout session",
				description: "Creates a checkout session for the current cart.",
				inputSchema: {},
				_meta: {
					"openai/toolInvocation/invoking": "Creating checkout session",
					"openai/toolInvocation/invoked": "Created checkout session",
				},
			},
			async () => {
				const cart = this.state.cart;
				const line_items = cart
					.map((id, index) => {
						const p = PRODUCTS.find((prod) => prod.id === id);
						if (!p) return null;
						const amount = Math.round(p.price * 100);
						return {
							id: `li_${index}_${Date.now()}`,
							quantity: 1,
							base_amount: amount,
							subtotal: amount,
							total_amount: amount,
							total: amount,
							item: {
								id: p.id,
								name: p.name,
								quantity: 1,
								description: p.name,
								price: {
									amount: amount,
									currency: "USD",
								},
							},
						};
					})
					.filter((item): item is NonNullable<typeof item> => Boolean(item));

				const totalAmount = line_items.reduce(
					(sum, item) => sum + item.base_amount,
					0,
				);

				if (line_items.length === 0 || totalAmount === 0) {
					return {
						content: [
							{ type: "text" as const, text: "Cart is empty or invalid." },
						],
						isError: true,
					};
				}

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

		this.server.registerTool(
			"complete_checkout",
			{
				title: "Complete checkout",
				description: "Handles success callback and returns order confirmation.",
				inputSchema: completeCheckoutSchema.shape,
				_meta: {
					"openai/toolInvocation/invoking": "Completing checkout",
					"openai/toolInvocation/invoked": "Completed checkout",
				},
			},
			async (args: z.infer<typeof completeCheckoutSchema>) => {
				this.setState({ ...this.state, cart: [] });
				return {
					content: [{ type: "text" as const, text: "Order confirmed" }],
					structuredContent: {
						status: "confirmed",
						order: {
							id: `order_${Math.random().toString(36).slice(2)}`,
							checkout_session_id: args.checkout_session_id,
							status: "completed",
						},
					},
				};
			},
		);
	}

	async onMcpRequest(request: Request) {
		return createMcpHandler(this.server as any, {
			transport: this.transport,
		})(request, this.env, this.ctx as unknown as ExecutionContext);
	}

	private replyWithCart(cart: string[], message?: string) {
		return {
			content: message ? [{ type: "text" as const, text: message }] : [],
			structuredContent: { cart: cart },
		};
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
			return new Response(CHALLENGE_CONTENT, {
				headers: { "content-type": "text/plain" },
			});
		}

		const sessionId =
			request.headers.get("mcp-session-id") ?? crypto.randomUUID();
		const agent = await getAgentByName(env.MCP_OBJECT, sessionId); 
		return await agent.onMcpRequest(request);
	},
};
