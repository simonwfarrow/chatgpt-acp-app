import { z } from "zod";

export const addToCartSchema = z.object({
	productId: z.string(),
});

export const createCheckoutSessionSchema = z.object({
	cart: z.record(z.string(), z.number()).optional(),
});

export const completeCheckoutSchema = z.object({
	checkout_session_id: z.string(),
	buyer: z
		.object({
			email: z.string().optional(),
		})
		.optional(),
	payment_data: z
		.object({
			token: z.string(), // sessionHref from Worldpay delegate token
			billing_address: z.any().optional(),
		})
		.passthrough(),
});

export interface Product {
	id: string;
	name: string;
	price: number;
}

export interface LineItem {
	id: string;
	quantity: number;
	base_amount: number;
	subtotal: number;
	total_amount: number;
	total: number;
	item: {
		id: string;
		name: string;
		quantity: number;
		description: string;
		price: {
			amount: number;
			currency: string;
		};
	};
}

export interface CheckoutSessionState {
	checkoutSessionId: string;
	currency: string;
	totalAmount: number;
	lineItems: LineItem[];
	status: "ready_for_payment" | "completed" | "failed";
}

export interface CustomerProductConfig {
	id: string;
	name: string;
	description: string;
	price: {
		amount: number; // dollars (e.g. 20.00); converted to cents in index.ts
		currency: string; // ISO 4217 e.g. "USD"
	};
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
		primaryColor: string;          // maps to CSS --color-brand-primary
		primaryFocusColor: string;     // maps to CSS --color-brand-primary-focus
		primaryHighlightColor: string; // maps to CSS --color-brand-primary-highlight
		primarySubtleColor: string;    // maps to CSS --color-brand-primary-subtle
		fontFamilyDisplay: string;     // CSS font-family string for headings
		fontFamilyDefault: string;     // CSS font-family string for body text
	};
	storefront: {
		workerDomain: string;  // e.g. "https://chatgpt-acp-app.simonwfarrow.workers.dev"
		widgetTitle: string;   // MCP resource title shown in the agent UI
		termsUrl: string;
		privacyUrl: string;
	};
	payment: {
		narrative: string;       // Worldpay instruction.narrative.line1
		merchantEntity: string;  // Worldpay merchant.entity
		currency: string;        // ISO 4217 e.g. "USD"
		apiVersion: string;      // WP-Api-Version header e.g. "2024-06-01"
	};
	challengeContent: string; // dev-time fallback; production reads env.CHALLENGE_CONTENT
}
