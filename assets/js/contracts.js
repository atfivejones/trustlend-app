// contracts-updated.js - Consolidated contract and tier management functionality
class TrustLendContracts {
    constructor() {
        this.currentTier = null;
        this.contractData = {};
        this.stripeInstance = null;
        this.init();
    }

    init() {
        this.initializeTierData();
        this.setupEventListeners();
        this.initializeStripe();
    }

    initializeTierData() {
        this.tiers = {
            basic: {
                name: 'Basic Tier',
                price: 29.99,
                priceId: 'price_basic_tier',
                features: [
                    'Standard note templates',
                    'Basic compliance checks',
                    'Email support',
                    'Up to 10 notes per month'
                ],
                limits: {
                    notesPerMonth: 10,
                    maxLoanAmount: 50000
                }
            },
            professional: {
                name: 'Professional Tier',
                price: 79.99,
                priceId: 'price_professional_tier',
                features: [
                    'Advanced note templates',
                    'Enhanced compliance validation',
                    'Priority support',
                    'Up to 50 notes per month',
                    'Custom branding',
                    'Advanced reporting'
                ],
                limits: {
                    notesPerMonth: 50,
                    maxLoanAmount: 250000
                }
            },
            enterprise: {
                name: 'Enterprise Tier',
                price: 199.99,
                priceId: 'price_enterprise_tier',
                features: [
                    'All professional features',
                    'Unlimited notes',
                    'White-label solution',
                    '24/7 phone support',
                    'Custom integrations',
                    'Dedicated account manager',
                    'Advanced analytics'
                ],
                limits: {
                    notesPerMonth: -1, // unlimited
                    maxLoanAmount: -1  // unlimited
                }
            }
        };
    }

