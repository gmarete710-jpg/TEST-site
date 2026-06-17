const STORAGE_KEY = 'gina-african-jewelry-cart';
const SHIPPING = 8.0;

const PRODUCTS = [
    { id: 'beaded-necklace', name: 'Beaded Necklace', category: 'Necklaces', price: 45.0, image: 'africa necklace.jpeg', description: 'A vibrant handmade necklace featuring colorful beads and bold African-inspired patterns that make a statement.' },
    { id: 'kente-headwrap', name: 'Kente Headwrap', category: 'Headwear', price: 28.0, image: 'more bags.jpeg', description: 'A stylish headwrap inspired by traditional Kente weaving, designed to add elegance and cultural flair to any look.' },
    { id: 'brass-earrings', name: 'Brass Earrings', category: 'Earrings', price: 35.0, image: 'ring.jpeg', description: 'Polished brass earrings with intricate detailing and a warm metallic finish that complements both casual and formal outfits.' },
    { id: 'wooden-earrings', name: 'Wooden Earrings', category: 'Earrings', price: 24.0, image: 'brown ring.jpeg', description: 'Lightweight wooden earrings hand-painted with tribal-inspired motifs for a natural, artistic touch.' },
    { id: 'statement-bracelet', name: 'Statement Bracelet', category: 'Bracelets', price: 22.0, image: 'wrist bracelet 1.jpeg', description: 'A bold bracelet crafted with rich textures and colors, perfect for elevating everyday style.' },
    { id: 'ethnic-cuff', name: 'Ethnic Cuff', category: 'Bracelets', price: 29.0, image: 'bangles1.jpeg', description: 'An elegant cuff with engraved cultural symbols and a sleek finish, blending tradition with modern sophistication.' },
    { id: 'wax-print-tote', name: 'Wax Print Tote', category: 'Bags', price: 33.0, image: 'bag on stand1.jpeg', description: 'A durable tote bag featuring bold wax-print designs that are practical, stylish, and perfect for daily use.' },
    { id: 'leather-wallet', name: 'Leather Wallet', category: 'Accessories', price: 32.0, image: 'trad bag1.jpeg', description: 'A compact leather wallet decorated with embossed patterns, combining function with a unique cultural look.' },
    { id: 'patterned-shawl', name: 'Patterned Shawl', category: 'Accessories', price: 40.0, image: 'guy fixing.jpeg', description: 'A soft, lightweight shawl woven with intricate geometric patterns, ideal for layering and gifting.' },
    { id: 'silver-anklet', name: 'Silver Anklet', category: 'Accessories', price: 27.0, image: 'bracelets 1.jpeg', description: 'A delicate silver anklet with subtle shine and timeless charm, designed to add a graceful finish to any outfit.' },
    { id: 'beaded-bracelet', name: 'Beaded Bracelet', category: 'Bracelets', price: 18.0, image: 'green necklace.jpeg', description: 'A colorful beaded bracelet made with traditional weaving techniques, bringing warmth and personality to your style.' },
    { id: 'gift-set', name: 'Gift Set', category: 'Sets', price: 60.0, image: 'handbag1.jpeg', description: 'A curated collection of accessories thoughtfully assembled as a beautiful gift option for special occasions.' }
];

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function getCart() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function updateCartCount() {
    const count = getCart().reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach((badge) => {
        badge.textContent = count;
    });
}

