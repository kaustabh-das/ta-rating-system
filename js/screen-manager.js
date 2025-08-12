// Screen Navigation Module
class ScreenManager {
    // Show login screen
    static showLogin() {
        domElements.hideAllContainers();
        domElements.loginContainer.style.display = 'flex';
        
        // Reset form fields
        UIUtils.resetForm(domElements.loginForm);
        domElements.resetErrors();
        
        // Reset body style for login screen
        UIUtils.setCenteredBodyStyle();
    }

    // Show TA selection screen
    static showTASelection() {
        domElements.hideAllContainers();
        domElements.taSelectionContainer.style.display = 'flex';
        
        // Clear any validation errors from rating form
        RatingManager.clearValidationErrors();
        
        // Clean up any existing dropdown listeners to prevent duplicates
        TAManager.cleanupDropdownListeners();
        
        // Reset body style
        UIUtils.setCenteredBodyStyle();
        
        // Fetch TA list if not already loaded
        if (appState.taList.length === 0) {
            APIService.fetchTAList().then(() => {
                TAManager.populateTADropdown();
            });
        } else {
            // Reinitialize dropdown if TAs are already loaded
            TAManager.initializeCustomDropdown();
        }
    }

    // Show rating screen with date range
    static showRatingScreenWithDateRange() {
        domElements.hideAllContainers();
        domElements.ratingContainer.style.display = 'flex';
        
        // Clear any previous validation errors
        RatingManager.clearValidationErrors();
        
        // Remove rating controls (dropdown) for new rating workflow
        const ratingControls = document.getElementById('ratingControls');
        if (ratingControls) {
            ratingControls.remove();
        }
        
        // Hide officer sections for new rating workflow
        OfficerRatingManager.resetSections();
        
        // Hide any existing rating displays
        const existingRatingDisplay = document.getElementById('existingRatingDisplay');
        if (existingRatingDisplay) {
            existingRatingDisplay.remove();
        }
        
        // Update page title for new rating
        const pageTitle = document.querySelector('#ratingContainer .page-title');
        if (pageTitle) {
            pageTitle.innerHTML = '<i class="fas fa-plus-circle"></i>Add New Rating';
        }
        
        // Update displays
        domElements.selectedTANameDisplay.textContent = appState.selectedTAName;
        domElements.reviewPeriodDisplay.textContent = `${DateUtils.formatDateStringCompact(appState.selectedStartDate)} - ${DateUtils.formatDateStringCompact(appState.selectedEndDate)}`;
        domElements.reviewPeriodDisplay.style.display = 'block'; // Show blue box for new ratings
        
        // Reset and show form
        UIUtils.resetForm(domElements.ratingForm);
        domElements.ratingForm.style.display = 'block';
        
        // Setup field event listeners for error clearing
        RatingManager.setupRatingFieldListeners();
        
        // Set body style for scrollable content
        UIUtils.setScrollableBodyStyle();
    }

    // Show rating screen with previous data display
    static async showRatingScreenWithPreviousData() {
        domElements.hideAllContainers();
        domElements.ratingContainer.style.display = 'flex';
        
        // Clear any previous validation errors
        RatingManager.clearValidationErrors();
        
        // Clear any existing rating displays from previous TA
        const existingRatingDisplay = document.getElementById('existingRatingDisplay');
        if (existingRatingDisplay) {
            existingRatingDisplay.remove();
        }
        
        // Clear any previously displayed period
        appState.clearDisplayedPeriod();
        
        // Reset officer sections
        OfficerRatingManager.resetSections();
        
        // Update page title for viewing past ratings
        const pageTitle = document.querySelector('#ratingContainer .page-title');
        if (pageTitle) {
            pageTitle.innerHTML = '<i class="fas fa-star"></i>Past TA Ratings';
        }
        
        // Update displays
        domElements.selectedTANameDisplay.textContent = appState.selectedTAName;
        
        // Check if user is an officer to show specialized interface
        if (appState.currentUserType === 'officer') {
            // Show officer-specific rating screen with mentor and officer sections
            await OfficerRatingManager.initializeOfficerRatingScreen();
        } else {
            // Show regular rating screen for mentors
            await ScreenManager.showRegularRatingScreen();
        }
        
        // Set body style for scrollable content
        UIUtils.setScrollableBodyStyle();
    }
    
    // Show regular rating screen (for mentors)
    static async showRegularRatingScreen() {
        // Fetch existing review periods to show in dropdown
        await APIService.fetchExistingReviewPeriods();
        
        // Create rating controls (dropdown and add button)
        RatingManager.createRatingControls();
        
        // Show the most recent rating by default if available
        if (appState.existingReviewPeriods.length > 0) {
            await RatingManager.displayRatingForPeriod(appState.existingReviewPeriods[0]);
        } else {
            // No existing ratings, show message but don't show rating form yet
            domElements.reviewPeriodDisplay.textContent = 'No previous ratings found';
            domElements.reviewPeriodDisplay.style.display = 'block';
            // Don't show rating form automatically - user must click "Add New Rating"
            domElements.ratingForm.style.display = 'none';
        }
    }

    // Show review management screen
    static async showReviewManagement() {
        domElements.hideAllContainers();
        domElements.reviewManagementContainer.style.display = 'block';
        
        // Update TA name display
        domElements.reviewManagementTAName.textContent = appState.selectedTAName;
        
        // Fetch existing review periods for this TA and current user type
        await APIService.fetchExistingReviewPeriods();
        
        // Display existing reviews and add button
        ReviewManager.displayExistingReviews();
        
        // Set body style
        UIUtils.setScrollableBodyStyle();
    }

    // Show confirmation screen
    static showConfirmationScreen() {
        domElements.hideAllContainers();
        domElements.confirmationContainer.style.display = 'block';
        
        // Reset body style
        UIUtils.setCenteredBodyStyle();
    }

        // Show date range modal
    static showDateRangeModal() {
        const modal = document.getElementById('dateRangeModal');
        if (modal) {
            modal.style.display = 'block';
            
            // Add click outside to close functionality
            setTimeout(() => {
                modal.addEventListener('click', function(event) {
                    if (event.target === modal) {
                        ScreenManager.closeDateRangeModal();
                    }
                });
            }, 100);
        }
        
        // Reset form and constraints
        DateUtils.setDateConstraints();
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        
        const proceedBtn = document.getElementById('proceedWithDatesBtn');
        if (proceedBtn) proceedBtn.disabled = true;
    }

    // Close date range modal
    static closeDateRangeModal() {
        const modal = document.getElementById('dateRangeModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Also reset form if needed
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const dateRangeError = document.getElementById('dateRangeError');
        
        if (startDateInput) startDateInput.value = '';
        if (endDateInput) endDateInput.value = '';
        if (dateRangeError) dateRangeError.style.display = 'none';
        
        // Disable proceed button
        const proceedBtn = document.getElementById('proceedWithDatesBtn');
        if (proceedBtn) proceedBtn.disabled = true;
    }
}

// Export the ScreenManager class
export { ScreenManager };

// For backward compatibility (can be removed later)
window.ScreenManager = ScreenManager;
