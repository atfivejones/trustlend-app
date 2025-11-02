/**
 * TrustLend Contracts & Tier Management
 * Handles contract creation, tier selection, and contract management
 */

const TrustLendContracts = {
    // Contract state
    state: {
        currentTier: 'essential',
        contractData: {
            loanAmount: 0,
            optionalFee: 0,
            paymentSchedule: 'monthly',
            loanTerm: 12,
            lender: {},
            borrower: {},
            purpose: ''
        },
        tierPricing: {
            essential: 14.99,
            maximum: 29.99
        },
        tierFeatures: {
            essential: [
                'UCC Article 3 compliant promissory note',
                'In-person or remote digital signing',
                'Automatic payment reminder system',
                'Blockchain timestamp verification',
                'Complete audit trail & evidence package',
                'Professional PDF with execution certificate'
            ],
            maximum: [
                'Everything in Essential, plus:',
                'AI-powered ID verification for both parties',
                'Enhanced audit trail (IP, device, geolocation)',
                'Payment receipt embedding in PDF',
                'Extended legal templates & language',
                'Priority customer support'
            ]
        }
    },

    // Initialize contract functionality
    init() {
        console.log('Initializing TrustLend Contracts...');
        this.setupTierSelection();
        this.setupContractPreview();
        this.setupFormHandlers();
        this.setupContractActions();
        this.initializeCurrentPage();
    },

    initializeCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('create-note')) {
            this.initializeContractCreation();
        } else if (path.includes('contracts')) {
            this.initializeContractManagement();
        }
    },

    // ===== TIER SELECTION =====
    setupTierSelection() {
        const tierCards = document.querySelectorAll('.tier-card');
        tierCards.forEach(card => {
            card.addEventListener('click', () => {
                this.selectTier(card.dataset.tier);
            });
        });

        // Initialize with default tier
        this.selectTier('essential');
    },

    selectTier(tierName) {
        console.log('Selecting tier:', tierName);
        this.state.currentTier = tierName;
        
        // Update UI
        this.updateTierSelection(tierName);
        this.updateContractPreview();
        this.updatePlanStatus();
        this.updateSecurityFeatures();
        this.updatePricingSection();
    },

    updateTierSelection(selectedTier) {
        const tierCards = document.querySelectorAll('.tier-card');
        tierCards.forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.tier === selectedTier) {
                card.classList.add('selected');
            }
        });
    },

    updatePlanStatus() {
        const planStatusElement = document.querySelector('.plan-status');
        if (!planStatusElement) return;

        const tier = this.state.currentTier;
        planStatusElement.className = `plan-status ${tier}`;
        
        const statusText = tier === 'essential' ? 'Essential Protection' : 'Maximum Protection';
        const statusColor = tier === 'essential' ? '#1E40AF' : '#7C3AED';
        
        planStatusElement.innerHTML = `
            <span style="color: ${statusColor};">●</span>
            ${statusText}
        `;
    },

    updateSecurityFeatures() {
// New behavior: render into #securityFeaturesList if present
const idContainer = document.getElementById('securityFeaturesList');
const tier = this.state.currentTier;
if (idContainer) {
    const features = tier === 'essential' ? [
        'Legal contract creation',
        'Digital signatures (both parties)',
        'Email delivery & tracking',
        'PDF download',
        'Basic payment reminders',
        'Standard legal templates'
    ] : [
        'Legal contract creation',
        'Digital signatures (both parties)',
        'Email delivery & tracking',
        'PDF download',
        'Advanced payment reminders',
        'Premium legal templates',
        'Blockchain timestamp proof',
        'Enhanced audit trail',
        'Priority customer support',
        'Multi-language support'
    ];

    idContainer.innerHTML = features.map(feature => `
        <div class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <span>${feature}</span>
        </div>
    `).join('');
} else {
    // Legacy behavior: fall back to existing .security-features-list rendering to avoid breaking current UI
    const featuresContainer = document.querySelector('.security-features-list');
    if (!featuresContainer) return;

    const features = this.state.tierFeatures[tier];
    const featureCount = tier === 'essential' ? 6 : 10;

    featuresContainer.innerHTML = features.map(feature => `
        <li>
            <span class="check-icon">✓</span>
            ${feature}
            ${tier === 'maximum' && feature.includes('Enhanced') ? 
                '<span class="enhanced-badge">Enhanced</span>' : ''}
        </li>
    `).join('');

    const featureCountElement = document.querySelector('.feature-count');
    if (featureCountElement) {
        featureCountElement.textContent = `${featureCount} features`;
    }
}

    
}

if (tierPriceElement) {
    const price = tier === 'essential' ? '$14.99' : '$29.99';
    tierPriceElement.textContent = price;
}

// Also maintain the original preview rendering if the preview container exists
const previewElement = document.querySelector('.contract-preview-content');
if (previewElement) {
    const data = this.state.contractData;
    previewElement.innerHTML = this.generatePreviewHTML(data, tier);
}

// Update security features (new ID-based container first; otherwise fall back to legacy selector)
this.updateSecurityFeatures();

// Update total pricing breakdown
this.updatePricingCalculation();

    

    updatePricingCalculation() {
const tier = this.state.currentTier;
const basePrice = tier === 'essential' ? 14.99 : 29.99;
const processingFee = 1.17;
const total = basePrice + processingFee;

// Update new ID-based pricing elements
const elements = {
    'subtotal': `$${basePrice.toFixed(2)}`,
    'processing-fee': `$${processingFee.toFixed(2)}`,
    'total-amount': `$${total.toFixed(2)}`
};

Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
});

// Maintain legacy pricing section update (if present) so existing UI still works
const priceElement = document.querySelector('.tier-price-display');
if (priceElement) {
    priceElement.textContent = `$${basePrice}`;
}

    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TrustLendContracts.init();
});

// Expose to global scope
window.TrustLendContracts = TrustLendContracts;
