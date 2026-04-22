import type { CustomerConfig, Product } from "./types";

export function buildShopHtml(config: CustomerConfig): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shop Widget</title>
    <style>
        :root {
            --grid-0-0px: 0rem;
            --grid-0-5-2px: 0.125rem;
            --grid-1-4px: 0.25rem;
            --grid-1-5-6px: 0.375rem;
            --grid-2-8px: 0.5rem;
            --grid-3-12px: 0.75rem;
            --grid-4-16px: 1rem;
            --grid-5-20px: 1.25rem;
            --grid-6-24px: 1.5rem;
            --grid-7-28px: 1.75rem;
            --grid-8-32px: 2rem;
            --grid-10-40px: 2.5rem;

            --border-radius-none: var(--grid-0-0px);
            --border-radius-xxs: var(--grid-0-5-2px);
            --border-radius-xs: var(--grid-1-4px);
            --border-radius-sm: var(--grid-1-5-6px);
            --border-radius-md: var(--grid-2-8px);
            --border-radius-lg: var(--grid-3-12px);
            --border-radius-xl: var(--grid-4-16px);
            --border-radius-2xl: var(--grid-5-20px);

            --font-family-display: ${config.theme.fontFamilyDisplay};
            --font-family-default: ${config.theme.fontFamilyDefault};

            --font-size-900: 3rem;
            --font-size-800: 2.5rem;
            --font-size-700: 2rem;
            --font-size-600: 1.5rem;
            --font-size-500: 1.25rem;
            --font-size-400: 1.125rem;
            --font-size-300: 0.938rem;
            --font-size-200: 0.875rem;

            --color-deep-blue-800: #1b1b6f;
            --color-deep-blue-500: #4b4bd3;
            --color-deep-blue-100: #eaeafa;
            --color-deep-blue-50: #f5f5fd;

            --color-blue-gray-0: #fff;
            --color-blue-gray-25: #f7f7f8;
            --color-blue-gray-50: #f4f4f6;
            --color-blue-gray-100: #e2e4e9;
            --color-blue-gray-200: #cccfd7;

            --color-gray-900: #17171c;
            --color-gray-600: #6a6e87;
            --color-gray-400: #8d91aa;
            --color-gray-200: #cccfd7;
            --color-gray-100: #e2e4e9;
            --color-gray-50: #f4f4f6;

            --color-surface-shadow-wp-1: #1b1b6f0a;
            --color-surface-shadow-wp-2: #1b1b6f0a;
            --color-surface-shadow-wp-3: #1b1b6f14;
            --color-surface-shadow-wp-4: #1b1b6f0d;
            --color-surface-shadow-wp-5: #1b1b6f0d;
            --color-surface-shadow-wp-6: #1b1b6f1a;

            --color-brand-primary: ${config.theme.primaryColor};
            --color-brand-primary-focus: ${config.theme.primaryFocusColor};
            --color-brand-primary-highlight: ${config.theme.primaryHighlightColor};
            --color-brand-primary-subtle: ${config.theme.primarySubtleColor};

            --color-background-primary: var(--color-blue-gray-0);
            --color-background-secondary: var(--color-blue-gray-25);
            --color-background-tertiary: var(--color-blue-gray-50);
            --color-background-quaternary: var(--color-blue-gray-100);
            --color-background-quinary: var(--color-blue-gray-200);

            --color-container-primary: var(--color-blue-gray-50);
            --color-container-secondary: var(--color-blue-gray-0);
            --color-container-tertiary: var(--color-blue-gray-25);
            --color-container-brand: var(--color-deep-blue-50);

            --color-content-primary: var(--color-gray-900);
            --color-content-secondary: var(--color-gray-600);
            --color-content-tertiary: var(--color-gray-400);

            --color-border-primary: var(--color-gray-900);
            --color-border-secondary: var(--color-gray-400);
            --color-border-tertiary: var(--color-gray-200);
            --color-border-quarternary: var(--color-gray-100);
            --color-border-quinary: var(--color-gray-50);

            --color-shadows-level-1: var(--color-surface-shadow-wp-1);
            --color-shadows-level-2: var(--color-surface-shadow-wp-2);
            --color-shadows-level-3: var(--color-surface-shadow-wp-3);
            --color-shadows-level-4: var(--color-surface-shadow-wp-4);
            --color-shadows-level-5: var(--color-surface-shadow-wp-5);
            --color-shadows-level-6: var(--color-surface-shadow-wp-6);
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family-default);
            background: linear-gradient(180deg, var(--color-background-secondary), var(--color-background-tertiary));
            padding: 2.5rem 1.25rem 3rem;
            color: var(--color-content-primary);
            margin: 0;
        }

        .container {
            max-width: 760px;
            margin: 0 auto;
            background: var(--color-background-primary);
            border-radius: var(--border-radius-xl);
            padding: 2.5rem;
            border: 1px solid var(--color-border-tertiary);
            box-shadow: 0 12px 32px var(--color-shadows-level-3);
            position: relative;
            overflow: hidden;
        }

        .container::before {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, var(--color-brand-primary-subtle), transparent);
            pointer-events: none;
        }

        .container > * {
            position: relative;
            z-index: 1;
        }

        h1 {
            font-family: var(--font-family-display);
            color: var(--color-content-primary);
            margin-bottom: 0.35rem;
            text-align: center;
            font-size: var(--font-size-700);
            letter-spacing: -0.02em;
        }

        .subtitle {
            text-align: center;
            margin-bottom: 2.25rem;
            font-size: var(--font-size-300);
            color: var(--color-content-secondary);
        }

        .products {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2.25rem;
        }

        .product-card {
            border: 1px solid var(--color-border-tertiary);
            border-radius: var(--border-radius-lg);
            padding: 1.5rem;
            text-align: left;
            background: var(--color-background-primary);
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .product-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 16px 36px var(--color-shadows-level-4);
            border-color: var(--color-brand-primary-highlight);
        }

        .product-image {
            width: 100%;
            height: 140px;
            object-fit: contain;
            margin-bottom: 1rem;
            background: var(--color-background-tertiary);
            border-radius: var(--border-radius-md);
            padding: 0.5rem;
        }

        .product-name {
            font-size: var(--font-size-400);
            font-weight: 600;
            color: var(--color-content-primary);
            margin-bottom: 0.35rem;
        }

        .product-price {
            font-size: var(--font-size-500);
            color: var(--color-brand-primary);
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .add-btn {
            background-color: var(--color-brand-primary);
            color: var(--color-background-primary);
            border: none;
            padding: 0.6rem 1rem;
            border-radius: 999px;
            cursor: pointer;
            font-size: var(--font-size-200);
            font-weight: 600;
            transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
            width: 100%;
            box-shadow: 0 10px 16px var(--color-shadows-level-3);
        }

        .add-btn:hover {
            background-color: var(--color-brand-primary-focus);
            transform: translateY(-1px);
        }

        .add-btn:focus-visible,
        .qty-btn:focus-visible,
        .checkout-btn:focus-visible {
            outline: 3px solid var(--color-brand-primary-highlight);
            outline-offset: 2px;
        }

        .basket {
            border-top: 1px solid var(--color-border-tertiary);
            padding-top: 1.75rem;
            margin-bottom: 1.75rem;
        }

        .basket-header {
            font-family: var(--font-family-display);
            font-size: var(--font-size-500);
            font-weight: 600;
            color: var(--color-content-primary);
            margin-bottom: 1rem;
        }

        .basket-empty {
            color: var(--color-content-secondary);
            font-style: italic;
            padding: 1rem 0;
        }

        .basket-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.85rem 1rem;
            background-color: var(--color-background-tertiary);
            border-radius: var(--border-radius-md);
            margin-bottom: 0.75rem;
            border: 1px solid transparent;
        }

        .basket-item-info {
            flex-grow: 1;
        }

        .basket-item-name {
            font-weight: 600;
            color: var(--color-content-primary);
        }

        .basket-item-price {
            color: var(--color-content-secondary);
            font-size: var(--font-size-200);
        }

        .basket-item-qty {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--color-background-primary);
            padding: 0.2rem 0.4rem;
            border-radius: 999px;
            border: 1px solid var(--color-border-tertiary);
        }

        .qty-btn {
            background-color: var(--color-brand-primary-subtle);
            border: none;
            border-radius: 999px;
            width: 28px;
            height: 28px;
            cursor: pointer;
            font-weight: 700;
            color: var(--color-brand-primary);
            transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .qty-btn:hover {
            background-color: var(--color-brand-primary-highlight);
            transform: scale(1.05);
        }

        .qty-number {
            min-width: 26px;
            text-align: center;
            font-weight: 600;
        }

        .basket-total {
            display: flex;
            justify-content: space-between;
            padding: 1rem 1.25rem;
            background-color: var(--color-brand-primary-subtle);
            border-radius: var(--border-radius-lg);
            margin-top: 1rem;
            font-size: var(--font-size-500);
            font-weight: 700;
            color: var(--color-content-primary);
        }

        .checkout-btn {
            background-color: var(--color-brand-primary);
            color: var(--color-background-primary);
            border: none;
            padding: 1rem 2rem;
            border-radius: var(--border-radius-lg);
            cursor: pointer;
            font-size: var(--font-size-400);
            font-weight: 600;
            transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
            width: 100%;
            box-shadow: 0 12px 18px var(--color-shadows-level-4);
        }

        .checkout-btn:hover {
            background-color: var(--color-brand-primary-focus);
            transform: translateY(-1px);
        }

        .checkout-btn:disabled {
            background-color: var(--color-border-tertiary);
            color: var(--color-content-tertiary);
            cursor: not-allowed;
            box-shadow: none;
        }

        @media (max-width: 600px) {
            body {
                padding: 1.75rem 1rem 2.25rem;
            }

            .container {
                padding: 1.75rem;
            }

            h1 {
                font-size: var(--font-size-600);
            }

            .product-card {
                text-align: center;
            }
        }
    </style>
</head>
<body>

<div class="container">
    <h1>${config.brand.title}</h1>
    <p class="subtitle">${config.brand.subtitle}</p>
    
    <div class="products" id="products"></div>
    
    <div class="basket">
        <div class="basket-header">${config.brand.cartLabel}</div>
        <div id="basket-items"></div>
        <div id="basket-total" style="display: none;">
            <div class="basket-total">
                <span>Total:</span>
                <span id="total-amount">$0.00</span>
            </div>
        </div>
    </div>
    
    <button class="checkout-btn" id="checkout-btn" onclick="checkout()" disabled>
        ${config.brand.checkoutButtonText}
    </button>
</div>

<script>
    // Product catalog
    const products = ${JSON.stringify(config.products.map(p => ({ id: p.id, name: p.name, price: p.price.amount, image: p.imageBase64 ?? "" })))};
    const emptyCartText = ${JSON.stringify(config.brand.emptyCartText)};
    
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
                <img class="product-image" src="\${product.image}" alt="\${product.name}" />
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
            basketItems.innerHTML = '<div class="basket-empty">' + emptyCartText + '</div>';
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
}

export function getProducts(config: CustomerConfig): Product[] {
	return config.products.map(p => ({ id: p.id, name: p.name, price: p.price.amount }));
}
