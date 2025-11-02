/**
 * TrustLend Main Application JavaScript
 * Consolidated frontend functionality
 */

// ===== APPLICATION STATE =====
const TrustLend = {
    // Global app state
    state: {
        currentUser: null,
        selectedTier: null,
        contractData: {},
        isLoading: false
    },
    
    // Configuration
    config: {
        stripePublishableKey: 'pk_test_YOUR_KEY_HERE', // Replace with actual key
        apiBaseUrl: '/api', // Will be replaced during backend integration
        supportedPaymentSchedules: ['weekly', 'biweekly', 'monthly', 'lump'],
        maxLoanAmount: 1000000,
        minLoanAmount: 100
    },

    // Initialize the application
    init() {
        console.log('TrustLend initializing...');
        this.setupEventListeners();
        this.checkAuthState();
        this.initializeCurrentPage();
    },

    // ===== AUTHENTICATION STATE =====
    checkAuthState() {
        // Check if user is logged in (will be replaced with actual auth)
        const isLoggedIn = localStorage.getItem('trustlend_auth') === 'true';
        const currentPath = window.location.pathname;
        
        // Route protection logic
        const publicPages = ['/', '/index.html'];
        const isPublicPage = publicPages.some(page => currentPath.endsWith(page) || currentPath === '/');
        
        if (!isLoggedIn && !isPublicPage) {
            // Redirect to login if accessing private page without auth
            console.log('Redirecting to login...');
            // window.location.href = '/index.html';
        }
        
        this.updateNavigation(isLoggedIn);
    },

    updateNavigation(isLoggedIn) {
        const nav = document.querySelector('.nav-links');
        if (!nav) return;

        if (isLoggedIn) {
            // Show private navigation
            this.showPrivateNavigation();
        } else {
            // Show public navigation  
            this.showPublicNavigation();
        }
    },

    showPrivateNavigation() {
        // Update logo to point to dashboard
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.href = 'dashboard.html';
        }
    },

    showPublicNavigation() {
        // Update logo to point to homepage
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.href = 'index.html';
        }
    },

    // ===== PAGE-SPECIFIC INITIALIZATION =====
    initializeCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('create-note')) {
            this.initializeCreateNotePage();
        } else if (path.includes('dashboard')) {
            this.initializeDashboardPage();
        } else if (path.includes('contracts')) {
            this.initializeContractsPage();
        } else if (path.includes('profile')) {
            this.initializeProfilePage();
        } else if (path.includes('index') || path === '/') {
            this.initializeHomePage();
        }
    },

    initializeHomePage() {
        console.log('Initializing homepage...');
        // Homepage-specific functionality
        this.setupSmoothScrolling();
        this.setupPublicFormHandlers();
    },

    initializeCreateNotePage() {
        console.log('Initializing create note page...');
        this.setupFormValidation();
        this.setupTierSelection();
        this.setupContractPreview();
        this.calculatePayments();
    },

    initializeDashboardPage() {
        console.log('Initializing dashboard...');
        this.setupQuickActions();
        this.loadDashboardData();
    },

    initializeContractsPage() {
        console.log('Initializing contracts page...');
        this.setupContractFilters();
        this.setupContractActions();
    },

    initializeProfilePage() {
        console.log('Initializing profile page...');
        this.setupProfileTabs();
        this.setupUserDropdown();
    },

    // ===== GLOBAL EVENT LISTENERS =====
    setupEventListeners() {
        // Global navigation handlers
        this.setupUserDropdown();
        this.setupMobileMenu();
        this.setupLoadingStates();
        
        // Form submission prevention for demo
        this.preventFormSubmissions();
    },

    setupUserDropdown() {
        const userButton = document.querySelector('.user-dropdown-trigger');
        const dropdown = document.querySelector('.user-dropdown-menu');
        
        if (userButton && dropdown) {
            userButton.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdown.classList.add('hidden');
            });

            // Prevent dropdown from closing when clicking inside it
            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    },

    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    },

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    // ===== LOADING STATES =====
    setupLoadingStates() {
        // Add loading states to buttons and forms
        document.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        // Button click loading states
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-loading')) {
                this.setButtonLoading(e.target, true);
                
                // Demo: Remove loading after 2 seconds
                setTimeout(() => {
                    this.setButtonLoading(e.target, false);
                }, 2000);
            }
        });
    },

    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.classList.add('loading');
            const originalText = button.textContent;
            button.dataset.originalText = originalText;
            button.innerHTML = `<span class="spinner"></span> ${originalText}`;
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            button.textContent = button.dataset.originalText || button.textContent;
        }
    },

    // ===== DEMO MODE HANDLERS =====
    preventFormSubmissions() {
        // Prevent actual form submissions in demo mode
        document.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submission prevented (demo mode)');
            
            // Show demo notification
            this.showNotification('Demo mode: Form submission simulated', 'info');
        });
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Basic form validation
        const isValid = this.validateForm(form);
        
        if (isValid) {
            console.log('Form validation passed');
            this.simulateFormSubmission(form);
        } else {
            console.log('Form validation failed');
        }
    },

    simulateFormSubmission(form) {
        // Simulate form submission with loading state
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (submitButton) {
            this.setButtonLoading(submitButton, true);
            
            setTimeout(() => {
                this.setButtonLoading(submitButton, false);
                this.showNotification('Form submitted successfully!', 'success');
            }, 2000);
        }
    },

    // ===== NOTIFICATIONS =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} fixed top-4 right-4 z-50 max-w-sm`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span>${message}</span>
                <button class="ml-auto text-lg" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },

    // ===== UTILITY FUNCTIONS =====
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // ===== QUICK ACTIONS (Dashboard) =====
    setupQuickActions() {
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.currentTarget.dataset.action;
                this.handleQuickAction(actionType);
            });
        });
    },

    handleQuickAction(actionType) {
        switch (actionType) {
            case 'create-contract':
                window.location.href = 'create-note.html';
                break;
            case 'send-reminder':
                this.showNotification('Payment reminder sent!', 'success');
                break;
            case 'download-docs':
                this.showNotification('Downloading documents...', 'info');
                break;
            default:
                console.log('Unknown action:', actionType);
        }
    },

    // ===== DEMO DATA LOADING =====
    loadDashboardData() {
        // Simulate loading dashboard data
        this.state.isLoading = true;
        
        setTimeout(() => {
            this.state.isLoading = false;
            console.log('Dashboard data loaded');
        }, 1000);
    }
};

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    TrustLend.showNotification('An error occurred. Please try again.', 'error');
});

// ===== INITIALIZE WHEN DOM IS READY =====
document.addEventListener('DOMContentLoaded', () => {
    TrustLend.init();
});

// ===== EXPOSE GLOBAL API =====
window.TrustLend = TrustLend;
