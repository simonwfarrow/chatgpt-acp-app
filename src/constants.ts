export const SHOP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop Widget</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            padding: 2rem;
            color: #1f2937;
            text-align: center;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #111827;
            margin-bottom: 1.5rem;
        }
        p {
            margin-bottom: 2rem;
            font-size: 1.1rem;
            color: #4b5563;
        }
        .checkout-btn {
            background-color: #10b981;
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1.25rem;
            font-weight: 600;
            transition: background-color 0.2s;
            width: 100%;
        }
        .checkout-btn:hover {
            background-color: #059669;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Worldpay Swag Shop</h1>
    <p>Get your exclusive developer gear. One click to buy the Worldpay Hoodie & T-Shirt bundle.</p>
    
    <button class="checkout-btn" onclick="checkout()">Buy Bundle ($75.00)</button>
</div>

<script>
    async function checkout() {
        if (window.openai && window.openai.callTool) {
            try {
                // Call the MCP tool to create the session
                const session = await window.openai.callTool('create_checkout_session', {});

                // If the host supports native checkout (ChatGPT), invoke it
                if (window.openai.requestCheckout) {
                    const order = await window.openai.requestCheckout(session.structuredContent);

                    if (order && order.structuredContent && order.structuredContent.order) {
                        const orderId = order.structuredContent.order.id;
                         alert("Order completed! ID: " + orderId);
                    } else {
                        console.log("Order structure:", order);
                        alert("Order completed!");
                    }
                } else {
                    console.log("requestCheckout not available", session);
                    // Fallback for non-ChatGPT environments (e.g. MCP Inspector)
                    // If your session has a URL, you could redirect here:
                    // if (session.structuredContent.url) window.location.href = session.structuredContent.url;
                    alert("Checkout session created (Mock)");
                }
            } catch (e) {
                console.error("Checkout failed", e);
                alert("Checkout failed. See console for details.");
            }
        } else {
            console.warn("OpenAI environment not detected.");
            alert("This button only works within the ChatGPT interface.");
        }
    }
</script>

</body>
</html>`;

export const CHALLENGE_CONTENT = "erbHlsmNQvYZ7Rfq-P6ZH_ohgVs0_Mg53ZbXgsImNFE";

// Kept for reference if needed, but not used in the simplified HTML
export const PRODUCTS = [
	{ id: "tshirt", name: "Worldpay T-Shirt", price: 20.0 },
	{ id: "cup", name: "Worldpay Cup", price: 10.0 },
];
