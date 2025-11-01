/**
 * TrustLend Tier Management System - FIXED VERSION
 * Handles billing tiers, feature activation, and contract preview updates
 * Compatible with create-note.html tier selection
 */

class TierManager {
    constructor() {
        this.currentTier = 'essential';
        this.paymentCompleted = false;
        this.features = {
            essential: [
                'legalContractCreation',
                'digitalSignaturesBothParties',
                'emailDeliveryTracking',
                'pdfDownload',
                'inPersonSigning',
                'basicAuditTrail'
            ],
            maximum: [
                'legalContractCreation',
                'digitalSignaturesBothParties',
                'emailDeliveryTracking',
                'pdfDownload',
                'inPersonSigning',
                'basicAuditTrail',
                'automaticPaymentReminders',
                'blockchainTimestampProof',
                'remoteSigningWithId',
                'courtEvidencePackage',
                'smartReminderEscalation',
                'fullLegalComplianceSuite'
            ]
        };
        
        this.pricing = {
            essential: { amount: 14.99, name: 'Essential Protection' },
            maximum: { amount: 29.99, name: 'Maximum Protection' }
        };
        
        this.init();
    }
    
    init() {
        this.loadSavedTier();
        this.bindEvents();
        
        // Make selectTier globally available for HTML onclick
        window.selectTier = (tier) => this.selectTier(tier);
        
        console.log('✅ TierManager initialized with Essential/Maximum tiers');
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
    
    // MAIN FUNCTION - Called directly from HTML onclick
    selectTier(tier) {
        if (!this.pricing[tier]) {
            console.error(`Invalid tier: ${tier}`);
            return;
        }
        
        console.log(`🎯 Selecting tier: ${tier}`);
        
        this.currentTier = tier;
        this.updateTierDisplay();
        this.updateTierSelection();
        this.updateContractPreview(); // NEW: Direct contract preview update
        this.showTierFeatures();
        this.saveTier();
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('tierChanged', {
            detail: { tier: tier, features: this.getActiveFeatures() }
        }));
        
        console.log(`✅ Contract preview updated for ${tier} tier`);
    }
    
