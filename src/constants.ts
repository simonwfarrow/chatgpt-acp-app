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
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            text-align: center;
            margin-bottom: 2rem;
            color: #111827;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        .card {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        .card img {
            width: 100%;
            height: 200px;
            object-fit: contain;
            margin-bottom: 1rem;
            border-radius: 0.25rem;
        }
        .card h3 {
            margin: 0 0 0.5rem 0;
            font-size: 1.25rem;
        }
        .price {
            color: #4b5563;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: #2563eb;
        }
        button:disabled {
            background-color: #9ca3af;
            cursor: not-allowed;
        }
        .cart-section {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
        }
        .cart-info {
            font-size: 1.25rem;
            margin-bottom: 1rem;
            font-weight: 500;
        }
        .checkout-btn {
            background-color: #10b981;
            padding: 0.75rem 1.5rem;
            font-size: 1.1rem;
        }
        .checkout-btn:hover {
            background-color: #059669;
        }
        .checkout-btn.hidden {
            display: none;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Worldpat Swag Shop</h1>
    
    <div id="product-grid" class="grid">
        <!-- Products injected here -->
    </div>

    <div class="cart-section">
        <div class="cart-info">
            Items: <span id="item-count">0</span> | Total: $<span id="total-price">0.00</span>
        </div>
        <button id="checkout-btn" class="checkout-btn hidden" onclick="checkout()">Checkout</button>
    </div>
</div>

<script>
    const PRODUCTS = [
        { id: 'tshirt', name: 'Worldpay T-Shirt', price: 20.00, image: 'UklGRuxXAABXRUJQVlA4WAoAAAAoAAAApAUAJQYASUNDUKgBAAAAAAGobGNtcwIQAABtbnRyUkdCIFhZWiAH3AABABkAAwApADlhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAF9jcHJ0AAABTAAAAAx3dHB0AAABWAAAABRyWFlaAAABbAAAABRnWFlaAAABgAAAABRiWFlaAAABlAAAABRyVFJDAAABDAAAAEBnVFJDAAABDAAAAEBiVFJDAAABDAAAAEBkZXNjAAAAAAAAAAVjMmNpAAAAAAAAAAAAAAAAY3VydgAAAAAAAAAaAAAAywHJA2MFkghrC/YQPxVRGzQh8SmQMhg7kkYFUXdd7WtwegWJsZp8rGm/fdPD6TD//3RleHQAAAAAQ0MwAFhZWiAAAAAAAAD21gABAAAAANMtWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPVlA4IFxVAACQPQOdASqUBJQEPkkkkUYioiojINNYeUAJCWlu+8pwtPebbMM4ob/cM+tf/X6+bv7BQxrYfqc/pfS+8k/+FkfwC/o/yA8EGU/DP2z+vfsB+S/y71f+0/1384flH8ruqTqLzZ/Jv0b/Df3/9rP8d/////97v8d/wPY7+m/+B7gX6i/6z+3/u1/ePrh6CfMB+vH/E/xH7//MH/sf9z7J/6h+3v+A+AD+Y/0j79Pi+9kr92/YE/kH+E///rnfsx8MP7Wf+3/e+0F/7ez/6c9p3+Wwsv9g1L/m/vc5J/snnJ9UZy7DNp3+o/9S6JnyPfiIMi5m+pr4iDz6+Ig8+viIPPr4iDz6+Ig8+viIPPr4iDz6+Ig8+viIPPr4iC1wK6+Ig8+viIPPr4iDz4j+pr4iDz6+Ig8+viIPPq7dxlwJKOoQMBrwAeNwoeQfRDRD4F5tGLBwi+2MkVJ3j3LG4Uk5PTLkjD2zxLGHPsA8KNOBR7csKPgXjU6gL9OU1wsWNYEVAdJfIMOe6xIrl1QIuZxi3S5ImsYMGu1tYAheOFsKEE3xuE3oHhLwRHqNX1Mioc+viIPPr4iDz6+Ig9AE2E5Jlji+I89Cl6+P7mWFj8uM+zUWrhgYGQsl91EB1CvTBOY9AEBTRwHDN27m5BOHsPMeOMGnbvlj1pr4iDz6+Ig8+viIPPsCVVK6CfkUv1N41Qg83Cp7+4Jj79+frcziZY+rdfm+3uDM9U3ReGNJLp91AySXJmnoFDENYYukyNuER+c1L9zN9TXxEHn18RB59fETgpEExwC1q0Y4Sy1HZ+1YnOAUoaxeYxiWc1Npb3jpWBFelPxVB5yhHMgCAogTySPBJ5Y9yxtNPzQ++C/ZZ5HFvFV2TxupAuSHkXqBmqP83nDlFZKW+Nb7l87/6pI7WCxy9LVvrTQT14OnYhXWhNxsl38911dgTEFTimFQfPlJjICbPM31NfEQefXxEHn2BRH7asoFvNrX8868UzAGFCvqZm9trDKFGCrXalfH8ommNnwhFPZ8IRT2fCEXsfCOpvvPPdM3vApfI7BA72BSz6Jr6+jbmrFSbWYUjsFTXxEHn18RB59fEQegQjEq6oepLlo4USuKdqaS+PyzAnpKtQF36gEx3opBm+9YseZVvoTZ5m+pr4iDz6+IhA2UeYvupX1iBgwc6sNEng94FNYHQYMO4Fwb8/LSR8xXTGz4Qins+EIp7PhCKfeRFC5vt/TvYMmePnMzXQO52ByVleS8amftkEn6qk1c/G8oMSmviIPPr4iDz6+Ig8+5LgIBROsQiqDzMHzG98pjPtc...' },
        { id: 'cup', name: 'Worldpay Cup', price: 10.00, image: 'UklGRqA2AABXRUJQVlA4WAoAAAAoAAAAkwQAkwQASUNDUKgBAAAAAAGobGNtcwIQAABtbnRyUkdCIFhZWiAH3AABABkAAwApADlhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAF9jcHJ0AAABTAAAAAx3dHB0AAABWAAAABRyWFlaAAABbAAAABRnWFlaAAABgAAAABRiWFlaAAABlAAAABRyVFJDAAABDAAAAEBnVFJDAAABDAAAAEBiVFJDAAABDAAAAEBkZXNjAAAAAAAAAAVjMmNpAAAAAAAAAAAAAAAAY3VydgAAAAAAAAAaAAAAywHJA2MFkghrC/YQPxVRGzQh8SmQMhg7kkYFUXdd7WtwegWJsZp8rGm/fdPD6TD//3RleHQAAAAAQ0MwAFhZWiAAAAAAAAD21gABAAAAANMtWFlaIAAAAAAAAG+iAAA49QAAA5BYWVogAAAAAAAAYpkAALeFAAAY2lhZWiAAAAAAAAAkoAAAD4QAALbPVlA4IBA0AAAQOgKdASqUBJQEPkkkkUYioiojINNYeUAJCWlu+8pwtPebbMM4ob/cM+tf/X6+bv7BQxrYfqc/pfS+8k/+FkfwC/o/yA8EGU/DP2z+vfsB+S/y71f+0/1384flH8ruqTqLzZ/Jv0b/Df3/9rP8d/////97v8d/wPY7+m/+B7gX6i/6z+3/u1/ePrh6CfMB+vH/E/xH7//MH/sf9z7J/6h+3v+A+AD+Y/0j79Pi+9kr92/YE/kH+E///rnfsx8MP7Wf+3/e+0F/7ez/6c9p3+Wwsv9g1L/m/vc5J/snnJ9UZy7DNp3+o/9S6JnyPfiIMi5m+pr4iDz6+Ig8+viIPPr4iDz6+Ig8+viIPPr4iDz6+Ig8+viIPPr4iC1wK6+Ig8+viIPPr4iDz4j+pr4iDz6+Ig8+viIPPq7dxlwJKOoQMBrwAeNwoeQfRDRD4F5tGLBwi+2MkVJ3j3LG4Uk5PTLkjD2zxLGHPsA8KNOBR7csKPgXjU6gL9OU1wsWNYEVAdJfIMOe6xIrl1QIuZxi3S5ImsYMGu1tYAheOFsKEE3xuE3oHhLwRHqNX1Mioc+viIPPr4iDz6+Ig9AE2E5Jlji+I89Cl6+P7mWFj8uM+zUWrhgYGQsl91EB1CvTBOY9AEBTRwHDN27m5BOHsPMeOMGnbvlj1pr4iDz6+Ig8+viIPPsCVVK6CfkUv1N41Qg83Cp7+4Jj79+frcziZY+rdfm+3uDM9U3ReGNJLp91AySXJmnoFDENYYukyNuER+c1L9zN9TXxEHn18RB59fETgpEExwC1q0Y4Sy1HZ+1YnOAUoaxeYxiWc1Npb3jpWBFelPxVB5yhHMgCAogTySPBJ5Y9yxtNPzQ++C/ZZ5HFvFV2TxupAuSHkXqBmqP83nDlFZKW+Nb7l87/6pI7WCxy9LVvrTQT14OnYhXWhNxsl38911dgTEFTimFQfPlJjICbPM31NfEQefXxEHn2BRH7asoFvNrX8868UzAGFCvqZm9trDKFGCrXalfH8ommNnwhFPZ8IRT2fCEXsfCOpvvPPdM3vApfI7BA72BSz6Jr6+jbmrFSbWYUjsFTXxEHn18RB59fEQegQjEq6oepLlo4USuKdqaS+PyzAnpKtQF36gEx3opBm+9YseZVvoTZ5m+pr4iDz6+IhA2UeYvupX1iBgwc6sNEng94FNYHQYMO4Fwb8/LSR8xXTGz4Qins+EIp7PhCKfeRFC5vt/TvYMmePnMzXQO52ByVleS8amftkEn6qk1c/G8oMSmviIPPr4iDz6+Ig8+5LgIBROsQiqDzMHzG98pjPtc...' }
    ];

    let cart = [];

    function render() {
        const grid = document.getElementById('product-grid');
        grid.innerHTML = PRODUCTS.map(p => \`
            <div class="card">
                <img src="data:image/webp;base64, \${p.image}" alt="\${p.name}">
                <h3>\${p.name}</h3>
                <div class="price">$\${p.price.toFixed(2)}</div>
                <button onclick="add_to_cart('\${p.id}')">Add</button>
            </div>
        \`).join('');

        const itemCount = cart.length;
        // Calculate total based on known products
        const total = cart.reduce((sum, item) => {
            // item might be a string ID or an object
            const id = typeof item === 'string' ? item : (item.id || item.productId);
            const product = PRODUCTS.find(p => p.id === id);
            return sum + (product ? product.price : 0);
        }, 0);

        document.getElementById('item-count').textContent = itemCount;
        document.getElementById('total-price').textContent = total.toFixed(2);

        const checkoutBtn = document.getElementById('checkout-btn');
        if (itemCount > 0) {
            checkoutBtn.classList.remove('hidden');
            checkoutBtn.disabled = false;
        } else {
            checkoutBtn.classList.add('hidden');
            checkoutBtn.disabled = true;
        }
    }

    async function add_to_cart(productId) {
        if (window.openai && window.openai.callTool) {
            try {
                // Optimistic update
                cart.push(productId);
                render();
                
                await window.openai.callTool('add_to_cart', { productId });
                // We rely on sync to correct the state if needed, or the return value
            } catch (e) {
                console.error("Add to cart failed", e);
                // Revert optimistic update
                cart.pop();
                render();
            }
        } else {
            console.warn("OpenAI environment not detected. Mocking add.");
            cart.push(productId);
            render();
        }
    }

    async function checkout() {
        if (window.openai && window.openai.callTool) {
            try {
                const session = await window.openai.callTool('create_checkout_session', {});

                if (window.openai.requestCheckout) {
                    const order = await window.openai.requestCheckout(session.structuredContent);

                    if (order && order.structuredContent && order.structuredContent.order) {
                        const orderId = order.structuredContent.order.id;
                         alert("Order completed: " + orderId);
                    } else {
                        console.log("Order structure:", order);
                        alert("Order completed!");
                    }

                    cart = []; // Clear local cart
                    render();
                } else {
                    console.log("requestCheckout not available", session);
                }
            } catch (e) {
                console.error("Checkout failed", e);
            }
        }
    }

    function updateCart(serverCart) {
        if (Array.isArray(serverCart)) {
            cart = serverCart;
            render();
        }
    }

    // Listen to openai:set_globals event
    window.addEventListener('openai:set_globals', (event) => {
        if (event.detail && event.detail.cart) {
            updateCart(event.detail.cart);
        }
    });

    // Also listen to tool outputs in case the cart is returned there
    window.addEventListener('openai:tool_output', (event) => {
        const data = event.detail;
        // Check if the output contains a cart directly or in a result object
        if (data && data.cart) {
            updateCart(data.cart);
        } else if (data && data.result && data.result.cart) {
            updateCart(data.result.cart);
        }
    });

    // Initial render
    render();
</script>

</body>
</html>`;

export const CHALLENGE_CONTENT = "erbHlsmNQvYZ7Rfq-P6ZH_ohgVs0_Mg53ZbXgsImNFE";

export const PRODUCTS = [
  { id: 'tshirt', name: 'Worldpay T-Shirt', price: 20.00 },
  { id: 'cup', name: 'Worldpay Cup', price: 10.00 }
];
