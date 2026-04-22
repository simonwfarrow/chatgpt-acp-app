import type { CustomerConfig } from "../../src/types";

export const config = {
	brand: {
		title: "Acme Tech Store",
		subtitle: "Premium gadgets for developers",
		cartLabel: "My Basket",
		checkoutButtonText: "Pay Now",
		emptyCartText: "Your basket is empty",
	},
	products: [
		{
			id: "usb-hub",
			name: "7-Port USB Hub",
			description: "Expand your connectivity",
			price: {
				amount: 35.00,
				currency: "GBP",
			},
			// Circuit/hub icon: teal-themed SVG with 7 USB port outlines around a dark hub body
			imageBase64:
				"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSIxNSIgeT0iMzgiIHdpZHRoPSI3MCIgaGVpZ2h0PSIyNCIgcng9IjQiIGZpbGw9IiMwZDVjNGEiIHN0cm9rZT0iIzE0YTg4MiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iMjQiIHk9IjI4IiB3aWR0aD0iMTAiIGhlaWdodD0iMTEiIHJ4PSIyIiBmaWxsPSJub25lIiBzdHJva2U9IiMxNGE4ODIiIHN0cm9rZS13aWR0aD0iMiIvPjxyZWN0IHg9IjM4IiB5PSIyOCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjExIiByeD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSI1MiIgeT0iMjgiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMSIgcng9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE0YTg4MiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iNjYiIHk9IjI4IiB3aWR0aD0iMTAiIGhlaWdodD0iMTEiIHJ4PSIyIiBmaWxsPSJub25lIiBzdHJva2U9IiMxNGE4ODIiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIyOSIgeTE9IjM4IiB4Mj0iMjkiIHkyPSIzOSIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxsaW5lIHgxPSI0MyIgeTE9IjM4IiB4Mj0iNDMiIHkyPSIzOSIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxsaW5lIHgxPSI1NyIgeTE9IjM4IiB4Mj0iNTciIHkyPSIzOSIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxsaW5lIHgxPSI3MSIgeTE9IjM4IiB4Mj0iNzEiIHkyPSIzOSIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxyZWN0IHg9IjI0IiB5PSI2MSIgd2lkdGg9IjEwIiBoZWlnaHQ9IjExIiByeD0iMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIzOCIgeT0iNjEiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMSIgcng9IjIiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzE0YTg4MiIgc3Ryb2tlLXdpZHRoPSIyIi8+PHJlY3QgeD0iNTIiIHk9IjYxIiB3aWR0aD0iMTAiIGhlaWdodD0iMTEiIHJ4PSIyIiBmaWxsPSJub25lIiBzdHJva2U9IiMxNGE4ODIiIHN0cm9rZS13aWR0aD0iMiIvPjxsaW5lIHgxPSIyOSIgeTE9IjYxIiB4Mj0iMjkiIHkyPSI2MiIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxsaW5lIHgxPSI0MyIgeTE9IjYxIiB4Mj0iNDMiIHkyPSI2MiIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxsaW5lIHgxPSI1NyIgeTE9IjYxIiB4Mj0iNTciIHkyPSI2MiIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjgzIiBjeT0iNTAiIHI9IjQiIGZpbGw9IiNiMmYwZTMiLz48L3N2Zz4=",
		},
		{
			id: "mech-keyboard",
			name: "Mechanical Keyboard",
			description: "Tactile precision typing",
			price: {
				amount: 120.00,
				currency: "GBP",
			},
			// Keyboard icon: teal-themed SVG with 3 rows of keycap rectangles and a wide spacebar
			imageBase64:
				"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB4PSI4IiB5PSIyOCIgd2lkdGg9Ijg0IiBoZWlnaHQ9IjQ0IiByeD0iNSIgZmlsbD0iIzBkNWM0YSIgc3Ryb2tlPSIjMTRhODgyIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCB4PSIxNCIgeT0iMzQiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjMTRhODgyIi8+PHJlY3QgeD0iMjUiIHk9IjM0IiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiByeD0iMiIgZmlsbD0iIzE0YTg4MiIvPjxyZWN0IHg9IjM2IiB5PSIzNCIgd2lkdGg9IjkiIGhlaWdodD0iOSIgcng9IjIiIGZpbGw9IiMxNGE4ODIiLz48cmVjdCB4PSI0NyIgeT0iMzQiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjMTRhODgyIi8+PHJlY3QgeD0iNTgiIHk9IjM0IiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiByeD0iMiIgZmlsbD0iIzE0YTg4MiIvPjxyZWN0IHg9IjY5IiB5PSIzNCIgd2lkdGg9IjkiIGhlaWdodD0iOSIgcng9IjIiIGZpbGw9IiMxNGE4ODIiLz48cmVjdCB4PSI4MCIgeT0iMzQiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjYjJmMGUzIi8+PHJlY3QgeD0iMTQiIHk9IjQ2IiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiByeD0iMiIgZmlsbD0iIzE0YTg4MiIvPjxyZWN0IHg9IjI1IiB5PSI0NiIgd2lkdGg9IjkiIGhlaWdodD0iOSIgcng9IjIiIGZpbGw9IiMxNGE4ODIiLz48cmVjdCB4PSIzNiIgeT0iNDYiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjMTRhODgyIi8+PHJlY3QgeD0iNDciIHk9IjQ2IiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiByeD0iMiIgZmlsbD0iIzE0YTg4MiIvPjxyZWN0IHg9IjU4IiB5PSI0NiIgd2lkdGg9IjkiIGhlaWdodD0iOSIgcng9IjIiIGZpbGw9IiMxNGE4ODIiLz48cmVjdCB4PSI2OSIgeT0iNDYiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjMTRhODgyIi8+PHJlY3QgeD0iODAiIHk9IjQ2IiB3aWR0aD0iOSIgaGVpZ2h0PSI5IiByeD0iMiIgZmlsbD0iIzE0YTg4MiIvPjxyZWN0IHg9IjE0IiB5PSI1OCIgd2lkdGg9IjkiIGhlaWdodD0iOSIgcng9IjIiIGZpbGw9IiMxNGE4ODIiLz48cmVjdCB4PSIyNSIgeT0iNTgiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjYjJmMGUzIi8+PHJlY3QgeD0iMzYiIHk9IjU4IiB3aWR0aD0iMzMiIGhlaWdodD0iOSIgcng9IjIiIGZpbGw9IiMxNGE4ODIiLz48cmVjdCB4PSI3MSIgeT0iNTgiIHdpZHRoPSI5IiBoZWlnaHQ9IjkiIHJ4PSIyIiBmaWxsPSIjYjJmMGUzIi8+PHJlY3QgeD0iODIiIHk9IjU4IiB3aWR0aD0iNyIgaGVpZ2h0PSI5IiByeD0iMiIgZmlsbD0iIzE0YTg4MiIvPjwvc3ZnPg==",
		},
	],
	theme: {
		primaryColor: "#0d5c4a",
		primaryFocusColor: "#14a882",
		primaryHighlightColor: "#b2f0e3",
		primarySubtleColor: "#e8faf6",
		fontFamilyDisplay: '"Montserrat","Helvetica","Arial","sans-serif","system-ui","-apple-system"',
		fontFamilyDefault: '"Nunito Sans","Helvetica","Arial","sans-serif","system-ui","-apple-system"',
	},
	storefront: {
		workerDomain: "https://acme-demo-acp-app.your-account.workers.dev",
		widgetTitle: "Open Acme Tech Store",
		termsUrl: "https://acme-demo.example.com/terms",
		privacyUrl: "https://acme-demo.example.com/privacy",
	},
	payment: {
		narrative: "Acme Tech Store",
		merchantEntity: "acme-default",
		currency: "GBP",
		apiVersion: "2024-06-01",
	},
	challengeContent: "",
} satisfies CustomerConfig;
