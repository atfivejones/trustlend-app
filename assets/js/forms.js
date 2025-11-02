/**
 * TrustLend Forms & Validation
 * Handles form enhancements, validation, and user interactions
 */

const TrustLendForms = {
    // Form state and configuration
    state: {
        validationRules: {},
        formData: {},
        isSubmitting: false
    },

    // Validation patterns
    patterns: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^\+?[\d\s\-\(\)]{10,}$/,
        currency: /^\d+(\.\d{1,2})?$/,
        name: /^[a-zA-Z\s]{2,50}$/
    },

    // Initialize forms functionality
    init() {
        console.log('Initializing TrustLend Forms...');
        this.setupFormEnhancements();
        this.setupValidation();
        this.setupFormSubmission();
        this.setupFieldInteractions();
        this.setupTabsAndToggles();
    },

    // ===== FORM ENHANCEMENTS =====
    setupFormEnhancements() {
        // Add floating labels
        this.setupFloatingLabels();
        
        // Format currency inputs
        this.setupCurrencyInputs();
        
        // Format phone inputs
        this.setupPhoneInputs();
        
        // Setup password toggles
        this.setupPasswordToggles();
        
        // Setup character counters
        this.setupCharacterCounters();
        
        // Setup input masks
        this.setupInputMasks();
    },

    setupFloatingLabels() {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            // Add focus/blur handlers for floating labels
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value.trim()) {
                    input.parentNode.classList.remove('focused');
                }
            });
            
            // Check initial state
            if (input.value.trim()) {
                input.parentNode.classList.add('focused');
            }
        });
    },

    setupCurrencyInputs() {
        const currencyInputs = document.querySelectorAll('input[type="number"][data-currency]');
        currencyInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.formatCurrencyInput(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                this.validateCurrencyInput(e.target);
            });
        });
    },

    formatCurrencyInput(input) {
        let value = input.value.replace(/[^0-9.]/g, '');
        
        // Ensure only one decimal point
        const parts = value.split('.');
        if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
        }
        
        // Limit to 2 decimal places
        if (parts[1] && parts[1].length > 2) {
            value = parts[0] + '.' + parts[1].substring(0, 2);
        }
        
        input.value = value;
    },

    validateCurrencyInput(input) {
        const value = parseFloat(input.value);
        const min = parseFloat(input.dataset.min || 0);
        const max = parseFloat(input.dataset.max || Infinity);
        
        if (value < min) {
            this.showFieldError(input, `Minimum amount is ${this.formatCurrency(min)}`);
        } else if (value > max) {
            this.showFieldError(input, `Maximum amount is ${this.formatCurrency(max)}`);
        } else {
            this.clearFieldError(input);
        }
    },

    setupPhoneInputs() {
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.formatPhoneInput(e.target);
            });
        });
    },

    formatPhoneInput(input) {
        let value = input.value.replace(/[^0-9]/g, '');
        
        if (value.length >= 6) {
            if (value.length <= 10) {
                value = value.replace(/(\d{3})(\d{3})(\d+)/, '($1) $2-$3');
            } else {
                value = value.replace(/(\d{1})(\d{3})(\d{3})(\d+)/, '+$1 ($2) $3-$4');
            }
        }
        
        input.value = value;
    },

    setupPasswordToggles() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const input = e.target.closest('.form-group').querySelector('input');
                if (input.type === 'password') {
                    input.type = 'text';
                    e.target.textContent = '👁️';
                } else {
                    input.type = 'password';
                    e.target.textContent = '👁️‍🗨️';
                }
            });
        });
    },

    setupCharacterCounters() {
        const textareas = document.querySelectorAll('textarea[data-max-length]');
        textareas.forEach(textarea => {
            const maxLength = parseInt(textarea.dataset.maxLength);
            const counter = document.createElement('div');
            counter.className = 'character-counter text-sm text-gray-500 mt-1';
            textarea.parentNode.appendChild(counter);
            
            const updateCounter = () => {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${remaining} characters remaining`;
                counter.className = remaining < 20 ? 
                    'character-counter text-sm text-red-500 mt-1' : 
                    'character-counter text-sm text-gray-500 mt-1';
            };
            
            textarea.addEventListener('input', updateCounter);
            updateCounter(); // Initial count
        });
    },

    setupInputMasks() {
        // Social Security Number mask
        const ssnInputs = document.querySelectorAll('input[data-mask="ssn"]');
        ssnInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                value = value.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
                e.target.value = value.substring(0, 11);
            });
        });
        
        // Date mask
        const dateInputs = document.querySelectorAll('input[data-mask="date"]');
        dateInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
                e.target.value = value.substring(0, 10);
            });
        });
    },

    // ===== FORM VALIDATION =====
    setupValidation() {
        // Real-time validation
        const inputs = document.querySelectorAll('.form-input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                // Clear errors on input if field was previously invalid
                if (input.classList.contains('error')) {
                    this.clearFieldError(input);
                }
            });
        });
    },

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        
        // Required field check
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, `${this.getFieldLabel(field)} is required`);
            return false;
        }
        
        // Type-specific validation
        switch (fieldType) {
            case 'email':
                return this.validateEmail(field, value);
            case 'tel':
                return this.validatePhone(field, value);
            case 'number':
                return this.validateNumber(field, value);
            default:
                return this.validateText(field, value);
        }
    },

    validateEmail(field, value) {
        if (value && !this.patterns.email.test(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        this.clearFieldError(field);
        return true;
    },

    validatePhone(field, value) {
        if (value && !this.patterns.phone.test(value.replace(/[^0-9]/g, ''))) {
            this.showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
        this.clearFieldError(field);
        return true;
    },

    validateNumber(field, value) {
        const numValue = parseFloat(value);
        const min = field.getAttribute('min');
        const max = field.getAttribute('max');
        
        if (value && isNaN(numValue)) {
            this.showFieldError(field, 'Please enter a valid number');
            return false;
        }
        
        if (min && numValue < parseFloat(min)) {
            this.showFieldError(field, `Minimum value is ${min}`);
            return false;
        }
        
        if (max && numValue > parseFloat(max)) {
            this.showFieldError(field, `Maximum value is ${max}`);
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    },

    validateText(field, value) {
        const minLength = field.getAttribute('minlength');
        const maxLength = field.getAttribute('maxlength');
        
        if (minLength && value.length < parseInt(minLength)) {
            this.showFieldError(field, `Minimum length is ${minLength} characters`);
            return false;
        }
        
        if (maxLength && value.length > parseInt(maxLength)) {
            this.showFieldError(field, `Maximum length is ${maxLength} characters`);
            return false;
        }
        
        // Name validation
        if (field.dataset.type === 'name' && value && !this.patterns.name.test(value)) {
            this.showFieldError(field, 'Please enter a valid name (letters and spaces only)');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    },

    validateForm(form) {
        const inputs = form.querySelectorAll('.form-input');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // Custom form validation
        if (form.id === 'create-note-form') {
            isValid = this.validateCreateNoteForm(form) && isValid;
        }
        
        return isValid;
    },

    validateCreateNoteForm(form) {
        let isValid = true;
        
        // Check that borrower is different from lender
        const lenderEmail = form.querySelector('input[name="lender_email"]')?.value;
        const borrowerEmail = form.querySelector('input[name="borrower_email"]')?.value;
        
        if (lenderEmail && borrowerEmail && lenderEmail === borrowerEmail) {
            this.showFormError(form, 'Lender and borrower cannot have the same email address');
            isValid = false;
        }
        
        // Validate loan amount vs optional fee ratio
        const loanAmount = parseFloat(form.querySelector('input[name="loanAmount"]')?.value || 0);
        const optionalFee = parseFloat(form.querySelector('input[name="optionalFee"]')?.value || 0);
        
        if (optionalFee > loanAmount * 0.5) {
            this.showFormError(form, 'Optional fee cannot exceed 50% of loan amount');
            isValid = false;
        }
        
        return isValid;
    },

    // ===== ERROR HANDLING =====
    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remove existing error
        this.clearFieldError(field, false);
        
        // Add new error
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
    },

    clearFieldError(field, removeClass = true) {
        if (removeClass) {
            field.classList.remove('error');
        }
        
        const existingError = field.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
    },

    showFormError(form, message) {
        let errorContainer = form.querySelector('.form-errors');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form-errors alert alert-error mb-4';
            form.insertBefore(errorContainer, form.firstChild);
        }
        
        errorContainer.innerHTML = `
            <div class="flex items-center">
                <span>⚠️</span>
                <span class="ml-2">${message}</span>
                <button type="button" class="ml-auto" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
    },

    clearFormErrors(form) {
        const errorContainer = form.querySelector('.form-errors');
        if (errorContainer) {
            errorContainer.remove();
        }
    },

    // ===== FORM SUBMISSION =====
    setupFormSubmission() {
        document.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });
    },

    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        if (this.state.isSubmitting) {
            console.log('Form already submitting...');
            return;
        }
        
        this.clearFormErrors(form);
        
        if (this.validateForm(form)) {
            this.submitForm(form);
        } else {
            this.showFormError(form, 'Please correct the errors above and try again.');
        }
    },

    async submitForm(form) {
        this.state.isSubmitting = true;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Show loading state
        this.setButtonLoading(submitButton, true);
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            console.log('Submitting form data:', data);
            
            // Simulate API call (replace with actual API call)
            await this.simulateApiCall(form.id, data);
            
            // Handle success
            this.handleFormSuccess(form, data);
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.handleFormError(form, error.message);
        } finally {
            this.state.isSubmitting = false;
            this.setButtonLoading(submitButton, false);
        }
    },

    async simulateApiCall(formId, data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate occasional errors for testing
        if (Math.random() < 0.1) {
            throw new Error('Network error occurred. Please try again.');
        }
        
        return { success: true, data };
    },

    handleFormSuccess(form, data) {
        console.log('Form submitted successfully:', data);
        
        // Show success message
        TrustLend.showNotification('Form submitted successfully!', 'success');
        
        // Form-specific success handling
        switch (form.id) {
            case 'create-note-form':
                // Redirect to next step
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
                break;
            case 'profile-form':
                TrustLend.showNotification('Profile updated successfully!', 'success');
                break;
            default:
                console.log('Form submitted:', form.id);
        }
    },

    handleFormError(form, errorMessage) {
        this.showFormError(form, errorMessage || 'An error occurred. Please try again.');
    },

    setButtonLoading(button, isLoading) {
        if (!button) return;
        
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

    // ===== FIELD INTERACTIONS =====
    setupFieldInteractions() {
        // Auto-advance on input completion
        this.setupAutoAdvance();
        
        // Copy lender address to borrower
        this.setupAddressCopy();
        
        // Relationship suggestions
        this.setupRelationshipSuggestions();
    },

    setupAutoAdvance() {
        // Auto-advance from phone number fields
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                if (e.target.value.replace(/[^0-9]/g, '').length >= 10) {
                    const nextField = this.getNextField(e.target);
                    if (nextField) {
                        nextField.focus();
                    }
                }
            });
        });
    },

    setupAddressCopy() {
        const copyButton = document.querySelector('#copy-lender-address');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                this.copyLenderAddressToBorrower();
            });
        }
    },

    copyLenderAddressToBorrower() {
        const lenderFields = ['address', 'city', 'state', 'zip'];
        lenderFields.forEach(field => {
            const lenderInput = document.querySelector(`input[name="lender_${field}"]`);
            const borrowerInput = document.querySelector(`input[name="borrower_${field}"]`);
            if (lenderInput && borrowerInput) {
                borrowerInput.value = lenderInput.value;
                this.validateField(borrowerInput);
            }
        });
        
        TrustLend.showNotification('Address copied to borrower', 'info');
    },

    setupRelationshipSuggestions() {
        const relationshipInput = document.querySelector('select[name="relationship"]');
        if (relationshipInput) {
            relationshipInput.addEventListener('change', (e) => {
                this.updateRelationshipSuggestions(e.target.value);
            });
        }
    },

    updateRelationshipSuggestions(relationship) {
        const purposeField = document.querySelector('textarea[name="purpose"]');
        if (!purposeField || purposeField.value.trim()) return;
        
        const suggestions = {
            'family': 'Family financial assistance',
            'friend': 'Personal loan between friends',
            'colleague': 'Professional/business loan',
            'other': 'Personal loan agreement'
        };
        
        purposeField.placeholder = suggestions[relationship] || 'Loan purpose...';
    },

    // ===== TABS AND TOGGLES =====
    setupTabsAndToggles() {
        // Profile tabs
        this.setupProfileTabs();
        
        // Payment schedule toggles
        this.setupPaymentScheduleToggle();
        
        // Advanced options toggles
        this.setupAdvancedOptionsToggle();
    },

    setupProfileTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Remove active class from all
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.add('hidden'));
                
                // Add active class to current
                button.classList.add('active');
                if (tabContents[index]) {
                    tabContents[index].classList.remove('hidden');
                }
            });
        });
    },

    setupPaymentScheduleToggle() {
        const scheduleSelect = document.querySelector('select[name="paymentSchedule"]');
        const customSchedule = document.querySelector('.custom-schedule-options');
        
        if (scheduleSelect && customSchedule) {
            scheduleSelect.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customSchedule.classList.remove('hidden');
                } else {
                    customSchedule.classList.add('hidden');
                }
            });
        }
    },

    setupAdvancedOptionsToggle() {
        const toggleButton = document.querySelector('.advanced-options-toggle');
        const advancedOptions = document.querySelector('.advanced-options');
        
        if (toggleButton && advancedOptions) {
            toggleButton.addEventListener('click', () => {
                advancedOptions.classList.toggle('hidden');
                const isHidden = advancedOptions.classList.contains('hidden');
                toggleButton.textContent = isHidden ? 'Show Advanced Options' : 'Hide Advanced Options';
            });
        }
    },

    // ===== UTILITY FUNCTIONS =====
    getFieldLabel(field) {
        const label = field.closest('.form-group')?.querySelector('label');
        return label ? label.textContent.replace('*', '').trim() : field.name;
    },

    getNextField(currentField) {
        const form = currentField.closest('form');
        const fields = Array.from(form.querySelectorAll('.form-input'));
        const currentIndex = fields.indexOf(currentField);
        return fields[currentIndex + 1] || null;
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TrustLendForms.init();
});

// Expose to global scope
window.TrustLendForms = TrustLendForms;
