// TrustLend Smart Form Enhancements
// Add this JavaScript to improve form experience

class FormEnhancer {
    constructor() {
        this.initAutoSave();
        this.initSmartValidation();
        this.initProgressTracking();
        this.initSmartDefaults();
    }

    // Auto-save form progress
    initAutoSave() {
        const formId = window.location.pathname;
        const inputs = document.querySelectorAll('input, textarea, select');
        
        // Load saved data
        this.loadFormData(formId);
        
        // Save on input
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveFormData(formId);
            });
        });
    }

    saveFormData(formId) {
        const formData = {};
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.type === 'password') return; // Don't save passwords
            if (input.id) {
                formData[input.id] = input.type === 'checkbox' ? input.checked : input.value;
            }
        });
        
        localStorage.setItem(`trustlend_form_${formId}`, JSON.stringify(formData));
    }

    loadFormData(formId) {
        const savedData = localStorage.getItem(`trustlend_form_${formId}`);
        if (savedData) {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = formData[id];
                    } else {
                        input.value = formData[id];
                    }
                }
            });
        }
    }

    clearFormData(formId) {
        localStorage.removeItem(`trustlend_form_${formId}`);
    }

    // Real-time validation
    initSmartValidation() {
        // Email validation
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', () => {
                this.validateEmail(input);
            });
        });

        // Phone validation
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            input.addEventListener('input', () => {
                this.formatPhone(input);
            });
        });

        // Currency formatting
        document.querySelectorAll('input[data-currency]').forEach(input => {
            input.addEventListener('input', () => {
                this.formatCurrency(input);
            });
        });

        // Date validation
        document.querySelectorAll('input[type="date"]').forEach(input => {
            input.addEventListener('change', () => {
                this.validateDate(input);
            });
        });
    }

    validateEmail(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(input.value);
        
        this.updateInputState(input, isValid, isValid ? 'Valid email' : 'Please enter a valid email');
    }

    formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
        }
        input.value = value;
        
        const isValid = value.replace(/\D/g, '').length === 10;
        this.updateInputState(input, isValid, isValid ? 'Valid phone number' : 'Enter 10-digit phone number');
    }

    formatCurrency(input) {
        let value = input.value.replace(/[^\d.]/g, '');
        if (value) {
            const parts = value.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            if (parts[1]) {
                parts[1] = parts[1].substring(0, 2);
            }
            input.value = parts.join('.');
        }
    }

    validateDate(input) {
        const selectedDate = new Date(input.value);
        const today = new Date();
        const isValid = selectedDate > today;
        
        this.updateInputState(input, isValid, isValid ? 'Valid date' : 'Date must be in the future');
    }

    updateInputState(input, isValid, message) {
        // Remove existing state classes
        input.classList.remove('error-input', 'success-input');
        
        // Remove existing message
        const existingMessage = input.parentNode.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Add new state
        if (input.value) {
            input.classList.add(isValid ? 'success-input' : 'error-input');
            
            // Add message
            const messageDiv = document.createElement('div');
            messageDiv.className = `validation-message ${isValid ? 'text-green-600' : 'text-red-600'} text-sm mt-1`;
            messageDiv.textContent = message;
            input.parentNode.appendChild(messageDiv);
        }
    }

    // Progress tracking
    initProgressTracking() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('input', () => {
                this.updateProgress(form);
            });
        });
    }

    updateProgress(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        const completed = Array.from(inputs).filter(input => {
            if (input.type === 'checkbox') return input.checked;
            return input.value.trim() !== '';
        });

        const progress = Math.round((completed.length / inputs.length) * 100);
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
        }
    }

    // Smart defaults and suggestions
    initSmartDefaults() {
        // Auto-set loan date to today
        const loanDateInput = document.getElementById('loanDate');
        if (loanDateInput && !loanDateInput.value) {
            loanDateInput.value = new Date().toISOString().split('T')[0];
        }

        // Suggest due date (30 days from today)
        const dueDateInput = document.getElementById('dueDate');
        if (dueDateInput && !dueDateInput.value) {
            const suggestedDate = new Date();
            suggestedDate.setDate(suggestedDate.getDate() + 30);
            dueDateInput.value = suggestedDate.toISOString().split('T')[0];
        }

        // Smart relationship suggestions
        this.initRelationshipSuggestions();
    }

    initRelationshipSuggestions() {
        const relationshipInput = document.getElementById('relationship');
        if (relationshipInput) {
            const suggestions = [
                'Brother', 'Sister', 'Mother', 'Father', 'Son', 'Daughter',
                'Friend', 'Cousin', 'Uncle', 'Aunt', 'Nephew', 'Niece',
                'Business Partner', 'Colleague', 'Roommate', 'Neighbor'
            ];

            this.createDatalist(relationshipInput, suggestions, 'relationship-suggestions');
        }
    }

    createDatalist(input, options, id) {
        let datalist = document.getElementById(id);
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = id;
            document.body.appendChild(datalist);
        }

        datalist.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            datalist.appendChild(optionElement);
        });

        input.setAttribute('list', id);
    }
}

// Smart tooltips
class TooltipManager {
    constructor() {
        this.initTooltips();
    }

    initTooltips() {
        const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
        tooltipTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', (e) => this.showTooltip(e));
            trigger.addEventListener('mouseleave', () => this.hideTooltip());
            trigger.addEventListener('focus', (e) => this.showTooltip(e));
            trigger.addEventListener('blur', () => this.hideTooltip());
        });
    }

    showTooltip(e) {
        const text = e.target.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip fixed bg-gray-800 text-white px-2 py-1 rounded text-sm z-50';
        tooltip.textContent = text;
        tooltip.id = 'active-tooltip';
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
    }

    hideTooltip() {
        const tooltip = document.getElementById('active-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
}

// Keyboard shortcuts
class KeyboardShortcuts {
    constructor() {
        this.initShortcuts();
    }

    initShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + S to save (prevent default and trigger save)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.triggerSave();
            }

            // Ctrl/Cmd + Enter to submit form
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.triggerSubmit();
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    triggerSave() {
        const saveButton = document.querySelector('[data-save]');
        if (saveButton) {
            saveButton.click();
        }
    }

    triggerSubmit() {
        const submitButton = document.querySelector('input[type="submit"], button[type="submit"]');
        if (submitButton) {
            submitButton.click();
        }
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal, .popup');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }
}

// Initialize enhancements when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FormEnhancer();
    new TooltipManager();
    new KeyboardShortcuts();
    
    // Add helpful tooltips to common elements
    addSmartTooltips();
});

function addSmartTooltips() {
    const tooltips = {
        '#principal': 'The amount you are lending (without any fees)',
        '#serviceFee': 'Optional one-time fee for creating this contract',
        '#dueDate': 'When the borrower must pay back the full amount',
        '#graceDays': 'Days after due date before late fees apply',
        '#lateFeeFlat': 'Fixed dollar amount charged for late payments',
        '#accelerationClause': 'Allows you to demand full payment immediately if borrower defaults'
    };

    Object.keys(tooltips).forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.setAttribute('data-tooltip', tooltips[selector]);
        }
    });
}

// Copy to clipboard utility
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text).then(() => {
        showNotification(successMessage, 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification(successMessage, 'success');
    });
}

// Notification system
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 notification-${type}`;
    notification.textContent = message;
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    notification.classList.add(colors[type] || colors.info);
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, duration);
}

// Export utilities for use in other files
window.TrustLendUtils = {
    copyToClipboard,
    showNotification,
    FormEnhancer,
    TooltipManager,
    KeyboardShortcuts
};