/**
 * TrustLend Tier Management System
 * Handles billing tiers, feature activation, and progressive disclosure
 */

class TierManager {
    constructor() {
        this.currentTier = 'basic';
        this.paymentCompleted = false;
        this.features = {
            basic: [
                'standardContract',
                'basicSignatures', 
                'emailDelivery',
                'basicAuditTrail'
            ],
            enhanced: [
                'standardContract',
                'basicSignatures',
                'emailDelivery', 
                'basicAuditTrail',
                'advancedAnalytics',
                'creditReporting',
                'autoReminders',
                'premiumTemplates',
                'paymentTracking',
                'enhancedAuditTrail'
            ],
            premium: [
                'standardContract',
                'basicSignatures',
                'emailDelivery',
                'basicAuditTrail', 
                'advancedAnalytics',
                'creditReporting',
                'autoReminders',
                'premiumTemplates',
                'paymentTracking',
                'enhancedAuditTrail',
                'customBranding',
                'bulkOperations',
                'apiAccess',
                'prioritySupport',
                'whiteLabel',
                'dedicatedManager'
            ]
        };
        
        this.pricing = {
            basic: { amount: 9.00, name: 'Basic' },
            enhanced: { amount: 19.00, name: 'Enhanced' },
            premium: { amount: 39.00, name: 'Premium' }
        };
        
        this.init();
    }
    
    init() {
        this.loadSavedTier();
        this.bindEvents();
    }
    
    loadSavedTier() {
        const saved = localStorage.getItem('trustlend_tier');
        if (saved) {
            const tierData = JSON.parse(saved);
            this.currentTier = tierData.tier;
            this.paymentCompleted = tierData.paymentCompleted;
        }
    }
    
    saveTier() {
        const tierData = {
            tier: this.currentTier,
            paymentCompleted: this.paymentCompleted,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('trustlend_tier', JSON.stringify(tierData));
    }
    
    bindEvents() {
        // Listen for tier selection events
        document.addEventListener('tierSelected', (e) => {
            this.selectTier(e.detail.tier);
        });
        
        document.addEventListener('paymentCompleted', (e) => {
            this.activatePayment();
        });
    }
    
    selectTier(tier) {
        if (!this.pricing[tier]) {
            console.error(`Invalid tier: ${tier}`);
            return;
        }
        
        this.currentTier = tier;
        this.updateTierDisplay();
        this.showTierFeatures();
        this.saveTier();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('tierChanged', {
            detail: { tier: tier, features: this.getActiveFeatures() }
        }));
    }
    
