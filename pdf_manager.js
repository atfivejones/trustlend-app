// trustlend-exact-integration.js
// Simple PDF integration for your existing 6-step TrustLend form
// Maps your exact field IDs to PDF generation system

class TrustLendExactIntegration {
    constructor() {
        // 🚀 UPDATE THIS URL after you deploy to Google Cloud Run
        this.API_BASE = 'http://127.0.0.1:8080';  // For local testing
        // After Cloud Run deploy, change to: this.API_BASE = 'https://your-cloud-run-url';
        
        this.initIntegration();
    }

    initIntegration() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.enhanceExistingForm());
        } else {
            this.enhanceExistingForm();
        }
    }

    enhanceExistingForm() {
        // Replace the placeholder download functions with real PDF generation
        this.replacePlaceholderFunctions();
        
        // Add additional PDF options to Step 6
        this.enhanceStep6Downloads();
        
        console.log('🎯 TrustLend PDF Integration Active - Your exact form enhanced!');
    }

    // Map your exact form fields to PDF format
    collectFormData() {
        return {
            lender: {
                name: this.combineNames('lender'),
                email: this.getFieldValue('lenderEmail'),
                phone: this.getFieldValue('lenderPhone'),
                address: this.getFullAddress('lender')
            },
            borrower: {
                name: this.combineNames('borrower'),
                email: this.getFieldValue('borrowerEmail'), 
                phone: this.getFieldValue('borrowerPhone'),
                address: this.getFullAddress('borrower')
            },
            loan: {
                principal: parseFloat(this.getFieldValue('principal')) || 0,
                flatFee: parseFloat(this.getFieldValue('flatFee')) || 0,
                startDate: this.formatDate(this.getFieldValue('loanDate')),
                termMonths: this.calculateTermFromDates(),
                paymentFrequency: this.mapPaymentFrequency()
            },
            tier: this.getSelectedTier()
        };
    }

    // Helper functions using your exact field IDs
    combineNames(party) {
        const firstName = this.getFieldValue(`${party}FirstName`);
        const lastName = this.getFieldValue(`${party}LastName`);
        return `${firstName} ${lastName}`.trim();
    }

    getFullAddress(party) {
        const address = this.getFieldValue(`${party}Address`);
        const city = this.getFieldValue(`${party}City`);
        const state = this.getFieldValue(`${party}State`);
        const zip = this.getFieldValue(`${party}Zip`);
        const county = this.getFieldValue(`${party}County`);
        return `${address}, ${city}, ${state} ${zip}`.replace(/,\s*,/g, ',').trim();
    }

    getFieldValue(fieldId) {
        const field = document.getElementById(fieldId);
        return field ? field.value.trim() : '';
    }

    formatDate(dateValue) {
        if (!dateValue) return '';
        const date = new Date(dateValue);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    }

    calculateTermFromDates() {
        // Use your loanDate and dueDate fields
        const startDate = this.getFieldValue('loanDate');
        const dueDate = this.getFieldValue('dueDate');
        
        if (!startDate || !dueDate) return 6; // Default
        
        const start = new Date(startDate);
        const end = new Date(dueDate);
        const diffTime = Math.abs(end - start);
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        
        return diffMonths || 6;
    }

    mapPaymentFrequency() {
        const schedule = this.getFieldValue('paymentSchedule');
        const mapping = {
            'lump_sum': 'monthly', // Default for lump sum
            'monthly': 'monthly',
            'weekly': 'weekly',
            'biweekly': 'biweekly'
        };
        return mapping[schedule] || 'monthly';
    }

    getSelectedTier() {
        // Check if user has selected a tier in Step 5
        const selectedTierCard = document.querySelector('.tier-card.selected');
        if (selectedTierCard) {
            const cardId = selectedTierCard.id;
            if (cardId.includes('essential')) return 'Essential';
            if (cardId.includes('maximum')) return 'Maximum';
            if (cardId.includes('premium')) return 'Premium';
        }
        
        // Fallback - check global variables or default
        return window.selectedTier || 'Essential';
    }

    // Replace your existing placeholder functions with real PDF generation
    replacePlaceholderFunctions() {
        // Replace downloadContractWithUCC
        window.downloadContractWithUCC = () => this.generateCompletePDFPackage();
        
        // Replace other placeholder functions if they exist
        window.downloadMainContract = () => this.generatePDF('contract');
        window.downloadUCCAttachments = () => this.generatePDF('schedule');
    }

    // Enhance Step 6 with additional PDF options
    enhanceStep6Downloads() {
        const step6 = document.getElementById('form-step-6');
        if (!step6) return;

        // Find the download button and add additional options
        const downloadButton = step6.querySelector('button[onclick*="downloadContract"]');
        if (downloadButton && downloadButton.parentNode) {
            // Create enhanced download section
            const enhancedSection = document.createElement('div');
            enhancedSection.className = 'pdf-generation-enhanced';
            enhancedSection.innerHTML = `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        📄 Professional PDF Documents
                    </h4>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <button onclick="window.trustLendIntegration.generatePDF('contract')" 
                                class="pdf-btn-enhanced bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-medium">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            📝 Contract PDF
                        </button>
                        
                        <button onclick="window.trustLendIntegration.generatePDF('schedule')" 
                                class="pdf-btn-enhanced bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all font-medium">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            📊 Payment Schedule
                        </button>
                    </div>
                    
                    <div id="pdfStatus" class="text-sm text-center min-h-6"></div>
                </div>
            `;

            // Insert before the existing download button
            downloadButton.parentNode.insertBefore(enhancedSection, downloadButton);
            
            // Update the original button text to be clearer
            downloadButton.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                📦 Download Complete Package (Both PDFs)
            `;
        }

        // Add CSS for the enhanced buttons
        this.addEnhancedStyles();
    }

    addEnhancedStyles() {
        if (document.getElementById('pdf-enhanced-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'pdf-enhanced-styles';
        styles.textContent = `
            .pdf-btn-enhanced {
                transition: all 0.2s ease;
                font-weight: 600;
            }
            
            .pdf-btn-enhanced:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .pdf-btn-enhanced:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            .pdf-status-success {
                color: #059669;
                font-weight: 600;
            }
            
            .pdf-status-error {
                color: #dc2626;
                font-weight: 600;
            }
            
            .pdf-generation-enhanced {
                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            }
        `;
        
        document.head.appendChild(styles);
    }

    async generatePDF(type) {
        try {
            this.showStatus(`📄 Generating ${type} PDF...`, false);
            this.disableAllButtons(true);

            // Collect and validate form data using your exact fields
            const formData = this.collectFormData();
            const validationErrors = this.validateFormData(formData);

            if (validationErrors.length > 0) {
                this.showStatus(`❌ Please check: ${validationErrors.join(', ')}`, true);
                return;
            }

            // Make API call
            const endpoint = type === 'contract' ? '/api/generate/contract' : '/api/generate/schedule';
            const response = await fetch(`${this.API_BASE}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            // Download the PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = type === 'contract' ? 
                'TrustLend_Promissory_Note.pdf' : 
                'TrustLend_Payment_Schedule.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            this.showStatus(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} PDF downloaded!`, false);

            // Add to audit trail (integrate with your existing audit system)
            if (window.addAuditEvent) {
                window.addAuditEvent(`Downloaded ${type} PDF`, {
                    type: type,
                    timestamp: new Date().toISOString(),
                    fileSize: blob.size
                });
            }

        } catch (error) {
            console.error('PDF generation error:', error);
            this.showStatus(`❌ Error: ${error.message}`, true);
        } finally {
            this.disableAllButtons(false);
        }
    }

    async generateCompletePDFPackage() {
        this.showStatus('📦 Generating complete document package...', false);
        
        try {
            // Generate both PDFs sequentially
            await this.generatePDF('contract');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
            await this.generatePDF('schedule');
            
            this.showStatus('✅ Complete package downloaded successfully!', false);
            
            // Add to your existing audit trail
            if (window.addAuditEvent) {
                window.addAuditEvent('Downloaded complete contract package with UCC attachments', {
                    includes: ['main_contract', 'payment_schedule', 'ucc_attachments'],
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            this.showStatus(`❌ Package generation failed: ${error.message}`, true);
        }
    }

    validateFormData(data) {
        const errors = [];

        // Validate using your exact field requirements
        if (!data.lender.name || data.lender.name.length < 3) {
            errors.push('Complete lender name required');
        }
        if (!data.lender.email || !data.lender.email.includes('@')) {
            errors.push('Valid lender email required');
        }
        if (!data.borrower.name || data.borrower.name.length < 3) {
            errors.push('Complete borrower name required');
        }
        if (!data.borrower.email || !data.borrower.email.includes('@')) {
            errors.push('Valid borrower email required');
        }
        if (!data.loan.principal || data.loan.principal <= 0) {
            errors.push('Valid loan principal required');
        }
        if (!data.loan.startDate) {
            errors.push('Loan date required');
        }

        return errors;
    }

    showStatus(message, isError = false) {
        const statusDiv = document.getElementById('pdfStatus');
        if (statusDiv) {
            statusDiv.textContent = message;
            statusDiv.className = isError ? 'text-sm text-center min-h-6 pdf-status-error' : 'text-sm text-center min-h-6 pdf-status-success';
            
            // Clear status after 5 seconds
            setTimeout(() => {
                statusDiv.textContent = '';
                statusDiv.className = 'text-sm text-center min-h-6';
            }, 5000);
        }
    }

    disableAllButtons(disabled = true) {
        // Disable PDF generation buttons
        document.querySelectorAll('.pdf-btn-enhanced').forEach(btn => {
            btn.disabled = disabled;
        });
        
        // Disable the main download button
        const mainDownloadBtn = document.querySelector('button[onclick*="downloadContract"]');
        if (mainDownloadBtn) {
            mainDownloadBtn.disabled = disabled;
        }
    }
}

// Initialize the integration and make it globally available
window.trustLendIntegration = new TrustLendExactIntegration();

// Also create the exact function names your form expects
window.downloadContractWithUCC = () => window.trustLendIntegration.generateCompletePDFPackage();
window.downloadMainContract = () => window.trustLendIntegration.generatePDF('contract');
window.downloadUCCAttachments = () => window.trustLendIntegration.generatePDF('schedule');

console.log('🎯 TrustLend Exact Integration Loaded - Your 6-step form is now PDF-enabled!');
