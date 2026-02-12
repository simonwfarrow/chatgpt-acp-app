import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Agent, getAgentByName } from "agents";
import {
	createMcpHandler,
	type TransportState,
	WorkerTransport,
} from "agents/mcp";
import { PRODUCTS, SHOP_HTML } from "./constants";
import { logger } from "./logger";
import { completeCheckoutSchema, createCheckoutSessionSchema } from "./types";

export class MyMCP extends Agent<Env> {
	server = new McpServer({
		name: "shop-app",
		version: "0.1.0",
	});

	// Store transports for different sessions
	transports = new Map<string, WorkerTransport>();

	async onMcpRequest(request: Request) {
		const sessionId = request.headers.get("x-mcp-session-id") || "unknown";
		const requestId = crypto.randomUUID();
		const startTime = Date.now();

		// Create a logger with session context
		const log = logger.child({ sessionId, requestId });

		// Log incoming MCP request
		let requestBody: unknown;
		try {
			const clone = request.clone();
			requestBody = await clone.json();
			log.logRequest(request, requestBody, {
				context: { sessionId, requestId, component: "mcp" },
			});
		} catch {
			// Body might not be JSON
			log.logRequest(request, undefined, {
				context: { sessionId, requestId, component: "mcp" },
			});
		}

		// Robustness fix: If the client sends an "initialize" request, force a fresh transport.
		const body = requestBody as { method?: string } | undefined;
		if (body?.method === "initialize") {
			log.info("mcp_initialize_reset", {
				message: "Received initialize, resetting transport",
			});
			this.transports.delete(sessionId);
		}

		let transport = this.transports.get(sessionId);
		if (!transport) {
			log.info("mcp_transport_created", {
				message: "Creating new transport for session",
			});
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

		const response = await createMcpHandler(this.server as any, {
			transport: transport,
		})(request, this.env, this.ctx as unknown as ExecutionContext);

		// Log outgoing MCP response
		const durationMs = Date.now() - startTime;
		try {
			const responseClone = response.clone();
			const responseBody = await responseClone.json();
			log.logResponse(response.status, responseBody, durationMs, {
				context: { sessionId, requestId, component: "mcp" },
			});
		} catch {
			log.logResponse(response.status, undefined, durationMs, {
				context: { sessionId, requestId, component: "mcp" },
			});
		}

		return response;
	}

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		this.server.registerResource(
			"Open Worldpay Swag Shop",
			"ui://widget/shop.html",
			{},
			async () => {
				logger.info("mcp_resource_accessed", {
					context: { resourceName: "Open Worldpay Swag Shop" },
				});
				return {
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
				};
			},
		);

		this.server.registerTool(
			"create_checkout_session",
			{
				title: "Create checkout session",
				description:
					"Creates a checkout session with items from the shopping cart.",
				inputSchema: createCheckoutSessionSchema,
				_meta: {
					"openai/outputTemplate": "ui://widget/shop.html",
					"openai/toolInvocation/invoking": "Creating checkout session",
					"openai/toolInvocation/invoked": "Created checkout session",
				},
			},
			async (params: any) => {
				const startTime = Date.now();
				const toolLog = logger.child({ toolName: "create_checkout_session" });

				toolLog.logToolInvocation("create_checkout_session", params);

				const { cart = {} } = params as { cart?: Record<string, number> };

				// Build line items from cart or use default bundle
				let line_items: any[] = [];
				let totalAmount = 0;

				if (Object.keys(cart).length > 0) {
					// Build from cart
					let lineItemIndex = 1;
					for (const [productId, quantity] of Object.entries(cart)) {
						const product = PRODUCTS.find((p) => p.id === productId);
						if (product && quantity > 0) {
							const priceInCents = Math.round(product.price * 100);
							const itemTotal = priceInCents * quantity;
							line_items.push({
								id: `li_${lineItemIndex}`,
								quantity: quantity,
								base_amount: itemTotal,
								subtotal: itemTotal,
								total_amount: itemTotal,
								total: itemTotal,
								item: {
									id: productId,
									name: product.name,
									quantity: quantity,
									description: product.name,
									price: {
										amount: priceInCents,
										currency: "USD",
									},
								},
							});
							totalAmount += itemTotal;
							lineItemIndex++;
						}
					}
				} else {
					// Default bundle (backward compatibility)
					line_items = [
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
					totalAmount = 7500;
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

				const result = {
					content: [
						{ type: "text" as const, text: "Checkout session created" },
					],
					structuredContent: session,
				};

				const durationMs = Date.now() - startTime;
				toolLog.logToolResult("create_checkout_session", result, durationMs);

				return result;
			},
		);

		// Complete checkout tool - processes payment via Worldpay delegate token
		this.server.registerTool(
			"complete_checkout",
			{
				title: "Complete checkout",
				description:
					"Completes the checkout by processing payment via Worldpay.",
				inputSchema: completeCheckoutSchema,
				_meta: {
					"openai/toolInvocation/invoking": "Processing payment",
					"openai/toolInvocation/invoked": "Payment processed",
				},
			},
			async (params: any) => {
				const startTime = Date.now();
				const { checkout_session_id, buyer, payment_data } = params as {
					checkout_session_id: string;
					buyer?: { email?: string };
					payment_data: { token: string };
				};

				const toolLog = logger.child({
					toolName: "complete_checkout",
					checkoutSessionId: checkout_session_id,
				});

				// Log tool invocation with redacted payment data
				toolLog.logToolInvocation("complete_checkout", {
					checkout_session_id,
					buyer,
					payment_data: {
						token: payment_data.token
							? `${payment_data.token.substring(0, 50)}...[TRUNCATED]`
							: undefined,
					},
				});

				// Build Worldpay Payments API request
				const worldpayRequest = {
					transactionReference: checkout_session_id,
					merchant: { entity: "default" },
					instruction: {
						method: "card",
						paymentInstrument: {
							type: "delegate",
							sessionHref: payment_data.token,
						},
						value: {
							currency: "USD",
							amount: 7500, // Hardcoded for POC - matches create_checkout_session
						},
						narrative: {
							line1: "Worldpay Swag Shop",
						},
						...(buyer?.email && {
							customer: { email: buyer.email },
						}),
					},
				};

				const worldpayUrl = "https://try.access.worldpay.com/api/payments";

				try {
					// Log outgoing Worldpay API request
					const apiStartTime = Date.now();
					toolLog.logApiRequest(
						worldpayUrl,
						"POST",
						{
							...worldpayRequest,
							instruction: {
								...worldpayRequest.instruction,
								paymentInstrument: {
									type: "delegate",
									sessionHref: "[REDACTED]",
								},
							},
						},
						{
							"Content-Type": "application/json",
							Authorization: "[REDACTED]",
							"WP-Api-Version": "2024-06-01",
						},
					);

					const response = await fetch(worldpayUrl, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Basic ${this.env.WORLDPAY_API_KEY}`,
							"WP-Api-Version": "2024-06-01",
						},
						body: JSON.stringify(worldpayRequest),
					});

					const result = (await response.json()) as {
						outcome?: string;
						riskFactors?: unknown[];
						paymentInstrument?: unknown;
						_links?: unknown;
						errorName?: string;
						message?: string;
					};

					const apiDurationMs = Date.now() - apiStartTime;

					// Log Worldpay API response
					toolLog.logApiResponse(
						worldpayUrl,
						response.status,
						result,
						apiDurationMs,
					);

					if (!response.ok || result.outcome !== "authorized") {
						const errorResult = {
							content: [
								{
									type: "text" as const,
									text: `Payment failed: ${result.errorName || result.outcome || "Unknown error"}`,
								},
							],
							structuredContent: {
								id: checkout_session_id,
								status: "failed",
								error: {
									code: "payment_declined",
									message: result.message || "Payment was not authorized",
								},
							},
							isError: true,
						};

						const durationMs = Date.now() - startTime;
						toolLog.logToolResult("complete_checkout", errorResult, durationMs);
						toolLog.warn("checkout_payment_failed", {
							message: "Payment was not authorized",
							worldpayOutcome: result.outcome,
							worldpayError: result.errorName,
						});

						return errorResult;
					}

					// Payment successful
					const orderId = `order_${Math.random().toString(36).slice(2)}`;
					const successResult = {
						content: [
							{ type: "text" as const, text: `Order completed: ${orderId}` },
						],
						structuredContent: {
							id: checkout_session_id,
							status: "completed",
							currency: "USD",
							order: {
								id: orderId,
								checkout_session_id: checkout_session_id,
								permalink_url: "",
							},
						},
					};

					const durationMs = Date.now() - startTime;
					toolLog.logToolResult("complete_checkout", successResult, durationMs);
					toolLog.info("checkout_completed", {
						message: "Payment successfully processed",
						orderId,
						worldpayOutcome: result.outcome,
					});

					return successResult;
				} catch (error) {
					const durationMs = Date.now() - startTime;
					toolLog.logError("worldpay_api_error", error, {
						context: { checkoutSessionId: checkout_session_id },
					});

					const errorResult = {
						content: [
							{ type: "text" as const, text: "Payment processing failed" },
						],
						structuredContent: {
							id: checkout_session_id,
							status: "failed",
							error: {
								code: "payment_error",
								message: "Failed to process payment",
							},
						},
						isError: true,
					};

					toolLog.logToolResult("complete_checkout", errorResult, durationMs);
					return errorResult;
				}
			},
		);
	}
}

export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
		const requestId = crypto.randomUUID();
		const startTime = Date.now();
		const url = new URL(request.url);

		// Create request-scoped logger
		const log = logger.child({
			requestId,
			method: request.method,
			path: url.pathname,
		});

		// Log all incoming requests
		log.logRequest(request, undefined, {
			context: { requestId, component: "fetch_handler" },
		});

		try {
			if (url.pathname === "/") {
				const response = new Response("Shop MCP server", {
					headers: { "content-type": "text/plain" },
				});
				const durationMs = Date.now() - startTime;
				log.logResponse(response.status, "Shop MCP server", durationMs);
				return response;
			}

			if (url.pathname === "/.well-known/openai-apps-challenge") {
				const response = new Response(env.CHALLENGE_CONTENT, {
					headers: { "content-type": "text/plain" },
				});
				const durationMs = Date.now() - startTime;
				log.logResponse(response.status, "[CHALLENGE_CONTENT]", durationMs);
				return response;
			}

			const sessionId =
				request.headers.get("mcp-session-id") ?? crypto.randomUUID();

			log.info("mcp_request_routing", {
				message: "Routing request to MCP agent",
				context: { requestId, sessionId },
			});

			// Check if we need to pass headers to the agent
			const agentRequest = new Request(request);
			if (!request.headers.has("x-mcp-session-id")) {
				agentRequest.headers.set("x-mcp-session-id", sessionId);
			}

			// Use a fixed session ID for the Agent itself to ensure all requests route to the same DO instance
			// The individual MCP sessions are multiplexed inside this DO instance
			const agent = await getAgentByName(env.MCP_OBJECT, "global-session");
			const response = await agent.onMcpRequest(agentRequest);

			const durationMs = Date.now() - startTime;
			log.info("mcp_request_completed", {
				message: "MCP request completed",
				durationMs,
				context: { requestId, sessionId, responseStatus: response.status },
			});

			return response;
		} catch (error) {
			const durationMs = Date.now() - startTime;
			log.logError("fetch_handler_error", error, { durationMs });

			return new Response("Internal Server Error", {
				status: 500,
				headers: { "content-type": "text/plain" },
			});
		}
	},
};