    setupEventListeners() {
        // Tier selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'tier') {
                this.handleTierSelection(e.target.value);
            }
        });

        // Form changes that affect contract preview
        const watchedFields = ['loanAmount', 'interestRate', 'loanTerm', 'borrowerName', 'lenderName'];
        watchedFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('input', () => this.updateContractPreview());
                field.addEventListener('change', () => this.updateContractPreview());
            }
        });

        // Generate contract button
        const generateBtn = document.querySelector('.generate-contract-btn, #generateContract');
        if (generateBtn) {
            generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateContract();
            });
        }

        // Purchase/Subscribe buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('purchase-tier-btn')) {
                const tier = e.target.dataset.tier;
                this.handleTierPurchase(tier);
            }
        });
    }

    handleTierSelection(tierKey) {
        console.log('Tier selected:', tierKey);
        this.currentTier = tierKey;
        
        // Update UI to show selected tier
        this.updateTierDisplay(tierKey);
        this.updateContractPreview();
        this.validateTierLimits();
        
        // Update tier-specific features visibility
        this.updateFeatureVisibility(tierKey);
    }

    updateTierDisplay(tierKey) {
        const tier = this.tiers[tierKey];
        if (!tier) return;

        // Update tier info display
        const tierInfoElements = {
            name: document.querySelector('.selected-tier-name'),
            price: document.querySelector('.selected-tier-price'),
            features: document.querySelector('.selected-tier-features')
        };

        if (tierInfoElements.name) {
            tierInfoElements.name.textContent = tier.name;
        }

        if (tierInfoElements.price) {
            tierInfoElements.price.textContent = `$${tier.price}/month`;
        }

        if (tierInfoElements.features) {
            tierInfoElements.features.innerHTML = tier.features
                .map(feature => `<li>${feature}</li>`)
                .join('');
        }

        // Update tier selection cards
        document.querySelectorAll('.tier-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-tier="${tierKey}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }

    validateTierLimits() {
        if (!this.currentTier) return;

        const tier = this.tiers[this.currentTier];
        const loanAmountField = document.querySelector('[name="loanAmount"]');
        
        if (loanAmountField && tier.limits.maxLoanAmount > 0) {
            const loanAmount = parseFloat(loanAmountField.value.replace(/[,$]/g, ''));
            
            if (loanAmount > tier.limits.maxLoanAmount) {
                this.showLimitError(`Loan amount exceeds ${tier.name} limit of $${tier.limits.maxLoanAmount.toLocaleString()}`);
                return false;
            }
        }

        this.clearLimitErrors();
        return true;
    }

    showLimitError(message) {
        let errorDiv = document.querySelector('.tier-limit-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'tier-limit-error alert alert-warning';
            const form = document.querySelector('.note-creation-form');
            if (form) {
                form.insertBefore(errorDiv, form.firstChild);
            }
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    clearLimitErrors() {
        const errorDiv = document.querySelector('.tier-limit-error');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    updateFeatureVisibility(tierKey) {
        const tier = this.tiers[tierKey];
        
        // Show/hide features based on tier
        const featureElements = {
            customBranding: document.querySelector('.custom-branding-section'),
            advancedReporting: document.querySelector('.advanced-reporting-section'),
            whiteLabel: document.querySelector('.white-label-section')
        };

        // Basic tier - hide advanced features
        if (tierKey === 'basic') {
            Object.values(featureElements).forEach(el => {
                if (el) el.style.display = 'none';
            });
        }
        
        // Professional tier - show some advanced features
        if (tierKey === 'professional') {
            if (featureElements.customBranding) featureElements.customBranding.style.display = 'block';
            if (featureElements.advancedReporting) featureElements.advancedReporting.style.display = 'block';
            if (featureElements.whiteLabel) featureElements.whiteLabel.style.display = 'none';
        }
        
        // Enterprise tier - show all features
        if (tierKey === 'enterprise') {
            Object.values(featureElements).forEach(el => {
                if (el) el.style.display = 'block';
            });
        }
    }

    updateContractPreview() {
        const formData = this.gatherFormData();
        const previewElement = document.querySelector('.contract-preview');
        
        if (!previewElement || !formData.borrowerName || !formData.lenderName) {
            return;
        }

        const contractText = this.generateContractText(formData);
        previewElement.innerHTML = `
            <div class="contract-preview-header">
                <h4>Contract Preview</h4>
                <small class="text-muted">This preview updates as you fill out the form</small>
            </div>
            <div class="contract-content">
                ${contractText}
            </div>
        `;
    }

    gatherFormData() {
        const formSelectors = {
            borrowerName: '[name="borrowerName"]',
            lenderName: '[name="lenderName"]',
            loanAmount: '[name="loanAmount"]',
            interestRate: '[name="interestRate"]',
            loanTerm: '[name="loanTerm"]',
            paymentFrequency: '[name="paymentFrequency"]',
            collateralDescription: '[name="collateralDescription"]'
        };

        const data = {};
        Object.entries(formSelectors).forEach(([key, selector]) => {
            const element = document.querySelector(selector);
            if (element) {
                data[key] = element.value;
            }
        });

        return data;
    }

    generateContractText(data) {
        const tier = this.currentTier ? this.tiers[this.currentTier] : null;
        const loanAmount = parseFloat(data.loanAmount?.replace(/[,$]/g, '')) || 0;
        const interestRate = parseFloat(data.interestRate) || 0;
        const loanTerm = parseInt(data.loanTerm) || 0;

        return `
            <h5>PROMISSORY NOTE</h5>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Principal Amount:</strong> $${loanAmount.toLocaleString()}</p>
            <p><strong>Borrower:</strong> ${data.borrowerName || '[Borrower Name]'}</p>
            <p><strong>Lender:</strong> ${data.lenderName || '[Lender Name]'}</p>
            
            <h6>Terms:</h6>
            <ul>
                <li>Interest Rate: ${interestRate}% per annum</li>
                <li>Term: ${loanTerm} months</li>
                <li>Payment Frequency: ${data.paymentFrequency || 'Monthly'}</li>
                ${data.collateralDescription ? `<li>Collateral: ${data.collateralDescription}</li>` : ''}
            </ul>
            
            ${tier ? `<p class="tier-info"><small>Generated using TrustLend ${tier.name}</small></p>` : ''}
            
            <div class="signature-section">
                <div class="signature-line">
                    <p>_________________________</p>
                    <p>Borrower Signature</p>
                </div>
                <div class="signature-line">
                    <p>_________________________</p>
                    <p>Lender Signature</p>
                </div>
            </div>
        `;
    }

    async generateContract() {
        if (!this.validateTierLimits()) {
            return;
        }

        const formData = this.gatherFormData();
        
        // Validate required fields
        const requiredFields = ['borrowerName', 'lenderName', 'loanAmount', 'interestRate', 'loanTerm'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return;
        }

        if (!this.currentTier) {
            alert('Please select a subscription tier to generate the contract.');
            return;
        }

        try {
            // Show loading state
            const generateBtn = document.querySelector('.generate-contract-btn, #generateContract');
            const originalText = generateBtn?.textContent;
            if (generateBtn) {
                generateBtn.textContent = 'Generating...';
                generateBtn.disabled = true;
            }

            // Simulate contract generation (replace with actual API call)
            await this.simulateContractGeneration(formData);
            
            // Success feedback
            this.showSuccessMessage('Contract generated successfully!');
            
        } catch (error) {
            console.error('Contract generation error:', error);
            alert('Error generating contract. Please try again.');
        } finally {
            // Reset button state
            const generateBtn = document.querySelector('.generate-contract-btn, #generateContract');
            if (generateBtn) {
                generateBtn.textContent = originalText || 'Generate Contract';
                generateBtn.disabled = false;
            }
        }
    }

    async simulateContractGeneration(formData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Here you would typically make an API call to your backend
        console.log('Generating contract with data:', formData);
        console.log('Using tier:', this.currentTier);
        
        return {
            contractId: 'CONTRACT_' + Date.now(),
            pdfUrl: '/contracts/contract_' + Date.now() + '.pdf'
        };
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        
        const form = document.querySelector('.note-creation-form');
        if (form) {
            form.insertBefore(successDiv, form.firstChild);
            setTimeout(() => successDiv.remove(), 5000);
        }
    }

    // Stripe Integration
    initializeStripe() {
        // Initialize Stripe (replace with your publishable key)
        if (typeof Stripe !== 'undefined') {
            this.stripeInstance = Stripe('pk_test_your_stripe_publishable_key_here');
        }
    }

    async handleTierPurchase(tierKey) {
        const tier = this.tiers[tierKey];
        if (!tier || !this.stripeInstance) {
            alert('Unable to process payment at this time.');
            return;
        }

        try {
            // Create checkout session (you'll need to implement this endpoint)
            const response = await fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId: tier.priceId,
                    tierKey: tierKey
                })
            });

            const session = await response.json();

            // Redirect to Stripe Checkout
            const result = await this.stripeInstance.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                alert(result.error.message);
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment processing error. Please try again.');
        }
    }

    // Public methods for external access
    getTierInfo(tierKey) {
        return this.tiers[tierKey];
    }

    getCurrentTier() {
        return this.currentTier;
    }

    setTier(tierKey) {
        if (this.tiers[tierKey]) {
            this.handleTierSelection(tierKey);
        }
    }
}

// Initialize contracts manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trustLendContracts = new TrustLendContracts();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrustLendContracts;
}
