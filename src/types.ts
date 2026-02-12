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