    // NEW: Update tier selection visual feedback
    updateTierSelection() {
        // Remove selected class from all cards
        document.querySelectorAll('.tier-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Add selected class to chosen card
        const selectedCard = document.getElementById(`${this.currentTier}-tier-card`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Update summary
        const summary = document.getElementById('selectedTierSummary');
        const tierName = document.getElementById('selectedTierName');
        const tierPrice = document.getElementById('selectedTierPrice');
        
        if (summary && tierName && tierPrice) {
            const tierData = {
                essential: { name: 'Essential Protection', price: '$14.99' },
                maximum: { name: 'Maximum Protection', price: '$29.99' }
            };
            
            const current = tierData[this.currentTier];
            tierName.textContent = current.name;
            tierPrice.textContent = current.price;
            summary.classList.remove('hidden');
        }
        
        // Show payment section
        const paymentSection = document.getElementById('paymentSection');
        if (paymentSection) {
            paymentSection.classList.remove('hidden');
        }
    }
    
    // NEW: Contract Preview Update Function
    updateContractPreview() {
        this.updateContractPreviewPlanStatus();
        this.updateSecurityComplianceSection();
        this.updateTierPricingSection();
    }
    
    // NEW: Update Plan Status section in contract preview
    updateContractPreviewPlanStatus() {
        const currentTierEl = document.getElementById('previewCurrentTier');
        const featuresActiveEl = document.getElementById('previewFeaturesActive');
        
        if (!currentTierEl || !featuresActiveEl) {
            console.warn('Plan Status elements not found in contract preview');
            return;
        }
        
        const tierData = {
            essential: { 
                name: 'Essential Protection', 
                class: 'tier-badge bg-blue-600',
                featureCount: 6
            },
            maximum: { 
                name: 'Maximum Protection', 
                class: 'premium-badge bg-purple-600',
                featureCount: 10
            }
        };
        
        const current = tierData[this.currentTier];
        
        currentTierEl.textContent = current.name;
        currentTierEl.className = `${current.class} text-white px-2 py-1 rounded text-xs font-semibold`;
        featuresActiveEl.textContent = `${current.featureCount} features active`;
        
        console.log(`✅ Plan Status updated: ${current.name}`);
    }
    
    // NEW: Update Security & Compliance section
    updateSecurityComplianceSection() {
        const securitySection = document.getElementById('previewSecurityFeatures');
        if (!securitySection) {
            console.warn('Security features section not found');
            return;
        }
        
        const tierFeatures = {
            essential: [
                { icon: '📝', text: 'Legal contract creation' },
                { icon: '✍️', text: 'Digital signatures (both parties)' },
                { icon: '📧', text: 'Email delivery & tracking' },
                { icon: '📄', text: 'PDF download' },
                { icon: '⚖️', text: 'E-SIGN Act compliance' },
                { icon: '🔗', text: 'Basic audit trail' }
            ],
            maximum: [
                { icon: '📝', text: 'Legal contract creation' },
                { icon: '✍️', text: 'Digital signatures (both parties)' },
                { icon: '📧', text: 'Email delivery & tracking' },
                { icon: '📄', text: 'PDF download' },
                { icon: '🔔', text: 'Automatic payment reminders', enhanced: true },
                { icon: '🔐', text: 'Blockchain timestamp proof', enhanced: true },
                { icon: '📱', text: 'Remote signing with ID verification', enhanced: true },
                { icon: '📋', text: 'Court evidence package', enhanced: true },
                { icon: '🚀', text: 'Smart reminder escalation', enhanced: true },
                { icon: '⚖️', text: 'Full legal compliance suite', enhanced: true }
            ]
        };
        
        const currentFeatures = tierFeatures[this.currentTier];
        
        securitySection.innerHTML = currentFeatures.map(feature => `
            <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <span>${feature.icon} ${feature.text}</span>
                ${feature.enhanced ? '<span class="text-xs bg-purple-100 text-purple-800 px-1 py-0.5 rounded ml-2">✨ Enhanced</span>' : ''}
            </div>
        `).join('');
        
        console.log(`✅ Security & Compliance updated with ${currentFeatures.length} features`);
    }
    
    // NEW: Update tier pricing section
    updateTierPricingSection() {
        const tierNameEl = document.getElementById('previewTierName');
        const tierPriceEl = document.getElementById('previewTierPrice');
        const processingFeeEl = document.getElementById('previewProcessingFee');
        const planTotalEl = document.getElementById('previewPlanTotal');
        
        if (!tierNameEl || !tierPriceEl || !processingFeeEl || !planTotalEl) {
            console.warn('Some tier pricing elements not found');
            return;
        }
        
        const current = this.pricing[this.currentTier];
        const processingFee = Math.round((current.amount * 0.029 + 0.30) * 100) / 100;
        const planTotal = current.amount + processingFee;
        
        tierNameEl.textContent = `${current.name}:`;
        tierPriceEl.textContent = `$${current.amount.toFixed(2)}`;
        processingFeeEl.textContent = `$${processingFee.toFixed(2)}`;
        planTotalEl.textContent = `$${planTotal.toFixed(2)}`;
        
        console.log(`✅ Tier Pricing updated: ${current.name} - $${planTotal.toFixed(2)}`);
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
        if (!this.paymentCompleted && this.currentTier !== 'essential') {
            return this.features.essential; // Only essential features until payment
        }
        return this.features[this.currentTier] || this.features.essential;
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
            essential: 'bg-blue-600',
            maximum: 'bg-purple-600'
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
        
        if (this.currentTier === 'maximum') {
            enhancedPreview?.classList.remove('hidden');
            this.populateEnhancedFeatures(enhancedPreview);
        } else {
            enhancedPreview?.classList.add('hidden');
        }
    }
    
    populateEnhancedFeatures(container) {
        const featuresList = container?.querySelector('.space-y-2');
        if (!featuresList) return;
        
        const enhancedFeatures = [
            { icon: '🔔', text: 'Automatic payment reminders & tracking' },
            { icon: '🔐', text: 'Blockchain timestamp proof for court evidence' },
            { icon: '📱', text: 'Remote signing with ID verification' },
            { icon: '📋', text: 'Complete court evidence package' },
            { icon: '🚀', text: 'Smart reminder escalation system' }
        ];
        
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
        const enhancedSignatureOptions = document.getElementById('enhancedSignatureOptions');
        
        if (this.hasFeature('blockchainTimestampProof') && this.paymentCompleted) {
            premiumTemplates?.classList.remove('hidden');
            autoReminders?.classList.remove('hidden');
            enhancedSignatureOptions?.classList.remove('hidden');
        }
        
        if (this.currentTier === 'maximum' && this.paymentCompleted) {
            tierNotice?.classList.remove('hidden');
        }
    }
    
    updateStep6Features() {
        const tierConfirmation = document.getElementById('tierFeaturesConfirmation');
        
        if (this.currentTier === 'maximum' && this.paymentCompleted) {
            tierConfirmation?.classList.remove('hidden');
            this.populateDeliveryFeatures(tierConfirmation);
        }
    }
    
    populateDeliveryFeatures(container) {
        const grid = container?.querySelector('.grid');
        if (!grid) return;
        
        const activeFeatures = this.getActiveFeatures();
        const featureLabels = {
            'automaticPaymentReminders': 'Automatic payment reminders activated',
            'blockchainTimestampProof': 'Blockchain timestamp proof enabled', 
            'remoteSigningWithId': 'Remote signing with ID verification enabled',
            'courtEvidencePackage': 'Court evidence package included',
            'smartReminderEscalation': 'Smart reminder escalation enabled'
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
        this.updateContractPreview();
        
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
        
        if (element && tierManager?.hasFeature(featureName)) {
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
}

// Initialize global tier manager
window.addEventListener('DOMContentLoaded', () => {
    window.tierManager = new TierManager();
    window.FeatureActivator = FeatureActivator;
    
    console.log('🚀 TierManager loaded and ready for HTML tier selection');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TierManager, FeatureActivator };
}