    activatePayment() {
        this.paymentCompleted = true;
        this.activateFeatures();
        this.saveTier();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('featuresActivated', {
            detail: { tier: this.currentTier, features: this.getActiveFeatures() }
        }));
    }
    
    getActiveFeatures() {
        if (!this.paymentCompleted && this.currentTier !== 'basic') {
            return this.features.basic; // Only basic features until payment
        }
        return this.features[this.currentTier] || this.features.basic;
    }
    
    hasFeature(featureName) {
        return this.getActiveFeatures().includes(featureName);
    }
    
    updateTierDisplay() {
        const tierBadges = document.querySelectorAll('[data-tier-badge]');
        const featureCounts = document.querySelectorAll('[data-feature-count]');
        
        const tierInfo = this.pricing[this.currentTier];
        const featureCount = this.getActiveFeatures().length;
        
        tierBadges.forEach(badge => {
            badge.textContent = `${tierInfo.name} Plan`;
            badge.className = this.getTierBadgeClass(this.currentTier);
        });
        
        featureCounts.forEach(count => {
            count.textContent = `${featureCount} features active`;
        });
    }
    
    getTierBadgeClass(tier) {
        const baseClasses = 'text-white px-3 py-1 rounded-full text-sm font-semibold';
        const tierClasses = {
            basic: 'bg-gray-600',
            enhanced: 'bg-blue-600', 
            premium: 'bg-purple-600'
        };
        return `${baseClasses} ${tierClasses[tier]}`;
    }
    
    showTierFeatures() {
        // Step 3 - Review Contract Features
        this.updateStep3Features();
        
        // Step 5 - Signature Features  
        this.updateStep5Features();
        
        // Step 6 - Delivery Features
        this.updateStep6Features();
    }
    
    updateStep3Features() {
        const enhancedPreview = document.getElementById('enhancedFeaturesPreview');
        
        if (this.currentTier !== 'basic') {
            enhancedPreview?.classList.remove('hidden');
            this.populateEnhancedFeatures(enhancedPreview);
        } else {
            enhancedPreview?.classList.add('hidden');
        }
    }
    
    populateEnhancedFeatures(container) {
        const featuresList = container.querySelector('.space-y-2');
        if (!featuresList) return;
        
        const enhancedFeatures = [
            { icon: '📊', text: 'Advanced payment analytics & tracking' },
            { icon: '🏦', text: 'Credit bureau reporting (if applicable)' },
            { icon: '🔔', text: 'Automated payment reminders' },
            { icon: '📋', text: 'Premium contract templates' }
        ];
        
        if (this.currentTier === 'premium') {
            enhancedFeatures.push(
                { icon: '🎨', text: 'Custom branding options' },
                { icon: '📊', text: 'Bulk contract operations' },
                { icon: '🔗', text: 'API access for integration' }
            );
        }
        
        featuresList.innerHTML = enhancedFeatures.map(feature => `
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>${feature.icon} ${feature.text}</span>
            </div>
        `).join('');
    }
    
    updateStep5Features() {
        const premiumTemplates = document.getElementById('premiumTemplateSection');
        const autoReminders = document.getElementById('autoRemindersSection');
        const tierNotice = document.getElementById('tierActivationNotice');
        
        if (this.hasFeature('premiumTemplates') && this.paymentCompleted) {
            premiumTemplates?.classList.remove('hidden');
        }
        
        if (this.hasFeature('autoReminders') && this.paymentCompleted) {
            autoReminders?.classList.remove('hidden');
        }
        
        if (this.currentTier !== 'basic' && this.paymentCompleted) {
            tierNotice?.classList.remove('hidden');
        }
    }
    
    updateStep6Features() {
        const tierConfirmation = document.getElementById('tierFeaturesConfirmation');
        
        if (this.currentTier !== 'basic' && this.paymentCompleted) {
            tierConfirmation?.classList.remove('hidden');
            this.populateDeliveryFeatures(tierConfirmation);
        }
    }
    
    populateDeliveryFeatures(container) {
        const grid = container.querySelector('.grid');
        if (!grid) return;
        
        const activeFeatures = this.getActiveFeatures();
        const featureLabels = {
            'advancedAnalytics': 'Payment analytics enabled',
            'autoReminders': 'Auto reminders configured', 
            'creditReporting': 'Credit reporting active',
            'premiumTemplates': 'Premium templates used',
            'customBranding': 'Custom branding applied',
            'apiAccess': 'API access granted'
        };
        
        const displayFeatures = activeFeatures
            .filter(f => featureLabels[f])
            .slice(0, 4); // Show max 4 in grid
            
        grid.innerHTML = displayFeatures.map(feature => `
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>${featureLabels[feature]}</span>
            </div>
        `).join('');
    }
    
    activateFeatures() {
        // Activate all paid features immediately after payment
        console.log(`Activating ${this.currentTier} tier features`);
        
        // Update all UI elements
        this.showTierFeatures();
        this.updateTierDisplay();
        
        // Show activation notifications
        this.showActivationNotification();
    }
    
    showActivationNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>✨ ${this.pricing[this.currentTier].name} features activated!</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
    
    // Progressive Feature Disclosure
    revealFeatureAtStep(step, featureName) {
        if (!this.hasFeature(featureName)) {
            return false;
        }
        
        const stepFeatures = {
            3: ['advancedAnalytics', 'creditReporting'],
            4: ['premiumTemplates', 'customBranding'],
            5: ['autoReminders', 'prioritySupport'],
            6: ['apiAccess', 'bulkOperations']
        };
        
        return stepFeatures[step]?.includes(featureName) || false;
    }
    
    // Value Reinforcement
    showValueReinforcement() {
        const tierStatus = document.getElementById('previewTierStatus');
        if (!tierStatus) return;
        
        const activeCount = this.getActiveFeatures().length;
        const valueMessages = {
            basic: `${activeCount} essential features`,
            enhanced: `${activeCount} advanced features unlocked`,
            premium: `${activeCount} premium features + priority support`
        };
        
        tierStatus.innerHTML = `
            <div class="text-sm text-gray-600 mb-2">📈 Plan Status</div>
            <div class="flex items-center justify-between">
                <span class="${this.getTierBadgeClass(this.currentTier)}">${this.pricing[this.currentTier].name} Plan</span>
                <span class="text-xs text-gray-600">${valueMessages[this.currentTier]}</span>
            </div>
        `;
    }
    
    // Analytics & Tracking
    trackFeatureUsage(featureName) {
        if (!this.hasFeature(featureName)) {
            console.warn(`Feature ${featureName} not available in ${this.currentTier} tier`);
            return false;
        }
        
        // Track feature usage
        const usage = JSON.parse(localStorage.getItem('feature_usage') || '{}');
        usage[featureName] = (usage[featureName] || 0) + 1;
        localStorage.setItem('feature_usage', JSON.stringify(usage));
        
        return true;
    }
    
    // Export tier configuration for other modules
    getConfig() {
        return {
            tier: this.currentTier,
            paymentCompleted: this.paymentCompleted,
            features: this.getActiveFeatures(),
            pricing: this.pricing[this.currentTier]
        };
    }
}

