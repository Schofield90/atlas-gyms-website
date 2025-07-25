// Landing Page Form Handler with Enhanced Attribution
class LandingFormHandler {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        this.setupFormHandlers();
    }

    setupFormHandlers() {
        const forms = document.querySelectorAll('.landing-form');
        
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleFormSubmit(form);
            });

            // Real-time validation
            this.setupValidation(form);
        });
    }

    setupValidation(form) {
        const emailInput = form.querySelector('input[type="email"]');
        const phoneInput = form.querySelector('input[type="tel"]');

        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput);
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                this.validatePhone(phoneInput);
            });
        }
    }

    validateEmail(input) {
        const email = input.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        if (!isValid && email) {
            input.classList.add('error');
            this.showError(input, 'Please enter a valid email address');
        } else {
            input.classList.remove('error');
            this.clearError(input);
        }
        
        return isValid;
    }

    validatePhone(input) {
        const phone = input.value.replace(/\D/g, '');
        const isValid = phone.length >= 10;
        
        if (!isValid && phone) {
            input.classList.add('error');
            this.showError(input, 'Please enter a valid phone number');
        } else {
            input.classList.remove('error');
            this.clearError(input);
        }
        
        return isValid;
    }

    showError(input, message) {
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.textContent = message;
        } else {
            const error = document.createElement('span');
            error.className = 'error-message';
            error.textContent = message;
            input.parentElement.appendChild(error);
        }
    }

    clearError(input) {
        const error = input.parentElement.querySelector('.error-message');
        if (error) {
            error.remove();
        }
    }

    async handleFormSubmit(form) {
        // Disable submit button to prevent double submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Get form data
            const formData = new FormData(form);
            
            // Add complete attribution data
            const attribution = window.leadTracker.getCompleteAttributionData();
            formData.append('attribution_data', JSON.stringify(attribution));
            
            // Add form metadata
            formData.append('form_submitted_at', new Date().toISOString());
            formData.append('form_type', 'landing_page_consultation');
            
            // Track conversion event
            window.leadTracker.trackEvent('consultation_booked', {
                location: form.dataset.location,
                campaign: form.dataset.campaign,
                goal: formData.get('goal')
            });

            // Submit to your API endpoint
            const response = await this.submitToAPI(formData);

            if (response.ok) {
                // Success
                this.showSuccess(form);
                
                // Send to GoHighLevel if configured
                await this.sendToGoHighLevel(formData);
                
                // Send Facebook Conversion API event
                await this.sendFacebookConversion(formData);
                
                // Redirect to thank you page after delay
                setTimeout(() => {
                    window.location.href = `/thank-you?location=${form.dataset.location}`;
                }, 2000);
            } else {
                throw new Error('Form submission failed');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showError(form, 'Sorry, there was an error. Please try again or call us directly.');
            
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async submitToAPI(formData) {
        // Convert FormData to JSON
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });

        return await fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async sendToGoHighLevel(formData) {
        // This would integrate with your GoHighLevel webhook
        // Include all attribution data for proper tracking
        try {
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            await fetch('/api/gohighlevel-webhook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('GoHighLevel submission error:', error);
            // Don't fail the main submission if this fails
        }
    }

    async sendFacebookConversion(formData) {
        // Server-side Facebook Conversion API
        try {
            const data = {
                event_name: 'Lead',
                event_time: Math.floor(Date.now() / 1000),
                user_data: {
                    email: this.hashValue(formData.get('email')),
                    phone: this.hashValue(this.normalizePhone(formData.get('phone'))),
                    first_name: this.hashValue(formData.get('name').split(' ')[0].toLowerCase()),
                    last_name: this.hashValue(formData.get('name').split(' ').slice(1).join(' ').toLowerCase())
                },
                custom_data: {
                    location: formData.get('location'),
                    goal: formData.get('goal'),
                    campaign: formData.get('utm_campaign'),
                    value: 50.00, // Estimated lead value
                    currency: 'GBP'
                },
                action_source: 'website',
                source_url: window.location.href
            };

            await fetch('/api/facebook-conversions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Facebook Conversion API error:', error);
            // Don't fail the main submission if this fails
        }
    }

    normalizePhone(phone) {
        // Remove all non-digits and add country code if missing
        let normalized = phone.replace(/\D/g, '');
        if (!normalized.startsWith('44')) {
            normalized = '44' + normalized.replace(/^0/, '');
        }
        return normalized;
    }

    hashValue(value) {
        // Simple hash function for privacy
        // In production, use SHA256
        return btoa(value.toLowerCase().trim());
    }

    showSuccess(form) {
        form.innerHTML = `
            <div class="form-success">
                <h3>Thank You! 🎉</h3>
                <p>We've received your consultation request.</p>
                <p>We'll contact you within 24 hours to schedule your free consultation.</p>
                <p><strong>What happens next:</strong></p>
                <ul>
                    <li>We'll call you to understand your goals</li>
                    <li>Schedule your free consultation</li>
                    <li>Create your personalized transformation plan</li>
                </ul>
            </div>
        `;
    }

    showError(form, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        
        // Insert at top of form
        form.insertBefore(errorDiv, form.firstChild);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize form handler
new LandingFormHandler();

// Add CSS for form states
const style = document.createElement('style');
style.textContent = `
    .landing-form input.error,
    .landing-form select.error {
        border-color: #d32f2f;
    }
    
    .error-message {
        display: block;
        color: #d32f2f;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .form-success {
        text-align: center;
        padding: 2rem;
    }
    
    .form-success h3 {
        color: #2e7d32;
        margin-bottom: 1rem;
    }
    
    .form-success ul {
        text-align: left;
        max-width: 300px;
        margin: 1rem auto 0;
    }
    
    .form-error {
        background: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        text-align: center;
    }
    
    button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);