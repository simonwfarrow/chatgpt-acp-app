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
        }
        .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 0.5rem;
            padding: 2rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
            color: #111827;
            margin-bottom: 0.5rem;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            margin-bottom: 2rem;
            font-size: 1rem;
            color: #6b7280;
        }
        .products {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .product-card {
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1.5rem;
            text-align: center;
            transition: box-shadow 0.2s;
        }
        .product-card:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .product-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
        }
        .product-price {
            font-size: 1.25rem;
            color: #10b981;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        .add-btn {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 600;
            transition: background-color 0.2s;
            width: 100%;
        }
        .add-btn:hover {
            background-color: #2563eb;
        }
        .basket {
            border-top: 2px solid #e5e7eb;
            padding-top: 1.5rem;
            margin-bottom: 1.5rem;
        }
        .basket-header {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 1rem;
        }
        .basket-empty {
            color: #6b7280;
            font-style: italic;
            padding: 1rem 0;
        }
        .basket-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background-color: #f9fafb;
            border-radius: 0.375rem;
            margin-bottom: 0.5rem;
        }
        .basket-item-info {
            flex-grow: 1;
        }
        .basket-item-name {
            font-weight: 600;
            color: #111827;
        }
        .basket-item-price {
            color: #6b7280;
            font-size: 0.875rem;
        }
        .basket-item-qty {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .qty-btn {
            background-color: #e5e7eb;
            border: none;
            border-radius: 0.25rem;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-weight: 600;
            transition: background-color 0.2s;
        }
        .qty-btn:hover {
            background-color: #d1d5db;
        }
        .qty-number {
            min-width: 30px;
            text-align: center;
            font-weight: 600;
        }
        .basket-total {
            display: flex;
            justify-content: space-between;
            padding: 1rem;
            background-color: #f3f4f6;
            border-radius: 0.375rem;
            margin-top: 1rem;
            font-size: 1.25rem;
            font-weight: 700;
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
        .checkout-btn:disabled {
            background-color: #d1d5db;
            cursor: not-allowed;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Worldpay Swag Shop</h1>
    <p class="subtitle">Get your exclusive developer gear</p>
    
    <div class="products" id="products"></div>
    
    <div class="basket">
        <div class="basket-header">Shopping Cart</div>
        <div id="basket-items"></div>
        <div id="basket-total" style="display: none;">
            <div class="basket-total">
                <span>Total:</span>
                <span id="total-amount">$0.00</span>
            </div>
        </div>
    </div>
    
    <button class="checkout-btn" id="checkout-btn" onclick="checkout()" disabled>
        Checkout
    </button>
</div>

<script>
    // Product catalog
    const products = [
        { id: "tshirt", name: "Worldpay T-Shirt", price: 20.00 },
        { id: "cup", name: "Worldpay Cup", price: 10.00 }
    ];
    
    // Cart state (client-side only)
    let cart = {};
    
    // Initialize the page
    function init() {
        renderProducts();
        updateBasket();
    }
    
    // Render product cards
    function renderProducts() {
        const container = document.getElementById('products');
        container.innerHTML = products.map(product => \`
            <div class="product-card">
                <div class="product-name">\${product.name}</div>
                <div class="product-price">$\${product.price.toFixed(2)}</div>
                <button class="add-btn" onclick="addToCart('\${product.id}')">
                    Add to Cart
                </button>
            </div>
        \`).join('');
    }
    
    // Add item to cart
    function addToCart(productId) {
        if (cart[productId]) {
            cart[productId]++;
        } else {
            cart[productId] = 1;
        }
        updateBasket();
    }
    
    // Update quantity
    function updateQuantity(productId, delta) {
        const newQty = (cart[productId] || 0) + delta;
        if (newQty <= 0) {
            delete cart[productId];
        } else {
            cart[productId] = newQty;
        }
        updateBasket();
    }
    
    // Update basket display
    function updateBasket() {
        const basketItems = document.getElementById('basket-items');
        const basketTotal = document.getElementById('basket-total');
        const totalAmount = document.getElementById('total-amount');
        const checkoutBtn = document.getElementById('checkout-btn');
        
        const cartItems = Object.keys(cart);
        
        if (cartItems.length === 0) {
            basketItems.innerHTML = '<div class="basket-empty">Your cart is empty</div>';
            basketTotal.style.display = 'none';
            checkoutBtn.disabled = true;
        } else {
            basketItems.innerHTML = cartItems.map(productId => {
                const product = products.find(p => p.id === productId);
                const quantity = cart[productId];
                const itemTotal = product.price * quantity;
                
                return \`
                    <div class="basket-item">
                        <div class="basket-item-info">
                            <div class="basket-item-name">\${product.name}</div>
                            <div class="basket-item-price">$\${product.price.toFixed(2)} each</div>
                        </div>
                        <div class="basket-item-qty">
                            <button class="qty-btn" onclick="updateQuantity('\${productId}', -1)">−</button>
                            <span class="qty-number">\${quantity}</span>
                            <button class="qty-btn" onclick="updateQuantity('\${productId}', 1)">+</button>
                        </div>
                    </div>
                \`;
            }).join('');
            
            const total = cartItems.reduce((sum, productId) => {
                const product = products.find(p => p.id === productId);
                return sum + (product.price * cart[productId]);
            }, 0);
            
            totalAmount.textContent = \`$\${total.toFixed(2)}\`;
            basketTotal.style.display = 'block';
            checkoutBtn.disabled = false;
        }
    }
    
    async function checkout() {
        if (window.openai && window.openai.callTool) {
            try {
                // Call the MCP tool to create the session with cart items
                const session = await window.openai.callTool('create_checkout_session', { cart });

                // If the host supports native checkout (ChatGPT), invoke it
                if (window.openai.requestCheckout) {
                    const order = await window.openai.requestCheckout(session.structuredContent);

                    if (order && order.structuredContent && order.structuredContent.order) {
                        const orderId = order.structuredContent.order.id;
                        alert("Order completed! ID: " + orderId);
                        // Clear cart after successful checkout
                        cart = {};
                        updateBasket();
                    } else {
                        console.log("Order structure:", order);
                        alert("Order completed!");
                        cart = {};
                        updateBasket();
                    }
                } else {
                    console.log("requestCheckout not available", session);
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
    
    // Initialize on page load
    init();
</script>

</body>
</html>`;

export const CHALLENGE_CONTENT = "erbHlsmNQvYZ7Rfq-P6ZH_ohgVs0_Mg53ZbXgsImNFE";

// Product catalog - intentionally duplicated in client-side JS for simplicity
// This keeps the HTML self-contained and avoids dynamic template generation
export const PRODUCTS = [
	{ id: "tshirt", name: "Worldpay T-Shirt", price: 20.0 },
	{ id: "cup", name: "Worldpay Cup", price: 10.0 },
];
