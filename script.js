// Initialize Swiper Carousel
const benefitsSwiper = new Swiper('.benefits-carousel', {
    direction: 'horizontal',
    loop: true,
    speed: 600,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        320: {
            slidesPerView: 1,
            spaceBetween: 20
        },
        768: {
            slidesPerView: 2,
            spaceBetween: 30
        },
        1024: {
            slidesPerView: 3,
            spaceBetween: 30
        }
    }
});

// 3D Product Viewer
class Product3DViewer {
    constructor() {
        this.productModel = document.getElementById('productModel');
        this.currentView = 'front';
        this.isRotating = false;
        this.rotationInterval = null;
        this.scale = 1;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.rotateX = 0;
        this.rotateY = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupViewControls();
        this.setupZoomControls();
        this.startAutoRotation();
    }

    setupEventListeners() {
        // Mouse events for desktop
        this.productModel.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.stopAutoRotation();
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.startX;
            const deltaY = e.clientY - this.startY;

            this.rotateY += deltaX * 0.5;
            this.rotateX -= deltaY * 0.5;

            this.updateRotation();

            this.startX = e.clientX;
            this.startY = e.clientY;
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            setTimeout(() => this.startAutoRotation(), 3000);
        });

        // Touch events for mobile
        this.productModel.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            this.stopAutoRotation();
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;

            const deltaX = e.touches[0].clientX - this.startX;
            const deltaY = e.touches[0].clientY - this.startY;

            this.rotateY += deltaX * 0.5;
            this.rotateX -= deltaY * 0.5;

            this.updateRotation();

            this.startX = e.touches[0].clientX;
            this.startY = e.touches[0].clientY;
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            this.isDragging = false;
            setTimeout(() => this.startAutoRotation(), 3000);
        });

        // Zoom with scroll
        this.productModel.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.scale = Math.min(Math.max(0.5, this.scale + delta), 2);
            this.updateZoom();
        });
    }

    setupViewControls() {
        const viewDots = document.querySelectorAll('.view-dot');
        const currentViewSpan = document.querySelector('.current-view');
        const productViews = document.querySelectorAll('.product-view');

        viewDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const view = dot.dataset.view;
                this.showView(view);

                // Update active dot
                viewDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');

                // Update current view text
                currentViewSpan.textContent = this.getViewName(view);
            });
        });

        // Auto rotate button
        const autoRotateBtn = document.getElementById('autoRotate');
        autoRotateBtn.addEventListener('click', () => {
            if (this.isRotating) {
                this.stopAutoRotation();
                autoRotateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Auto Rotate';
            } else {
                this.startAutoRotation();
                autoRotateBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Rotation';
            }
        });

        // Reset button
        const resetBtn = document.getElementById('resetView');
        resetBtn.addEventListener('click', () => {
            this.rotateX = 0;
            this.rotateY = 0;
            this.scale = 1;
            this.showView('front');
            this.updateRotation();
            this.updateZoom();

            // Reset view dots
            viewDots.forEach(d => d.classList.remove('active'));
            document.querySelector('.view-dot[data-view="front"]').classList.add('active');
            currentViewSpan.textContent = 'Front View';
        });
    }

    setupZoomControls() {
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const zoomLevelSpan = document.querySelector('.zoom-level');

        zoomInBtn.addEventListener('click', () => {
            this.scale = Math.min(2, this.scale + 0.1);
            this.updateZoom();
            zoomLevelSpan.textContent = `${Math.round(this.scale * 100)}%`;
        });

        zoomOutBtn.addEventListener('click', () => {
            this.scale = Math.max(0.5, this.scale - 0.1);
            this.updateZoom();
            zoomLevelSpan.textContent = `${Math.round(this.scale * 100)}%`;
        });
    }

    showView(view) {
        this.currentView = view;
        this.stopAutoRotation();

        // Hide all views
        document.querySelectorAll('.product-view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        document.querySelector(`.${view}-view`).classList.add('active');

        // Reset rotation for specific views
        switch (view) {
            case 'front':
                this.rotateX = 0;
                this.rotateY = 0;
                break;
            case 'back':
                this.rotateX = 0;
                this.rotateY = 180;
                break;
            case 'side':
                this.rotateX = 0;
                this.rotateY = 90;
                break;
            case 'top':
                this.rotateX = 90;
                this.rotateY = 0;
                break;
        }

        this.updateRotation();
    }

    getViewName(view) {
        const viewNames = {
            'front': 'Front View',
            'back': 'Back View',
            'side': 'Side View',
            'top': 'Top View'
        };
        return viewNames[view] || 'Product View';
    }

    updateRotation() {
        this.productModel.style.transform = `
            rotateX(${this.rotateX}deg) 
            rotateY(${this.rotateY}deg) 
            scale(${this.scale})
        `;
    }

    updateZoom() {
        this.updateRotation();
        document.querySelector('.zoom-level').textContent = `${Math.round(this.scale * 100)}%`;
    }

    startAutoRotation() {
        if (this.isRotating) return;

        this.isRotating = true;
        this.rotationInterval = setInterval(() => {
            this.rotateY += 0.5;
            this.updateRotation();
        }, 50);
    }

    stopAutoRotation() {
        if (!this.isRotating) return;

        this.isRotating = false;
        clearInterval(this.rotationInterval);
    }
}

