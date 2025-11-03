// app-updated.js - Main application logic and initialization
class TrustLendApp {
    constructor() {
        this.initialized = false;
        this.config = {
            apiBaseUrl: '/api',
            stripePublishableKey: 'pk_test_your_stripe_key_here',
            version: '1.0.0',
            debug: false
        };
        
        this.modules = {};
        this.eventListeners = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('TrustLend App initializing...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeApp());
            } else {
                this.initializeApp();
            }
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeApp() {
        try {
            // Initialize core modules
            await this.initializeModules();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Initialize UI components
            this.initializeUI();
            
            // Setup navigation
            this.setupNavigation();
            
            // Check authentication status
            await this.checkAuthStatus();
            
            // Setup periodic tasks
            this.setupPeriodicTasks();
            
            this.initialized = true;
            console.log('TrustLend App initialized successfully');
            
            // Dispatch app ready event
            this.dispatchEvent('app:ready');
            
        } catch (error) {
            console.error('App initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeModules() {
        // Wait for other modules to be available
        const maxWaitTime = 5000; // 5 seconds
        const startTime = Date.now();
        
        while (!window.trustLendContracts || !window.trustLendForms) {
            if (Date.now() - startTime > maxWaitTime) {
                throw new Error('Required modules failed to load within timeout');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Store references to other modules
        this.modules.contracts = window.trustLendContracts;
        this.modules.forms = window.trustLendForms;
        
        console.log('All modules loaded successfully');
    }

    setupGlobalEventListeners() {
        // Global error handling
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason);
        });

        // Responsive design helpers
        window.addEventListener('resize', this.debounce(() => {
            this.handleWindowResize();
        }, 250));

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Form autosave functionality
        document.addEventListener('input', this.debounce((e) => {
            if (e.target.form && e.target.form.classList.contains('autosave')) {
                this.autoSaveForm(e.target.form);
            }
        }, 1000));
    }

    initializeUI() {
        // Initialize tooltips
        this.initializeTooltips();
        
        // Initialize modals
        this.initializeModals();
        
        // Initialize theme
        this.initializeTheme();
        
        // Initialize loading states
        this.initializeLoadingStates();
        
        // Initialize notifications
        this.initializeNotifications();
        
        // Initialize accessibility features
        this.initializeAccessibility();
    }

    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            const tooltipText = element.getAttribute('data-tooltip');
            element.setAttribute('title', tooltipText);
            
            // Custom tooltip implementation
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, tooltipText);
            });
            
            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip();
            });
        });
    }

    showTooltip(element, text) {
        // Remove existing tooltip
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #333;
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        // Show tooltip
        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    initializeModals() {
        // Simple modal system
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-modal-target')) {
                e.preventDefault();
                const modalId = e.target.getAttribute('data-modal-target');
                this.showModal(modalId);
            }
            
            if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-backdrop')) {
                this.hideModal();
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.hideModal();
            }
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'block';
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        this.currentModal = modal;
        
        // Focus management
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }

    hideModal() {
        if (this.currentModal) {
            this.currentModal.style.display = 'none';
            this.currentModal.classList.remove('show');
            document.body.style.overflow = '';
            this.currentModal = null;
        }
    }

    initializeTheme() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('trustlend-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.setTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('trustlend-theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('trustlend-theme', theme);
        
        // Update theme toggle button if exists
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    initializeLoadingStates() {
        // Global loading overlay
        if (!document.querySelector('.loading-overlay')) {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            document.body.appendChild(loadingOverlay);
        }
    }

    showLoading(message = 'Loading...') {
        const overlay = document.querySelector('.loading-overlay');
        const messageEl = overlay.querySelector('p');
        if (messageEl) messageEl.textContent = message;
        overlay.style.display = 'flex';
    }

    hideLoading() {
        const overlay = document.querySelector('.loading-overlay');
        overlay.style.display = 'none';
    }

    initializeNotifications() {
        // Create notification container
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 1rem;
                right: 1rem;
                z-index: 1050;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.querySelector('.notification-container');
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification fade-in`;
        notification.style.cssText = `
            margin-bottom: 0.5rem;
            cursor: pointer;
        `;
        notification.innerHTML = `
            <span>${message}</span>
            <button type="button" class="close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        `;
        
        // Add to container
        container.appendChild(notification);
        
        // Auto-remove
        const timeout = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        // Manual close
        notification.addEventListener('click', () => {
            clearTimeout(timeout);
            this.removeNotification(notification);
        });
    }

    removeNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    initializeAccessibility() {
        // Skip to main content link
        if (!document.querySelector('.skip-link')) {
            const skipLink = document.createElement('a');
            skipLink.className = 'skip-link';
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 1000;
            `;
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            document.body.insertBefore(skipLink, document.body.firstChild);
        }

        // ARIA live regions for dynamic content
        if (!document.querySelector('#aria-live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'aria-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                top: auto;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
        }
    }

    announceToScreenReader(message) {
        const liveRegion = document.querySelector('#aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    setupNavigation() {
        // Single Page Application navigation (if needed)
        const navLinks = document.querySelectorAll('[data-navigate]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('data-navigate');
                this.navigateTo(target);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.navigateTo(e.state.page, false);
            }
        });
    }

    navigateTo(page, updateHistory = true) {
        // Hide all sections
        document.querySelectorAll('.app-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show target section
        const targetSection = document.querySelector(`[data-section="${page}"]`);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            if (updateHistory) {
                history.pushState({ page }, '', `#${page}`);
            }
            
            // Update navigation state
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            const activeNavLink = document.querySelector(`[data-navigate="${page}"]`);
            if (activeNavLink) {
                activeNavLink.classList.add('active');
            }
            
            // Announce navigation to screen readers
            this.announceToScreenReader(`Navigated to ${page} section`);
        }
    }

    async checkAuthStatus() {
        try {
            // Check if user is authenticated (replace with actual auth check)
            const response = await fetch('/api/auth/status', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const authData = await response.json();
                this.handleAuthenticationState(authData);
            }
        } catch (error) {
            console.log('Auth check failed:', error);
            // Handle unauthenticated state
            this.handleUnauthenticatedState();
        }
    }

    handleAuthenticationState(authData) {
        // Update UI for authenticated user
        const userElements = document.querySelectorAll('.user-info');
        userElements.forEach(el => {
            el.textContent = authData.user?.name || 'User';
        });

        // Show authenticated sections
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'block';
        });
    }

    handleUnauthenticatedState() {
        // Hide authenticated sections
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'none';
        });
    }

    setupPeriodicTasks() {
        // Auto-save forms every 30 seconds
        setInterval(() => {
            this.autoSaveAllForms();
        }, 30000);

        // Check for app updates every 5 minutes
        setInterval(() => {
            this.checkForUpdates();
        }, 300000);
    }

    autoSaveAllForms() {
        const autoSaveForms = document.querySelectorAll('.autosave');
        autoSaveForms.forEach(form => {
            this.autoSaveForm(form);
        });
    }

    autoSaveForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id || 'unnamed-form';
        
        // Save to localStorage
        localStorage.setItem(`autosave-${formId}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
        
        console.log(`Auto-saved form: ${formId}`);
    }

    restoreAutoSavedForm(formId) {
        const saved = localStorage.getItem(`autosave-${formId}`);
        if (saved) {
            try {
                const { data, timestamp } = JSON.parse(saved);
                const form = document.getElementById(formId);
                
                if (form && Date.now() - timestamp < 86400000) { // 24 hours
                    Object.entries(data).forEach(([name, value]) => {
                        const field = form.querySelector(`[name="${name}"]`);
                        if (field) field.value = value;
                    });
                    
                    this.showNotification('Form data restored from auto-save', 'info');
                }
            } catch (error) {
                console.error('Error restoring auto-saved form:', error);
            }
        }
    }

    async checkForUpdates() {
        try {
            const response = await fetch('/api/version');
            const { version } = await response.json();
            
            if (version !== this.config.version) {
                this.showNotification('A new version is available. Please refresh the page.', 'warning', 0);
            }
        } catch (error) {
            // Silently handle version check errors
        }
    }

    handleWindowResize() {
        // Handle responsive behavior
        const width = window.innerWidth;
        
        if (width < 768) {
            document.body.classList.add('mobile-view');
            document.body.classList.remove('desktop-view');
        } else {
            document.body.classList.add('desktop-view');
            document.body.classList.remove('mobile-view');
        }
        
        // Trigger resize event for modules
        this.dispatchEvent('app:resize', { width, height: window.innerHeight });
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page became hidden
            this.autoSaveAllForms();
        } else {
            // Page became visible
            this.checkForUpdates();
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S for save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const activeForm = document.querySelector('form:focus-within');
            if (activeForm) {
                this.autoSaveForm(activeForm);
                this.showNotification('Form saved', 'success', 2000);
            }
        }
        
        // Escape to close modals/tooltips
        if (e.key === 'Escape') {
            this.hideModal();
            this.hideTooltip();
        }
    }

    handleGlobalError(error) {
        console.error('Global error:', error);
        
        if (this.config.debug) {
            this.showNotification(`Error: ${error.message}`, 'danger', 10000);
        } else {
            this.showNotification('An unexpected error occurred. Please try again.', 'danger');
        }
        
        // Log error to analytics service (if configured)
        this.logError(error);
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Show fallback UI
        document.body.innerHTML = `
            <div class="error-state" style="text-align: center; padding: 2rem;">
                <h1>Application Error</h1>
                <p>Sorry, there was a problem loading the application.</p>
                <button onclick="location.reload()" class="btn btn-primary">Reload Page</button>
            </div>
        `;
    }

    logError(error) {
        // Send error to logging service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    }

    // Utility methods
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
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    // Public API methods
    getModule(name) {
        return this.modules[name];
    }

    isInitialized() {
        return this.initialized;
    }

    getConfig() {
        return { ...this.config };
    }

    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// Initialize the app
window.trustLendApp = new TrustLendApp();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrustLendApp;
}
