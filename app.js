const STORAGE_KEY = 'gina-african-jewelry-cart';
const SHIPPING = 8.0;

const PRODUCTS = [
    { id: 'brass-necklace', name: 'Brass Necklaces', category: 'Necklaces', price: 45.0, image: 'africa necklace.jpeg', description: 'A Kelis Africa minimalist brass choker necklace represents a striking contemporary evolution of one of Africa’s oldest and most powerful jewelry forms: the neck torque.' },
    { id: 'masai-beaded-clutch-bag', name: 'maasai-beaded clutch bags', category: 'bags', price: 28.0, image: 'more bags.jpeg', description: 'a beaded clutch purse is far more than a simple fashion accessory—it is a wearable archive of identity, storytelling, and community..' },
    { id: 'beaded-rings', name: 'Beaded-rings', category: 'rings', price: 35.0, image: 'brown ring.jpeg', description: 'Classic brass rings with heritage-inspired shapes and polish.' },
    { id: 'Kiondo-Bags', name: 'Kiondo-Bags', category: 'Bags', price: 24.0, image: 'bags outlined.jpeg', description: 'a masterpiece of sustainable indigenous architecture, deeply rooted in the cultural heritage of the Agĩkũyũ (Kikuyu), Akamba, and Aembu communities of Central and Eastern Kenya..' },
    { id: 'Bolga-Basket', name: 'Bolga-baskets', category: 'Baskets', price: 22.0, image: 'hat+bag.jpeg', description: 'a beautiful testament to the resilience, resourcefulness, and deep-seated community spirit of Northern Ghana.Extensions of the savanna landscape and a profound symbol of matrilineal craftsmanship.' },
    { id: 'beaded-bracelets', name: 'Beaded-bracelets', category: 'Bracelets', price: 29.0, image: 'bangles1.jpeg', description: 'An elegant cuff with engraved cultural symbols and a sleek finish, blending tradition with modern sophistication.' },
    { id: 'Kikapu-Baskets', name: 'Kikapu-baskets', category: 'Baskets', price: 33.0, image: 'bag on stand1.jpeg', description: 'Originating along the Swahili Coast and woven by communities across East Africa, a kikapu is a masterclass in zero-waste design.' },
    { id: 'Sisal-bags', name: 'Sisal-bags', category: 'Baskets', price: 32.0, image: 'trad bag1.jpeg', description: 'A masterclass in resilient, earth-born architecture.The sisal bag has evolved into a global symbol of sustainable luxury.' },
    { id: 'Maasai-beaded-bracelets', name: 'Maasai-beaded-bracelet', category: 'Bracelets', price: 27.0, image: 'bracelets 1.jpeg', description: 'A dynamic visual statement of community standing.Ranging from slim, flexible everyday strands to the iconic rigid cuffs (Enkata)—are packed with deep-seated cultural communication.' },
    
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
    const whatsappNumber = '+254722805827';
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

        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();
        const contactEmail = form.dataset.contactEmail;

        if (!contactEmail) return;

        const subject = encodeURIComponent(`Contact from ${name} — GINA African Jewelry`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
        window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;

        const existing = form.querySelector('.success-message');
        if (existing) existing.remove();
        const successMessage = document.createElement('p');
        successMessage.className = 'success-message';
        successMessage.textContent = `Your email app should open with your message ready to send. If it did not open, email us directly at ${contactEmail}.`;
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
