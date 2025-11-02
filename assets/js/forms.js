// forms-updated.js - Consolidated form handling and validation functionality
class TrustLendForms {
    constructor() {
        this.validators = {};
        this.formatters = {};
        this.init();
    }

    init() {
        this.setupValidators();
        this.setupFormatters();
        this.setupEventListeners();
        this.initializeFormEnhancements();
    }

    setupValidators() {
        this.validators = {
            required: (value) => {
                return value && value.trim() !== '';
            },
            
            email: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value);
            },
            
            currency: (value) => {
                const numValue = parseFloat(value.replace(/[,$]/g, ''));
                return !isNaN(numValue) && numValue > 0;
            },
            
            percentage: (value) => {
                const numValue = parseFloat(value);
                return !isNaN(numValue) && numValue >= 0 && numValue <= 100;
            },
            
            positiveInteger: (value) => {
                const numValue = parseInt(value);
                return !isNaN(numValue) && numValue > 0;
            },
            
            ssn: (value) => {
                const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
                return ssnRegex.test(value.replace(/\s/g, ''));
            },
            
            phone: (value) => {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                const cleaned = value.replace(/[\s\-\(\)\.]/g, '');
                return phoneRegex.test(cleaned) && cleaned.length >= 10;
            }
        };
    }

    setupFormatters() {
        this.formatters = {
            currency: (value) => {
                // Remove all non-numeric characters except decimal point
                let numValue = value.replace(/[^\d.]/g, '');
                
                // Ensure only one decimal point
                const decimalIndex = numValue.indexOf('.');
                if (decimalIndex !== -1) {
                    numValue = numValue.substring(0, decimalIndex + 1) + 
                              numValue.substring(decimalIndex + 1).replace(/\./g, '');
                }
                
                // Parse and format
                const num = parseFloat(numValue);
                if (isNaN(num)) return '';
                
                return num.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            },
            
            percentage: (value) => {
                const numValue = value.replace(/[^\d.]/g, '');
                const num = parseFloat(numValue);
                return isNaN(num) ? '' : num.toString();
            },
            
            phone: (value) => {
                const cleaned = value.replace(/\D/g, '');
                if (cleaned.length >= 10) {
                    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                }
                return cleaned;
            },
            
            ssn: (value) => {
                const cleaned = value.replace(/\D/g, '');
                if (cleaned.length >= 9) {
                    return cleaned.replace(/(\d{3})(\d{2})(\d{4})/, '$1-$2-$3');
                }
                return cleaned;
            }
        };
    }

    setupEventListeners() {
        // Form submission handling
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('validate-form')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });

        // Real-time validation
        document.addEventListener('blur', (e) => {
            if (e.target.hasAttribute('data-validate')) {
                this.validateField(e.target);
            }
        });

        // Real-time formatting
        document.addEventListener('input', (e) => {
            const formatType = e.target.getAttribute('data-format');
            if (formatType && this.formatters[formatType]) {
                this.formatField(e.target, formatType);
            }
        });

        // Currency formatting specifically for loan amount
        const loanAmountField = document.querySelector('[name="loanAmount"]');
        if (loanAmountField) {
            loanAmountField.addEventListener('input', (e) => {
                this.formatCurrencyField(e.target);
            });
            
            loanAmountField.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
        }

        // Interest rate formatting
        const interestRateField = document.querySelector('[name="interestRate"]');
        if (interestRateField) {
            interestRateField.addEventListener('input', (e) => {
                this.formatPercentageField(e.target);
            });
        }

        // Phone formatting
        document.querySelectorAll('[data-format="phone"]').forEach(field => {
            field.addEventListener('input', (e) => {
                this.formatPhoneField(e.target);
            });
        });

        // Form reset handling
        document.addEventListener('reset', (e) => {
            setTimeout(() => this.clearValidationMessages(e.target), 0);
        });
    }

    formatCurrencyField(field) {
        const cursorPosition = field.selectionStart;
        const oldValue = field.value;
        const newValue = this.formatters.currency(oldValue);
        
        if (newValue !== oldValue) {
            field.value = newValue;
            
            // Restore cursor position (roughly)
            const newCursorPosition = cursorPosition + (newValue.length - oldValue.length);
            field.setSelectionRange(newCursorPosition, newCursorPosition);
        }
    }

    formatPercentageField(field) {
        let value = field.value.replace(/[^\d.]/g, '');
        const num = parseFloat(value);
        
        if (!isNaN(num) && num > 100) {
            field.value = '100';
        } else {
            field.value = value;
        }
    }

    formatPhoneField(field) {
        const formatted = this.formatters.phone(field.value);
        field.value = formatted;
    }

    formatField(field, formatType) {
        const formatter = this.formatters[formatType];
        if (formatter) {
            const cursorPosition = field.selectionStart;
            const oldValue = field.value;
            const newValue = formatter(oldValue);
            
            if (newValue !== oldValue) {
                field.value = newValue;
                
                // Try to maintain cursor position
                const newCursorPosition = Math.min(cursorPosition, newValue.length);
                field.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }
    }

    validateField(field) {
        const validationRules = field.getAttribute('data-validate');
        if (!validationRules) return true;

        const rules = validationRules.split(' ');
        const value = field.value;
        let isValid = true;
        let errorMessage = '';

        for (const rule of rules) {
            const validator = this.validators[rule];
            if (validator && !validator(value)) {
                isValid = false;
                errorMessage = this.getErrorMessage(rule, field);
                break;
            }
        }

        this.showValidationResult(field, isValid, errorMessage);
        return isValid;
    }

    getErrorMessage(rule, field) {
        const fieldName = field.getAttribute('data-field-name') || 
                         field.getAttribute('placeholder') || 
                         field.name || 'This field';

        const messages = {
            required: `${fieldName} is required.`,
            email: 'Please enter a valid email address.',
            currency: 'Please enter a valid dollar amount.',
            percentage: 'Please enter a valid percentage (0-100).',
            positiveInteger: 'Please enter a positive number.',
            ssn: 'Please enter a valid Social Security Number.',
            phone: 'Please enter a valid phone number.'
        };

        return messages[rule] || `${fieldName} is invalid.`;
    }

    showValidationResult(field, isValid, errorMessage) {
        // Remove existing validation classes and messages
        field.classList.remove('is-valid', 'is-invalid');
        
        const existingError = field.parentNode.querySelector('.invalid-feedback');
        if (existingError) {
            existingError.remove();
        }

        if (field.value.trim() === '') {
            // Don't show validation for empty fields unless they're required
            return;
        }

        // Add appropriate class
        field.classList.add(isValid ? 'is-valid' : 'is-invalid');

        // Show error message if invalid
        if (!isValid && errorMessage) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        }
    }

    handleFormSubmission(form) {
        const isFormValid = this.validateForm(form);
        
        if (!isFormValid) {
            this.showFormError('Please correct the errors below before submitting.');
            return false;
        }

        // Check if tier is selected (for contract forms)
        if (form.classList.contains('note-creation-form')) {
            const contracts = window.trustLendContracts;
            if (contracts && !contracts.getCurrentTier()) {
                this.showFormError('Please select a subscription tier before generating the contract.');
                return false;
            }
        }

        // Submit the form
        this.submitForm(form);
        return true;
    }

    validateForm(form) {
        const fieldsToValidate = form.querySelectorAll('[data-validate]');
        let isFormValid = true;

        fieldsToValidate.forEach(field => {
            const isFieldValid = this.validateField(field);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    async submitForm(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;

        try {
            // Show loading state
            if (submitBtn) {
                submitBtn.textContent = 'Processing...';
                submitBtn.disabled = true;
            }

            // Gather form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Simulate form submission (replace with actual API call)
            const result = await this.simulateFormSubmission(data);

            if (result.success) {
                this.showFormSuccess('Form submitted successfully!');
                form.reset();
                this.clearValidationMessages(form);
            } else {
                this.showFormError(result.message || 'Submission failed. Please try again.');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showFormError('An error occurred. Please try again.');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.textContent = originalText || 'Submit';
                submitBtn.disabled = false;
            }
        }
    }

    async simulateFormSubmission(data) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Form data submitted:', data);
        
        // Simulate success (replace with actual API logic)
        return {
            success: true,
            message: 'Form submitted successfully!'
        };
    }

    showFormError(message) {
        this.showFormMessage(message, 'danger');
    }

    showFormSuccess(message) {
        this.showFormMessage(message, 'success');
    }

    showFormMessage(message, type) {
        // Remove existing messages
        document.querySelectorAll('.form-message').forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} form-message`;
        messageDiv.textContent = message;

        // Insert at top of form or page
        const targetForm = document.querySelector('.note-creation-form') || 
                          document.querySelector('form') ||
                          document.body;
        
        if (targetForm.tagName === 'FORM') {
            targetForm.insertBefore(messageDiv, targetForm.firstChild);
        } else {
            targetForm.appendChild(messageDiv);
        }

        // Auto-remove success messages
        if (type === 'success') {
            setTimeout(() => messageDiv.remove(), 5000);
        }
    }

    clearValidationMessages(form) {
        form.querySelectorAll('.is-valid, .is-invalid').forEach(field => {
            field.classList.remove('is-valid', 'is-invalid');
        });
        
        form.querySelectorAll('.invalid-feedback').forEach(msg => {
            msg.remove();
        });
    }

    initializeFormEnhancements() {
        // Add tooltips for help text
        this.addTooltips();
        
        // Initialize character counters
        this.addCharacterCounters();
        
        // Add form progress indicators
        this.addProgressIndicators();
        
        // Initialize dependent field logic
        this.setupDependentFields();
    }

    addTooltips() {
        const fieldsWithHelp = document.querySelectorAll('[data-help]');
        fieldsWithHelp.forEach(field => {
            const helpText = field.getAttribute('data-help');
            const tooltip = document.createElement('small');
            tooltip.className = 'form-text text-muted';
            tooltip.textContent = helpText;
            field.parentNode.appendChild(tooltip);
        });
    }

    addCharacterCounters() {
        const fieldsWithLimits = document.querySelectorAll('[maxlength]');
        fieldsWithLimits.forEach(field => {
            const maxLength = field.getAttribute('maxlength');
            const counter = document.createElement('small');
            counter.className = 'form-text text-muted character-counter';
            
            const updateCounter = () => {
                const remaining = maxLength - field.value.length;
                counter.textContent = `${remaining} characters remaining`;
                counter.style.color = remaining < 10 ? '#dc3545' : '#6c757d';
            };
            
            field.addEventListener('input', updateCounter);
            updateCounter();
            
            field.parentNode.appendChild(counter);
        });
    }

    addProgressIndicators() {
        const forms = document.querySelectorAll('.multi-step-form');
        forms.forEach(form => {
            const steps = form.querySelectorAll('.form-step');
            if (steps.length > 1) {
                this.createProgressBar(form, steps.length);
            }
        });
    }

    createProgressBar(form, stepCount) {
        const progressBar = document.createElement('div');
        progressBar.className = 'form-progress mb-4';
        progressBar.innerHTML = `
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${100/stepCount}%"></div>
            </div>
            <div class="step-labels">
                ${Array.from({length: stepCount}, (_, i) => 
                    `<span class="step-label ${i === 0 ? 'active' : ''}">${i + 1}</span>`
                ).join('')}
            </div>
        `;
        
        form.insertBefore(progressBar, form.firstChild);
    }

    setupDependentFields() {
        // Collateral fields based on loan type
        const loanTypeField = document.querySelector('[name="loanType"]');
        if (loanTypeField) {
            loanTypeField.addEventListener('change', (e) => {
                this.toggleCollateralFields(e.target.value);
            });
        }

        // Payment frequency calculations
        const paymentFields = document.querySelectorAll('[name="loanAmount"], [name="interestRate"], [name="loanTerm"], [name="paymentFrequency"]');
        paymentFields.forEach(field => {
            field.addEventListener('change', () => {
                this.calculatePayments();
            });
        });
    }

    toggleCollateralFields(loanType) {
        const collateralSection = document.querySelector('.collateral-section');
        if (collateralSection) {
            const showCollateral = ['secured', 'auto', 'real-estate'].includes(loanType);
            collateralSection.style.display = showCollateral ? 'block' : 'none';
            
            // Update required status
            const collateralFields = collateralSection.querySelectorAll('[data-validate*="required"]');
            collateralFields.forEach(field => {
                if (showCollateral) {
                    field.setAttribute('data-validate', field.getAttribute('data-validate') + ' required');
                } else {
                    field.setAttribute('data-validate', field.getAttribute('data-validate').replace('required', '').trim());
                }
            });
        }
    }

    calculatePayments() {
        const loanAmount = parseFloat(document.querySelector('[name="loanAmount"]')?.value.replace(/[,$]/g, '')) || 0;
        const interestRate = parseFloat(document.querySelector('[name="interestRate"]')?.value) || 0;
        const loanTerm = parseInt(document.querySelector('[name="loanTerm"]')?.value) || 0;
        const paymentFrequency = document.querySelector('[name="paymentFrequency"]')?.value || 'monthly';

        if (loanAmount > 0 && interestRate > 0 && loanTerm > 0) {
            const monthlyRate = (interestRate / 100) / 12;
            const totalPayments = loanTerm;
            
            const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                                  (Math.pow(1 + monthlyRate, totalPayments) - 1);

            const paymentDisplay = document.querySelector('.payment-calculation');
            if (paymentDisplay) {
                paymentDisplay.innerHTML = `
                    <div class="alert alert-info">
                        <strong>Estimated Monthly Payment:</strong> $${monthlyPayment.toFixed(2)}
                        <br><small>Total Interest: $${((monthlyPayment * totalPayments) - loanAmount).toFixed(2)}</small>
                    </div>
                `;
            }
        }
    }

    // Public utility methods
    validateSingleField(fieldSelector) {
        const field = document.querySelector(fieldSelector);
        return field ? this.validateField(field) : false;
    }

    formatCurrency(value) {
        return this.formatters.currency(value);
    }

    clearForm(formSelector) {
        const form = document.querySelector(formSelector);
        if (form) {
            form.reset();
            this.clearValidationMessages(form);
        }
    }
}

// Initialize forms manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trustLendForms = new TrustLendForms();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrustLendForms;
}
