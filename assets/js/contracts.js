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
        const featuresContainer = document.querySelector('.security-features-list');
        if (!featuresContainer) return;

        const tier = this.state.currentTier;
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

        // Update feature count
        const featureCountElement = document.querySelector('.feature-count');
        if (featureCountElement) {
            featureCountElement.textContent = `${featureCount} features`;
        }
    },

    updatePricingSection() {
        const priceElement = document.querySelector('.tier-price-display');
        if (priceElement) {
            const price = this.state.tierPricing[this.state.currentTier];
            priceElement.textContent = `$${price}`;
        }

        // Update tier benefits
        const benefitsElement = document.querySelector('.tier-benefits');
        if (benefitsElement) {
            const tier = this.state.currentTier;
            const benefits = tier === 'essential' 
                ? '💙 Perfect for family loans and basic legal protection'
                : '💎 Ultimate protection for larger loans and maximum legal security';
            
            benefitsElement.innerHTML = `<p>${benefits}</p>`;
        }
    },

    // ===== CONTRACT PREVIEW =====
    setupContractPreview() {
        const previewContainer = document.querySelector('.contract-preview');
        if (previewContainer) {
            this.updateContractPreview();
        }
    },

    updateContractPreview() {
        const previewElement = document.querySelector('.contract-preview-content');
        if (!previewElement) return;

        const data = this.state.contractData;
        const tier = this.state.currentTier;
        
        previewElement.innerHTML = this.generatePreviewHTML(data, tier);
    },

    generatePreviewHTML(data, tier) {
        const totalAmount = parseFloat(data.loanAmount || 0) + parseFloat(data.optionalFee || 0);
        const monthlyPayment = this.calculateMonthlyPayment(totalAmount, data.loanTerm || 12);

        return `
            <div class="contract-header">
                <h3 class="contract-title">Loan Agreement Preview</h3>
                <span class="plan-status ${tier}">
                    <span>●</span>
                    ${tier === 'essential' ? 'Essential Protection' : 'Maximum Protection'}
                </span>
            </div>
            
            <div class="contract-details">
                <div class="detail-item">
                    <div class="detail-label">Loan Amount</div>
                    <div class="detail-value">${this.formatCurrency(data.loanAmount || 0)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Optional Fee</div>
                    <div class="detail-value">${this.formatCurrency(data.optionalFee || 0)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Payment Schedule</div>
                    <div class="detail-value">${this.formatSchedule(data.paymentSchedule || 'monthly')}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Monthly Payment</div>
                    <div class="detail-value">${this.formatCurrency(monthlyPayment)}</div>
                </div>
            </div>
            
            <div class="contract-parties">
                <div class="party-section">
                    <h4>Lender</h4>
                    <p>${data.lender.firstName || 'Your'} ${data.lender.lastName || 'Name'}</p>
                    <p class="status ${data.lender.firstName ? 'signed' : 'pending'}">
                        ${data.lender.firstName ? '✓ Ready to sign' : '○ Pending information'}
                    </p>
                </div>
                <div class="party-section">
                    <h4>Borrower</h4>
                    <p>${data.borrower.firstName || 'Borrower'} ${data.borrower.lastName || 'Name'}</p>
                    <p class="status pending">○ Awaiting signature</p>
                </div>
            </div>
            
            <div class="security-features">
                <div class="security-title">
                    <span>🛡️</span>
                    Legal Protection Included
                </div>
                <ul class="security-list">
                    ${this.state.tierFeatures[tier].slice(0, 4).map(feature => `
                        <li>• ${feature}</li>
                    `).join('')}
                </ul>
            </div>
        `;
    },

    // ===== FORM HANDLING =====
    setupFormHandlers() {
        // Loan amount input
        const loanAmountInput = document.querySelector('input[name="loanAmount"]');
        if (loanAmountInput) {
            loanAmountInput.addEventListener('input', this.debounce((e) => {
                this.updateContractData('loanAmount', e.target.value);
                this.updateContractPreview();
                this.validateLoanAmount(e.target.value);
            }, 300));
        }

        // Optional fee input
        const optionalFeeInput = document.querySelector('input[name="optionalFee"]');
        if (optionalFeeInput) {
            optionalFeeInput.addEventListener('input', this.debounce((e) => {
                this.updateContractData('optionalFee', e.target.value);
                this.updateContractPreview();
            }, 300));
        }

        // Payment schedule select
        const scheduleSelect = document.querySelector('select[name="paymentSchedule"]');
        if (scheduleSelect) {
            scheduleSelect.addEventListener('change', (e) => {
                this.updateContractData('paymentSchedule', e.target.value);
                this.updateContractPreview();
            });
        }

        // Loan term input
        const termInput = document.querySelector('input[name="loanTerm"]');
        if (termInput) {
            termInput.addEventListener('input', this.debounce((e) => {
                this.updateContractData('loanTerm', e.target.value);
                this.updateContractPreview();
            }, 300));
        }

        // Lender information
        this.setupPartyInformationHandlers('lender');
        this.setupPartyInformationHandlers('borrower');
    },

    setupPartyInformationHandlers(partyType) {
        const fields = ['firstName', 'lastName', 'email', 'phone'];
        
        fields.forEach(field => {
            const input = document.querySelector(`input[name="${partyType}_${field}"]`);
            if (input) {
                input.addEventListener('input', this.debounce((e) => {
                    this.updatePartyData(partyType, field, e.target.value);
                    this.updateContractPreview();
                }, 300));
            }
        });
    },

    updateContractData(field, value) {
        this.state.contractData[field] = value;
        console.log('Updated contract data:', field, value);
    },

    updatePartyData(partyType, field, value) {
        if (!this.state.contractData[partyType]) {
            this.state.contractData[partyType] = {};
        }
        this.state.contractData[partyType][field] = value;
        console.log('Updated party data:', partyType, field, value);
    },

    // ===== FORM VALIDATION =====
    validateLoanAmount(amount) {
        const numAmount = parseFloat(amount);
        const errorElement = document.querySelector('.loan-amount-error');
        
        if (numAmount < 100) {
            this.showFieldError('loanAmount', 'Minimum loan amount is $100');
        } else if (numAmount > 1000000) {
            this.showFieldError('loanAmount', 'Maximum loan amount is $1,000,000');
        } else {
            this.clearFieldError('loanAmount');
        }
    },

    showFieldError(fieldName, message) {
        const field = document.querySelector(`input[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error');
            
            let errorElement = document.querySelector(`.${fieldName}-error`);
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = `form-error ${fieldName}-error`;
                field.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
        }
    },

    clearFieldError(fieldName) {
        const field = document.querySelector(`input[name="${fieldName}"]`);
        if (field) {
            field.classList.remove('error');
            const errorElement = document.querySelector(`.${fieldName}-error`);
            if (errorElement) {
                errorElement.remove();
            }
        }
    },

    // ===== CONTRACT MANAGEMENT =====
    initializeContractManagement() {
        this.setupContractFilters();
        this.setupContractActions();
        this.loadContractsList();
    },

    setupContractFilters() {
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });
    },

    handleFilterChange(filter) {
        console.log('Filter changed to:', filter);
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        // Filter contracts (demo)
        this.filterContracts(filter);
    },

    filterContracts(filter) {
        const contractCards = document.querySelectorAll('.contract-card');
        contractCards.forEach(card => {
            const status = card.dataset.status;
            const shouldShow = filter === 'all' || filter === status;
            card.style.display = shouldShow ? 'block' : 'none';
        });
    },

    setupContractActions() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('contract-action')) {
                e.preventDefault();
                const action = e.target.dataset.action;
                const contractId = e.target.closest('.contract-card')?.dataset.contractId;
                this.handleContractAction(action, contractId);
            }
        });
    },

    handleContractAction(action, contractId) {
        console.log('Contract action:', action, contractId);
        
        switch (action) {
            case 'view':
                this.viewContract(contractId);
                break;
            case 'remind':
                this.sendPaymentReminder(contractId);
                break;
            case 'download':
                this.downloadContract(contractId);
                break;
            case 'thank':
                this.sendThankYou(contractId);
                break;
            case 'modify':
                this.modifyContract(contractId);
                break;
            default:
                console.log('Unknown action:', action);
        }
    },

    viewContract(contractId) {
        console.log('Viewing contract:', contractId);
        // In real app, this would open a detailed view
        TrustLend.showNotification('Opening contract details...', 'info');
    },

    sendPaymentReminder(contractId) {
        console.log('Sending payment reminder for:', contractId);
        TrustLend.showNotification('Payment reminder sent successfully!', 'success');
    },

    downloadContract(contractId) {
        console.log('Downloading contract:', contractId);
        TrustLend.showNotification('Downloading contract PDF...', 'info');
        
        // Simulate download
        setTimeout(() => {
            TrustLend.showNotification('Contract downloaded successfully!', 'success');
        }, 1500);
    },

    sendThankYou(contractId) {
        console.log('Sending thank you for:', contractId);
        TrustLend.showNotification('Thank you message sent!', 'success');
    },

    modifyContract(contractId) {
        console.log('Modifying contract:', contractId);
        TrustLend.showNotification('Opening contract editor...', 'info');
    },

    loadContractsList() {
        console.log('Loading contracts list...');
        // In real app, this would fetch from API
    },

    // ===== CALCULATIONS =====
    calculateMonthlyPayment(totalAmount, termMonths) {
        if (!totalAmount || !termMonths) return 0;
        return totalAmount / termMonths;
    },

    calculateTotalRepayment(loanAmount, optionalFee) {
        return parseFloat(loanAmount || 0) + parseFloat(optionalFee || 0);
    },

    // ===== UTILITY FUNCTIONS =====
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    },

    formatSchedule(schedule) {
        const scheduleMap = {
            weekly: 'Weekly',
            biweekly: 'Bi-weekly',
            monthly: 'Monthly',
            lump: 'Lump Sum'
        };
        return scheduleMap[schedule] || 'Monthly';
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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TrustLendContracts.init();
});

// Expose to global scope
window.TrustLendContracts = TrustLendContracts;