function addToCart(productId) {
    const cart = getCart();
    const product = PRODUCTS.find((item) => item.id === productId);
    if (!product) return;
    const existing = cart.find((item) => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
    updateCartCount();
}

function buildWhatsAppUrl(cart) {
    const orderTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemsText = cart
        .map((item) => `${item.quantity} x ${item.name}`)
        .join('\n');
    const message = `Hello! I would like to place an order for:\n${itemsText}\n\nTotal: ${formatCurrency(orderTotal + SHIPPING)}\n\nPlease let me know the next steps.`;
    const whatsappNumber = '+254707135305';
    return `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}

function updateWhatsAppLinks(cart) {
    const url = buildWhatsAppUrl(cart);
    document.querySelectorAll('#wa-footer-link, #wa-checkout-link').forEach((link) => {
        link.href = url;
    });
}

function renderCatalog(products) {
    const catalogue = document.querySelector('.catalogue');
    if (!catalogue) return;
    catalogue.innerHTML = products
        .map((product) => `
            <article class="product-card">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-card-body">
                    <span class="product-meta">${product.category}</span>
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-card-footer">
                        <span class="price">${formatCurrency(product.price)}</span>
                        <button class="btn btn-sm" type="button" data-action="add" data-product="${product.id}">Add</button>
                    </div>
                </div>
            </article>
        `)
        .join('');
}

function filterProducts() {
    const searchValue = document.querySelector('#search')?.value.trim().toLowerCase() || '';
    const categoryButton = document.querySelector('.category-pill.active');
    const activeCategory = categoryButton ? categoryButton.dataset.category : 'All';
    const sortValue = document.querySelector('#sort')?.value || 'popular';

    let results = [...PRODUCTS];
    if (activeCategory !== 'All') {
        results = results.filter((item) => item.category === activeCategory);
    }
    if (searchValue) {
        results = results.filter((item) => item.name.toLowerCase().includes(searchValue) || item.description.toLowerCase().includes(searchValue));
    }
    if (sortValue === 'low') {
        results.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'high') {
        results.sort((a, b) => b.price - a.price);
    }
    renderCatalog(results);
}

function renderCategories() {
    const categories = ['All', ...new Set(PRODUCTS.map((item) => item.category))];
    const categoriesEl = document.querySelector('.categories');
    if (!categoriesEl) return;
    categoriesEl.innerHTML = categories
        .map((category, index) => `
            <button type="button" class="category-pill${index === 0 ? ' active' : ''}" data-category="${category}">${category}</button>
        `)
        .join('');
}

function initGalleryPage() {
    renderCategories();
    renderCatalog(PRODUCTS);

    document.querySelector('.catalogue')?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action="add"]');
        if (!button) return;
        const productId = button.dataset.product;
        addToCart(productId);
        button.textContent = 'Added';
        setTimeout(() => {
            button.textContent = 'Add';
        }, 800);
    });

    document.querySelector('.filters')?.addEventListener('click', (event) => {
        const button = event.target.closest('.category-pill');
        if (!button) return;
        document.querySelectorAll('.category-pill').forEach((pill) => pill.classList.remove('active'));
        button.classList.add('active');
        filterProducts();
    });

    document.querySelector('#search')?.addEventListener('input', filterProducts);
    document.querySelector('#sort')?.addEventListener('change', filterProducts);
}

function renderCartPage() {
    const cart = getCart();
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalEl = document.querySelector('.subtotal-value');
    const totalEl = document.querySelector('.total-value');

    if (!cartItemsContainer || !subtotalEl || !totalEl) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="table-empty">Your cart is empty. Continue shopping to add beautiful jewelry.</div>';
        subtotalEl.textContent = formatCurrency(0);
        totalEl.textContent = formatCurrency(0);
        updateWhatsAppLinks(cart);
        return;
    }

    cartItemsContainer.innerHTML = cart
        .map((item) => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p class="product-meta">${item.category}</p>
                    <p class="price">${formatCurrency(item.price)}</p>
                    <div class="cart-item-controls">
                        <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}">+</button>
                        <button type="button" class="remove-btn" data-action="remove" data-id="${item.id}">Remove</button>
                    </div>
                </div>
            </div>
        `)
        .join('');

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    subtotalEl.textContent = formatCurrency(subtotal);
    totalEl.textContent = formatCurrency(subtotal + SHIPPING);
    updateWhatsAppLinks(cart);
}

function initCartPage() {
    renderCartPage();

    document.querySelector('.cart-items')?.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;
        const action = button.dataset.action;
        const id = button.dataset.id;
        const cart = getCart();
        const item = cart.find((entry) => entry.id === id);
        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity = Math.max(1, item.quantity - 1);
        } else if (action === 'remove') {
            const index = cart.findIndex((entry) => entry.id === id);
            if (index !== -1) cart.splice(index, 1);
        }

        saveCart(cart);
        updateCartCount();
        renderCartPage();
    });

    document.querySelector('#checkout-btn')?.addEventListener('click', () => {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty. Add a few beautiful pieces first.');
            return;
        }

        window.open(buildWhatsAppUrl(cart), '_blank');
    });
}

function initContactPage() {
    const form = document.querySelector('#contact-form');
    if (!form) return;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const existing = form.querySelector('.success-message');
        if (existing) existing.remove();
        const successMessage = document.createElement('p');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thanks for reaching out! We will reply within one business day.';
        form.appendChild(successMessage);
        form.reset();
    });
}

function initHomePage() {
    document.querySelectorAll('[data-product]').forEach((button) => {
        button.addEventListener('click', () => {
            const productId = button.dataset.product;
            addToCart(productId);
            const originalText = button.textContent;
            button.textContent = 'Added';
            setTimeout(() => {
                button.textContent = originalText;
            }, 800);
        });
    });
}

function initMobileMenu() {
    const button = document.querySelector('#mobile-nav-toggle');
    const nav = document.querySelector('.navigation');
    if (!button || !nav) return;
    button.addEventListener('click', () => {
        nav.classList.toggle('nav-open');
    });
}

function initCartButton() {
    document.querySelectorAll('.cart-toggle').forEach((button) => {
        button.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    });
}

function initApp() {
    updateCartCount();
    initMobileMenu();
    initCartButton();

    if (document.body.classList.contains('gallery-page')) {
        initGalleryPage();
    }
    if (document.body.classList.contains('cart-page')) {
        initCartPage();
    }
    if (document.body.classList.contains('contact-page')) {
        initContactPage();
    }
    if (document.body.classList.contains('home-page')) {
        initHomePage();
    }
}

window.addEventListener('DOMContentLoaded', initApp);