// Order Management
class OrderManager {
    constructor() {
        this.price = 499;
        this.quantity = 1;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTotalPrice();
    }

    setupEventListeners() {
        // Quantity controls
        const minusBtn = document.querySelector('.qty-btn.minus');
        const plusBtn = document.querySelector('.qty-btn.plus');
        const quantityInput = document.getElementById('quantity');

        minusBtn.addEventListener('click', () => {
            if (this.quantity > 1) {
                this.quantity--;
                quantityInput.value = this.quantity;
                this.updateTotalPrice();
            }
        });

        plusBtn.addEventListener('click', () => {
            if (this.quantity < 10) {
                this.quantity++;
                quantityInput.value = this.quantity;
                this.updateTotalPrice();
            }
        });

        // WhatsApp order buttons
        const whatsappButtons = [
            document.getElementById('whatsappOrder'),
            document.getElementById('ctaWhatsApp'),
            document.querySelector('.whatsapp-contact-btn'),
            document.querySelector('.btn-submit')
        ];

        whatsappButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    if (btn.type === 'submit') {
                        e.preventDefault();
                    }
                    this.openWhatsAppOrder();
                });
            }
        });

        // Call buttons
        const callButtons = [
            document.getElementById('callNow'),
            document.getElementById('ctaCall'),
            document.querySelector('.call-contact-btn')
        ];

        callButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    this.makePhoneCall();
                });
            }
        });

        // Email button
        const emailBtn = document.querySelector('.email-contact-btn');
        if (emailBtn) {
            emailBtn.addEventListener('click', () => {
                this.sendEmail();
            });
        }
    }

    updateTotalPrice() {
        const total = this.price * this.quantity;
        document.getElementById('totalPrice').textContent = total;
    }

    openWhatsAppOrder() {
        const name = document.getElementById('name')?.value || "Customer";
        const phone = document.getElementById('phone')?.value || "";
        const address = document.getElementById('address')?.value || "";

        const message = `*New Order - VENNIV Care AURYEDA Hair Oil*%0A%0A` +
            `*Customer Details:*%0A` +
            `Name: ${name}%0A` +
            `Phone: ${phone}%0A` +
            `Address: ${address}%0A%0A` +
            `*Order Details:*%0A` +
            `Product: VENNIV Homemade Herbal Hair Growth Oil%0A` +
            `Quantity: ${this.quantity}%0A` +
            `Price: ₹${this.price} each%0A` +
            `Total: ₹${this.price * this.quantity}%0A%0A` +
            `*Additional Notes:*%0A` +
            `I would like to place an order. Please confirm availability and delivery time.`;

        window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');

        // Show confirmation message
        this.showToast('Opening WhatsApp for order placement...');
    }

    makePhoneCall() {
        window.location.href = 'tel:+919876543210';
    }

    sendEmail() {
        const subject = 'VENNIV Hair Oil Inquiry';
        const body = `Hello,%0A%0AI am interested in VENNIV Hair Oil. Please contact me with more information.%0A%0AThank you.`;
        window.location.href = `mailto:care@venniv.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--primary-green);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease, slideOutRight 0.3s ease 2.7s;
            box-shadow: var(--shadow-heavy);
        `;

        // Add keyframes if not already added
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Mobile Navigation
function setupMobileNavigation() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const mobileNav = document.querySelector('.mobile-nav');

    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.style.display = mobileNav.style.display === 'block' ? 'none' : 'block';
        mobileMenuBtn.innerHTML = mobileNav.style.display === 'block' ?
            '<i class="fas fa-times"></i>' :
            '<i class="fas fa-bars"></i>';
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-right') && !e.target.closest('.mobile-nav')) {
            mobileNav.style.display = 'none';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    // Smooth scroll for mobile nav links
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Close mobile nav after click
                mobileNav.style.display = 'none';
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });
}

// Form Validation
function setupFormValidation() {
    const orderForm = document.getElementById('orderForm');

    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name');
            const phone = document.getElementById('phone');
            const address = document.getElementById('address');
            let isValid = true;

            // Reset errors
            [name, phone, address].forEach(input => {
                input.style.borderColor = '';
            });

            // Validate name
            if (!name.value.trim()) {
                name.style.borderColor = '#ff6b6b';
                isValid = false;
            }

            // Validate phone (simple validation)
            if (!phone.value.trim() || phone.value.length < 10) {
                phone.style.borderColor = '#ff6b6b';
                isValid = false;
            }

            // Validate address
            if (!address.value.trim()) {
                address.style.borderColor = '#ff6b6b';
                isValid = false;
            }

            if (isValid) {
                orderManager.openWhatsAppOrder();
            } else {
                orderManager.showToast('Please fill all required fields correctly!');
            }
        });
    }
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D Viewer
    const productViewer = new Product3DViewer();

    // Initialize Order Manager
    const orderManager = new OrderManager();
    window.orderManager = orderManager;

    // Setup mobile navigation
    setupMobileNavigation();

    // Setup form validation
    setupFormValidation();

    // Add scroll effect to navbar
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });

    // Smooth scroll for desktop nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Lazy load images
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        if (img.dataset.src) {
            imageObserver.observe(img);
        }
    });
});