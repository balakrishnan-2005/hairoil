class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('avuryeda_cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Cart button click
        document.querySelector('.cart-btn')?.addEventListener('click', () => this.showCart());

        // Close modal
        document.querySelector('.close-modal')?.addEventListener('click', () => this.hideCart());

        // Close modal on outside click
        document.querySelector('.cart-modal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('cart-modal')) {
                this.hideCart();
            }
        });

        // Checkout button
        document.querySelector('.checkout-btn')?.addEventListener('click', () => this.checkout());
    }

    addItem(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = this.items.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartCount();
        this.showSuccessMessage(`${product.name} added to cart!`);

        // Update cart UI if visible
        if (document.querySelector('.cart-modal').classList.contains('active')) {
            this.updateCartUI();
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
        this.updateCartUI();
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, quantity);

            if (item.quantity <= 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCartCount();
                this.updateCartUI();
            }
        }
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    saveCart() {
        localStorage.setItem('avuryeda_cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const count = this.getItemCount();
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    showCart() {
        const modal = document.querySelector('.cart-modal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.updateCartUI();
    }

    hideCart() {
        const modal = document.querySelector('.cart-modal');
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    updateCartUI() {
        const cartItems = document.querySelector('.cart-items');
        const totalPrice = document.querySelector('.total-price');

        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--text-light); margin-bottom: 20px;"></i>
                    <h4 style="color: var(--text-light); margin-bottom: 10px;">Your cart is empty</h4>
                    <p style="color: var(--text-light);">Add some products to your cart</p>
                </div>
            `;
            totalPrice.textContent = '₹0.00';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <img src="${item.images[0]}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">₹${item.price} × ${item.quantity} = ₹${item.price * item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="remove-btn" onclick="cart.removeItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        totalPrice.textContent = `₹${this.getTotal().toFixed(2)}`;
    }

    checkout() {
        if (this.items.length === 0) {
            this.showToast('Your cart is empty!', 'error');
            return;
        }

        // In a real app, this would redirect to checkout page
        const orderSummary = this.items.map(item =>
            `${item.name} (${item.quantity} × ₹${item.price})`
        ).join('\n');

        const total = this.getTotal();

        // Create WhatsApp message
        const message = `*New Order - AVURYEDA Hair Oil*%0A%0A` +
            `*Order Summary:*%0A${orderSummary}%0A%0A` +
            `*Total: ₹${total}*%0A%0A` +
            `*Please provide shipping details:*%0A` +
            `Name:%0A` +
            `Address:%0A` +
            `Phone:%0A` +
            `Pincode:`;

        // Open WhatsApp
        window.open(`https://wa.me/919876543210?text=${message}`, '_blank');

        // Clear cart after order
        this.items = [];
        this.saveCart();
        this.updateCartCount();
        this.updateCartUI();
        this.hideCart();

        this.showToast('Order placed successfully! Please complete your details on WhatsApp.');
    }

    showSuccessMessage(message) {
        // Create success message element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle" style="margin-right: 10px; color: var(--secondary-green);"></i>
            ${message}
        `;

        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}" 
               style="margin-right: 10px; color: ${type === 'error' ? '#ff6b6b' : 'var(--secondary-green)'};"></i>
            ${message}
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Make cart available globally
window.cart = cart;