// Feature activation utilities
class FeatureActivator {
    static showEnhancedFeature(elementId, featureName) {
        const tierManager = window.tierManager;
        const element = document.getElementById(elementId);
        
        if (element && tierManager.hasFeature(featureName)) {
            element.classList.remove('hidden');
            element.classList.add('feature-enhanced');
            
            // Add enhanced badge if not present
            if (!element.querySelector('.enhanced-badge')) {
                const badge = document.createElement('span');
                badge.className = 'enhanced-badge text-white px-2 py-1 rounded text-xs font-semibold mr-2';
                badge.textContent = '✨ Enhanced';
                element.querySelector('h3, h4, label')?.prepend(badge);
            }
        }
    }
    
    static hideBasicFeature(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    }
    
    static upgradePrompt(featureName, currentTier) {
        const requiredTier = FeatureActivator.getRequiredTier(featureName);
        
        return `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div class="flex items-center gap-2 mb-2">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="font-semibold text-blue-900">Upgrade to unlock this feature</span>
                </div>
                <p class="text-sm text-blue-800 mb-3">
                    This feature requires the ${requiredTier} plan. Upgrade now to access advanced functionality.
                </p>
                <button onclick="showUpgradeModal('${requiredTier}')" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Upgrade to ${requiredTier}
                </button>
            </div>
        `;
    }
    
    static getRequiredTier(featureName) {
        const featureTiers = {
            'advancedAnalytics': 'Enhanced',
            'creditReporting': 'Enhanced', 
            'autoReminders': 'Enhanced',
            'premiumTemplates': 'Enhanced',
            'customBranding': 'Premium',
            'bulkOperations': 'Premium',
            'apiAccess': 'Premium',
            'prioritySupport': 'Premium'
        };
        
        return featureTiers[featureName] || 'Enhanced';
    }
}

// Initialize global tier manager
window.addEventListener('DOMContentLoaded', () => {
    window.tierManager = new TierManager();
    window.FeatureActivator = FeatureActivator;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TierManager, FeatureActivator };
}