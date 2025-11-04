/**
 * TrustLend Professional PDF Manager
 * Enhanced frontend integration with production-ready features
 * Handles PDF generation, downloads, error handling, and user feedback
 */

class TrustLendPDFManager {
    constructor() {
        this.apiUrl = 'http://localhost:5000/api';
        this.downloadQueue = [];
        this.isGenerating = false;
        this.serviceStatus = 'unknown';
        
        // Configuration
        this.config = {
            maxRetries: 3,
            retryDelay: 1000,
            requestTimeout: 30000,
            maxFileSize: 50 * 1024 * 1024 // 50MB
        };
        
        this.init();
    }

    async init() {
        try {
            await this.checkServiceHealth();
            this.bindEvents();
            this.loadDownloadHistory();
            this.setupPeriodicHealthCheck();
            console.log('✅ TrustLend PDF Manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize PDF Manager:', error);
            this.showToast('PDF service initialization failed', 'error');
        }
    }

    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initializePDFButtons();
            this.setupFormValidation();
            this.setupAutoSave();
        });
    }

    initializePDFButtons() {
        const buttonConfigs = [
            { id: 'generateContractPDF', handler: () => this.generateContractPDF() },
            { id: 'generateSchedulePDF', handler: () => this.generateSchedulePDF() },
            { id: 'downloadAllPDFs', handler: () => this.generateCompletePackage() },
            { id: 'previewContract', handler: () => this.previewContractData() },
            { id: 'clearHistory', handler: () => this.clearDownloadHistory() }
        ];

        buttonConfigs.forEach(({ id, handler }) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', handler);
                console.log(`✅ Bound event handler for ${id}`);
            }
        });
    }

    setupFormValidation() {
        const requiredFields = ['loanAmount', 'lenderName', 'borrowerName'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldId));
                field.addEventListener('input', () => this.clearFieldError(fieldId));
            }
        });
    }

    setupAutoSave() {
        const formFields = document.querySelectorAll('input, select, textarea');
        let autoSaveTimeout;

        formFields.forEach(field => {
            field.addEventListener('input', () => {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    this.saveFormData();
                }, 2000); // Save after 2 seconds of inactivity
            });
        });
    }

    setupPeriodicHealthCheck() {
        // Check service health every 30 seconds
        setInterval(async () => {
            await this.checkServiceHealth();
        }, 30000);
    }

    /**
     * Enhanced contract data collection with validation
     */
    collectContractData() {
        try {
            const formData = {
                // Loan details with validation
                loanAmount: this.parseFloat(document.getElementById('loanAmount')?.value, 'Loan Amount'),
                interestRate: this.parseFloat(document.getElementById('interestRate')?.value, 'Interest Rate'),
                loanDate: document.getElementById('loanDate')?.value || new Date().toISOString().split('T')[0],
                termValue: this.parseInt(document.getElementById('termValue')?.value, 'Loan Term'),
                termUnit: document.getElementById('termUnit')?.value || 'months',
                paymentFrequency: document.getElementById('paymentFrequency')?.value || 'Lump Sum',
                loanPurpose: document.getElementById('loanPurpose')?.value || 'General purposes',
                
                // Lender information
                lenderName: this.validateRequired(document.getElementById('lenderName')?.value, 'Lender Name'),
                lenderEmail: document.getElementById('lenderEmail')?.value || '',
                lenderPhone: document.getElementById('lenderPhone')?.value || '',
                lenderAddress: document.getElementById('lenderAddress')?.value || '',
                
                // Borrower information  
                borrowerName: this.validateRequired(document.getElementById('borrowerName')?.value, 'Borrower Name'),
                borrowerEmail: document.getElementById('borrowerEmail')?.value || '',
                borrowerPhone: document.getElementById('borrowerPhone')?.value || '',
                borrowerAddress: document.getElementById('borrowerAddress')?.value || '',
                
                // Protection tier
                protectionTier: this.getSelectedTier() || 'Essential Protection',
                
                // Metadata
                generatedAt: new Date().toISOString(),
                platform: 'TrustLend Professional v2.0',
                clientVersion: '2.0'
            };

            // Additional validation
            this.validateLoanAmount(formData.loanAmount);
            this.validateInterestRate(formData.interestRate);
            this.validateTermValue(formData.termValue);

            console.log('✅ Contract data collected and validated');
            return formData;

        } catch (error) {
            console.error('❌ Error collecting contract data:', error);
            throw new Error(`Data validation failed: ${error.message}`);
        }
    }

    // Validation helper methods
    parseFloat(value, fieldName) {
        const parsed = parseFloat(value);
        if (isNaN(parsed)) {
            throw new Error(`${fieldName} must be a valid number`);
        }
        return parsed;
    }

    parseInt(value, fieldName) {
        const parsed = parseInt(value);
        if (isNaN(parsed) || parsed <= 0) {
            throw new Error(`${fieldName} must be a positive integer`);
        }
        return parsed;
    }

    validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            throw new Error(`${fieldName} is required`);
        }
        return value.trim();
    }

    validateLoanAmount(amount) {
        if (amount <= 0) throw new Error('Loan amount must be greater than 0');
        if (amount > 10000000) throw new Error('Loan amount exceeds maximum limit');
    }

    validateInterestRate(rate) {
        if (rate < 0 || rate > 50) throw new Error('Interest rate must be between 0% and 50%');
    }

    validateTermValue(term) {
        if (term <= 0) throw new Error('Loan term must be greater than 0');
        if (term > 600) throw new Error('Loan term exceeds reasonable limit');
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        try {
            const value = field.value;
            
            switch (fieldId) {
                case 'loanAmount':
                    this.validateLoanAmount(parseFloat(value));
                    break;
                case 'interestRate':
                    this.validateInterestRate(parseFloat(value));
                    break;
                case 'termValue':
                    this.validateTermValue(parseInt(value));
                    break;
                case 'lenderName':
                case 'borrowerName':
                    this.validateRequired(value, field.placeholder || fieldId);
                    break;
            }
            
            this.clearFieldError(fieldId);
        } catch (error) {
            this.showFieldError(fieldId, error.message);
        }
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.add('border-red-500');
        
        // Remove existing error message
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) existingError.remove();
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        field.parentElement.appendChild(errorDiv);
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('border-red-500');
        const errorDiv = field.parentElement.querySelector('.field-error');
        if (errorDiv) errorDiv.remove();
    }

    /**
     * Get the currently selected protection tier
     */
    getSelectedTier() {
        const selectedTierElement = document.querySelector('.tier-card.selected');
        if (selectedTierElement) {
            const tierName = selectedTierElement.querySelector('.tier-name')?.textContent;
            return tierName || 'Essential Protection';
        }
        return 'Essential Protection';
    }

    /**
     * Enhanced API request with retry logic and timeout
     */
    async makeAPIRequest(endpoint, data, options = {}) {
        const { retries = this.config.maxRetries, timeout = this.config.requestTimeout } = options;
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);
                
                const response = await fetch(`${this.apiUrl}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Request-ID': this.generateRequestId(),
                        'X-Client-Version': '2.0'
                    },
                    body: JSON.stringify(data),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                }

                const result = await response.json();
                console.log(`✅ API request successful (attempt ${attempt}):`, endpoint);
                return result;

            } catch (error) {
                console.warn(`⚠️ API request failed (attempt ${attempt}/${retries}):`, error.message);
                
                if (attempt === retries) {
                    throw error;
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
            }
        }
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate contract PDF with enhanced error handling
     */
    async generateContractPDF() {
        if (this.isGenerating) {
            this.showToast('PDF generation already in progress...', 'warning');
            return;
        }

        if (this.serviceStatus !== 'healthy') {
            this.showToast('PDF service is not available. Please check service status.', 'error');
            return;
        }

        try {
            this.isGenerating = true;
            this.updatePDFButtonState('generateContractPDF', true, 'Generating Contract...');
            
            const contractData = this.collectContractData();
            
            this.showToast('Generating professional contract PDF...', 'info');
            
            const result = await this.makeAPIRequest('/generate-contract-pdf', contractData);
            
            if (result.success) {
                this.showToast(`Contract PDF generated successfully! (${this.formatFileSize(result.file_size)})`, 'success');
                this.downloadFile(result.download_url, result.filename);
                this.addToDownloadHistory('Contract', result.filename, result.download_url, result.file_size);
                this.trackGeneration('contract', contractData);
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error('❌ Error generating contract PDF:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.updatePDFButtonState('generateContractPDF', false, 'Generate Contract PDF');
        }
    }

    /**
     * Generate payment schedule PDF
     */
    async generateSchedulePDF() {
        if (this.isGenerating) {
            this.showToast('PDF generation already in progress...', 'warning');
            return;
        }

        if (this.serviceStatus !== 'healthy') {
            this.showToast('PDF service is not available. Please check service status.', 'error');
            return;
        }

        try {
            this.isGenerating = true;
            this.updatePDFButtonState('generateSchedulePDF', true, 'Generating Schedule...');
            
            const contractData = this.collectContractData();
            
            this.showToast('Generating detailed payment schedule...', 'info');
            
            const result = await this.makeAPIRequest('/generate-schedule-pdf', contractData);
            
            if (result.success) {
                this.showToast(`Payment schedule generated successfully! (${this.formatFileSize(result.file_size)})`, 'success');
                this.downloadFile(result.download_url, result.filename);
                this.addToDownloadHistory('Payment Schedule', result.filename, result.download_url, result.file_size);
                this.trackGeneration('schedule', contractData);
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error('❌ Error generating schedule PDF:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.updatePDFButtonState('generateSchedulePDF', false, 'Generate Payment Schedule');
        }
    }

    /**
     * Generate complete package (contract + schedule)
     */
    async generateCompletePackage() {
        if (this.isGenerating) {
            this.showToast('PDF generation already in progress...', 'warning');
            return;
        }

        if (this.serviceStatus !== 'healthy') {
            this.showToast('PDF service is not available. Please check service status.', 'error');
            return;
        }

        try {
            this.isGenerating = true;
            this.updatePDFButtonState('downloadAllPDFs', true, 'Generating Package...');
            
            const contractData = this.collectContractData();
            
            this.showToast('Generating complete loan package...', 'info');
            
            const result = await this.makeAPIRequest('/generate-complete-package', contractData);
            
            if (result.success) {
                // Download both files
                this.downloadFile(result.contract.download_url, result.contract.filename);
                this.downloadFile(result.schedule.download_url, result.schedule.filename);
                
                // Add to history
                this.addToDownloadHistory('Contract', result.contract.filename, result.contract.download_url, result.contract.file_size);
                this.addToDownloadHistory('Payment Schedule', result.schedule.filename, result.schedule.download_url, result.schedule.file_size);
                
                this.showToast('Complete loan package generated successfully!', 'success');
                this.trackGeneration('complete-package', contractData);
            } else {
                throw new Error(result.error || 'Unknown error occurred');
            }

        } catch (error) {
            console.error('❌ Error generating complete package:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        } finally {
            this.isGenerating = false;
            this.updatePDFButtonState('downloadAllPDFs', false, 'Generate Complete Package');
        }
    }

    /**
     * Preview contract data without generating PDF
     */
    async previewContractData() {
        try {
            const contractData = this.collectContractData();
            
            this.showToast('Calculating payment schedule...', 'info');
            
            const result = await this.makeAPIRequest('/preview-data', contractData);
            
            if (result.success) {
                this.showPreviewModal(result);
            } else {
                throw new Error(result.error || 'Preview failed');
            }

        } catch (error) {
            console.error('❌ Error previewing contract:', error);
            this.showToast(`Preview error: ${error.message}`, 'error');
        }
    }

    showPreviewModal(previewData) {
        const { summary, payment_schedule } = previewData;
        
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" id="previewModal">
                <div class="bg-white rounded-lg p-6 max-w-4xl max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold">Contract Preview</h3>
                        <button onclick="document.getElementById('previewModal').remove()" class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-blue-900 mb-2">Loan Summary</h4>
                            <div class="space-y-1 text-sm">
                                <div>Principal: <span class="font-semibold">${this.formatCurrency(summary.principal)}</span></div>
                                <div>Total Interest: <span class="font-semibold">${this.formatCurrency(summary.total_interest)}</span></div>
                                <div>Total Payments: <span class="font-semibold">${this.formatCurrency(summary.total_payments)}</span></div>
                                <div>Number of Payments: <span class="font-semibold">${summary.number_of_payments}</span></div>
                            </div>
                        </div>
                        
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-green-900 mb-2">Payment Details</h4>
                            <div class="space-y-1 text-sm">
                                <div>Payment Amount: <span class="font-semibold">${this.formatCurrency(summary.first_payment_amount)}</span></div>
                                <div>Final Payment: <span class="font-semibold">${summary.last_payment_date}</span></div>
                                <div>Effective APR: <span class="font-semibold">${summary.effective_apr}%</span></div>
                                <div>Interest Ratio: <span class="font-semibold">${summary.interest_to_principal_ratio}%</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold mb-2">Payment Schedule Preview</h4>
                        <div class="overflow-x-auto">
                            <table class="min-w-full bg-white border border-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    ${payment_schedule.map(payment => `
                                        <tr>
                                            <td class="px-4 py-2 text-sm">${payment.payment_number}</td>
                                            <td class="px-4 py-2 text-sm">${payment.due_date}</td>
                                            <td class="px-4 py-2 text-sm">${this.formatCurrency(payment.principal)}</td>
                                            <td class="px-4 py-2 text-sm">${this.formatCurrency(payment.interest)}</td>
                                            <td class="px-4 py-2 text-sm font-semibold">${this.formatCurrency(payment.total_payment)}</td>
                                            <td class="px-4 py-2 text-sm">${this.formatCurrency(payment.remaining_balance)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        ${previewData.full_schedule_length > payment_schedule.length ? 
                            `<p class="text-sm text-gray-500 mt-2">Showing first ${payment_schedule.length} of ${previewData.full_schedule_length} payments</p>` 
                            : ''}
                    </div>
                    
                    <div class="flex justify-end space-x-3">
                        <button onclick="document.getElementById('previewModal').remove()" 
                                class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                            Close
                        </button>
                        <button onclick="pdfManager.generateContractPDF(); document.getElementById('previewModal').remove()" 
                                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Generate Contract PDF
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Download file with enhanced error handling
     */
    downloadFile(downloadUrl, filename) {
        try {
            const link = document.createElement('a');
            link.href = `${this.apiUrl.replace('/api', '')}${downloadUrl}`;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log(`✅ Download initiated: ${filename}`);
        } catch (error) {
            console.error('❌ Error downloading file:', error);
            this.showToast('Failed to download file', 'error');
        }
    }

    /**
     * Update PDF button states with loading indicators
     */
    updatePDFButtonState(buttonId, isLoading, text) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = isLoading;
            button.textContent = text;
            
            if (isLoading) {
                button.classList.add('loading');
                button.style.opacity = '0.7';
            } else {
                button.classList.remove('loading');
                button.style.opacity = '1';
            }
        }
    }

    /**
     * Enhanced download history management
     */
    addToDownloadHistory(type, filename, downloadUrl, fileSize) {
        const historyItem = {
            id: this.generateRequestId(),
            type: type,
            filename: filename,
            downloadUrl: downloadUrl,
            fileSize: fileSize,
            timestamp: new Date().toISOString(),
            downloaded: false
        };
        
        this.downloadQueue.unshift(historyItem); // Add to beginning
        
        // Limit history to 50 items
        if (this.downloadQueue.length > 50) {
            this.downloadQueue = this.downloadQueue.slice(0, 50);
        }
        
        this.updateDownloadHistory();
        this.saveDownloadHistory();
    }

    updateDownloadHistory() {
        const historyContainer = document.getElementById('downloadHistory');
        if (!historyContainer) return;

        if (this.downloadQueue.length === 0) {
            historyContainer.innerHTML = '<p class="text-gray-500 text-sm">No documents generated yet.</p>';
            return;
        }

        const historyHTML = this.downloadQueue.map(item => {
            const timestamp = new Date(item.timestamp).toLocaleString();
            const fileSize = this.formatFileSize(item.fileSize);
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <div class="text-sm font-medium text-gray-900">${item.type}</div>
                            <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${fileSize}</span>
                        </div>
                        <div class="text-xs text-gray-500">${timestamp}</div>
                        <div class="text-xs text-gray-400 truncate" title="${item.filename}">${item.filename}</div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="pdfManager.downloadFile('${item.downloadUrl}', '${item.filename}')"
                                class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Download
                        </button>
                        <button onclick="pdfManager.removeFromHistory('${item.id}')"
                                class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
                            ×
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        historyContainer.innerHTML = historyHTML;
    }

    removeFromHistory(itemId) {
        this.downloadQueue = this.downloadQueue.filter(item => item.id !== itemId);
        this.updateDownloadHistory();
        this.saveDownloadHistory();
    }

    clearDownloadHistory() {
        if (confirm('Are you sure you want to clear all download history?')) {
            this.downloadQueue = [];
            this.updateDownloadHistory();
            this.saveDownloadHistory();
            this.showToast('Download history cleared', 'info');
        }
    }

    /**
     * Local storage management
     */
    saveFormData() {
        try {
            const formData = this.collectContractData();
            localStorage.setItem('trustlend_form_data', JSON.stringify(formData));
            console.log('📁 Form data auto-saved');
        } catch (error) {
            console.warn('⚠️ Failed to auto-save form data:', error);
        }
    }

    loadFormData() {
        try {
            const savedData = localStorage.getItem('trustlend_form_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.populateForm(data);
                console.log('📁 Form data loaded from storage');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load saved form data:', error);
        }
    }

    saveDownloadHistory() {
        try {
            localStorage.setItem('trustlend_download_history', JSON.stringify(this.downloadQueue));
        } catch (error) {
            console.warn('⚠️ Failed to save download history:', error);
        }
    }

    loadDownloadHistory() {
        try {
            const savedHistory = localStorage.getItem('trustlend_download_history');
            if (savedHistory) {
                this.downloadQueue = JSON.parse(savedHistory);
                this.updateDownloadHistory();
            }
        } catch (error) {
            console.warn('⚠️ Failed to load download history:', error);
        }
    }

    /**
     * Service health monitoring
     */
    async checkServiceHealth() {
        try {
            const response = await fetch(`${this.apiUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                const health = await response.json();
                this.serviceStatus = health.status;
                this.updateServiceStatusIndicator(true, health);
                return true;
            } else {
                this.serviceStatus = 'unhealthy';
                this.updateServiceStatusIndicator(false);
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Service health check failed:', error);
            this.serviceStatus = 'unavailable';
            this.updateServiceStatusIndicator(false, { error: error.message });
            return false;
        }
    }

    updateServiceStatusIndicator(isHealthy, healthData = {}) {
        const indicator = document.getElementById('serviceStatus');
        if (!indicator) return;

        if (isHealthy) {
            indicator.className = 'flex items-center space-x-2 text-green-600';
            indicator.innerHTML = `
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm">PDF Service Online</span>
            `;
        } else {
            indicator.className = 'flex items-center space-x-2 text-red-600';
            indicator.innerHTML = `
                <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                <span class="text-sm">PDF Service Offline</span>
            `;
            
            // Disable PDF buttons when service is offline
            this.disablePDFButtons();
        }
    }

    disablePDFButtons() {
        const pdfButtons = document.querySelectorAll('[id*="PDF"], [id*="Package"]');
        pdfButtons.forEach(button => {
            button.disabled = true;
            button.title = 'PDF service is not available';
        });
    }

    /**
     * Utility methods
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    trackGeneration(type, contractData) {
        // Analytics tracking - could integrate with Google Analytics, Mixpanel, etc.
        console.log(`📊 Generated ${type} for ${contractData.loanAmount} loan`);
    }

    /**
     * Enhanced toast notifications with multiple types and actions
     */
    showToast(message, type = 'info', duration = 5000, actions = []) {
        // Remove existing toasts
        const existingToasts = document.querySelectorAll('.toast-notification');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${this.getToastClasses(type)}`;
        
        const actionsHTML = actions.length > 0 ? 
            `<div class="mt-2 flex space-x-2">${actions.map(action => 
                `<button onclick="${action.handler}" class="text-xs px-2 py-1 bg-white bg-opacity-20 rounded hover:bg-opacity-30">${action.text}</button>`
            ).join('')}</div>` : '';

        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="flex-shrink-0 mt-0.5">
                    ${this.getToastIcon(type)}
                </div>
                <div class="flex-1">
                    <div class="text-sm font-medium">${message}</div>
                    ${actionsHTML}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        class="flex-shrink-0 text-white text-opacity-70 hover:text-opacity-100">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    getToastClasses(type) {
        const classes = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white',
            warning: 'bg-yellow-600 text-white',
            info: 'bg-blue-600 text-white'
        };
        return classes[type] || classes.info;
    }

    getToastIcon(type) {
        const icons = {
            success: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>',
            error: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>',
            warning: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>',
            info: '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
        };
        return icons[type] || icons.info;
    }
}

// Initialize PDF manager when DOM is loaded
let pdfManager;
document.addEventListener('DOMContentLoaded', () => {
    pdfManager = new TrustLendPDFManager();
    console.log('🚀 TrustLend PDF Manager loaded');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrustLendPDFManager;
}
