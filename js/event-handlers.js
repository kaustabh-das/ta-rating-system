// Event Handlers Module
class EventHandlers {
    // Initialize all event listeners
    static initialize() {
        EventHandlers.setupLoginHandlers();
        EventHandlers.setupTASelectionHandlers();
        EventHandlers.setupRatingHandlers();
        EventHandlers.setupNavigationHandlers();
        EventHandlers.setupDateRangeHandlers();
    }

    // Setup login form handlers
    static setupLoginHandlers() {
        domElements.loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Reset errors
            domElements.resetErrors();
            
            // Get input values
            const phone = domElements.phoneInput.value.trim();
            const password = domElements.passwordInput.value.trim();
            
            // Basic validation
            const validationFields = [
                {
                    value: phone,
                    errorElement: domElements.phoneError,
                    message: 'Phone number is required'
                },
                {
                    value: password,
                    errorElement: domElements.passwordError,
                    message: 'Password is required'
                }
            ];

            if (!UIUtils.validateRequiredFields(validationFields)) {
                return;
            }
            
            // Attempt login
            const result = await AuthManager.handleLogin(phone, password);
            
            if (result.success) {
                ScreenManager.showTASelection();
            } else {
                UIUtils.showError(domElements.loginError, result.message);
            }
        });
    }

    // Setup TA selection handlers
    static setupTASelectionHandlers() {
        domElements.proceedToRatingBtn.addEventListener('click', async function() {
            if (TAManager.handleTASelection()) {
                await ScreenManager.showRatingScreenWithPreviousData();
            }
        });
    }

    // Setup rating form handlers
    static setupRatingHandlers() {
        domElements.ratingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Reset error
            UIUtils.hideError(domElements.ratingError);
            
            // Get form data
            const formData = new FormData(domElements.ratingForm);
            
            // Handle rating submission
            await RatingManager.handleRatingSubmission(formData);
        });
    }

    // Setup navigation handlers
    static setupNavigationHandlers() {
        // Logout buttons
        [domElements.logoutButton, domElements.logoutButton2, domElements.logoutButton3].forEach(button => {
            if (button) {
                button.addEventListener('click', AuthManager.logout);
            }
        });

        // Back to selection button
        if (domElements.backToSelectionBtn) {
            domElements.backToSelectionBtn.addEventListener('click', function() {
                UIUtils.hideError(domElements.ratingError);
                RatingManager.clearValidationErrors();
                ScreenManager.showTASelection();
                UIUtils.resetForm(domElements.ratingForm);
            });
        }

        // Rate another button
        if (domElements.rateAnotherBtn) {
            domElements.rateAnotherBtn.addEventListener('click', function() {
                RatingManager.clearValidationErrors();
                UIUtils.resetForm(domElements.ratingForm);
                ScreenManager.showTASelection();
            });
        }
    }

    // Setup date range handlers
    static setupDateRangeHandlers() {
        // Add review button
        if (domElements.addReviewBtn) {
            domElements.addReviewBtn.addEventListener('click', ScreenManager.showDateRangeModal);
        }

        // Proceed with dates button
        if (domElements.proceedWithDatesBtn) {
            domElements.proceedWithDatesBtn.addEventListener('click', function() {
                if (DateUtils.validateDateRange()) {
                    // Use compact format (DD/MM/YY) for date range
                    appState.setDateRange(domElements.startDateInput.value, domElements.endDateInput.value);
                    
                    // Hide modal and show rating screen
                    ScreenManager.closeDateRangeModal();
                    ScreenManager.showRatingScreenWithDateRange();
                }
            });
        }

        // Setup date input change handlers
        DateUtils.setupDateInputHandlers();
    }
}

// Export the EventHandlers class
export { EventHandlers };

// For backward compatibility (can be removed later)
window.EventHandlers = EventHandlers;
