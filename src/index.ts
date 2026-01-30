import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";
import { SHOP_HTML, CHALLENGE_CONTENT, PRODUCTS } from "./constants";
import { addToCartSchema, completeCheckoutSchema } from "./types";

export class MyMCP extends McpAgent {
	// @ts-ignore
	server = new McpServer({
		name: "shop-app",
		version: "0.1.0",
	});

	cart: string[] = [];

	private replyWithCart(message?: string) {
		return {
			content: message ? [{ type: "text" as const, text: message }] : [],
			structuredContent: { cart: this.cart },
		};
	}

	async init() {
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
						_meta: { "openai/widgetPrefersBorder": true 
          						"openai/widgetDomain": "https://chatgpt-acp-app.simonwfarrow.workers.dev",
         						 "openai/widgetCSP": {
									connect_domains: ["https://chatgpt-acp-app.simonwfarrow.workers.dev"], // example API domain
									resource_domains: ["https://chatgpt-acp-app.simonwfarrow.workers.dev"], // example CDN allowlist
									
								},
						},
					},
				],
			})
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
						content: [{ type: "text" as const, text: `Product "${productId}" not found.` }],
						isError: true,
					};
				}

				this.cart.push(productId);
				return this.replyWithCart(`Added ${product.name} to cart.`);
			}
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
				this.cart = [];
				return this.replyWithCart("Cart cleared.");
			}
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
				const line_items = this.cart.map((id, index) => {
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
								currency: "USD"
							}
						}
					};
				}).filter((item): item is NonNullable<typeof item> => Boolean(item));

				const totalAmount = line_items.reduce((sum, item) => sum + item.base_amount, 0);

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
					content: [{ type: "text" as const, text: "Checkout session created" }],
					structuredContent: session,
				};
			}
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
				this.cart = [];
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
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		if (url.pathname === "/") {
			return new Response("Shop MCP server", { headers: { "content-type": "text/plain" } });
		}

		if (url.pathname === "/.well-known/openai-apps-challenge") {
			return new Response(CHALLENGE_CONTENT, { headers: { "content-type": "text/plain" } });
		}

		return new Response("Not found", { status: 404 });
	},
};
