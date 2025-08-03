// Screen Navigation Module
class ScreenManager {
    // Show login screen
    static showLogin() {
        domElements.hideAllContainers();
        domElements.loginContainer.style.display = 'block';
        
        // Reset form fields
        UIUtils.resetForm(domElements.loginForm);
        domElements.resetErrors();
        
        // Reset body style for login screen
        UIUtils.setCenteredBodyStyle();
    }

    // Show TA selection screen
    static showTASelection() {
        domElements.hideAllContainers();
        domElements.taSelectionContainer.style.display = 'block';
        
        // Reset body style
        UIUtils.setCenteredBodyStyle();
        
        // Fetch TA list if not already loaded
        if (appState.taList.length === 0) {
            APIService.fetchTAList().then(() => {
                TAManager.populateTADropdown();
            });
        }
    }

    // Show rating screen with date range
    static showRatingScreenWithDateRange() {
        domElements.hideAllContainers();
        domElements.ratingContainer.style.display = 'block';
        
        // Update displays
        domElements.selectedTANameDisplay.textContent = appState.selectedTAName;
        domElements.reviewPeriodDisplay.textContent = `${DateUtils.formatDateStringCompact(appState.selectedStartDate)} - ${DateUtils.formatDateStringCompact(appState.selectedEndDate)}`;
        
        // Reset and show form
        UIUtils.resetForm(domElements.ratingForm);
        domElements.ratingForm.style.display = 'block';
        
        // Set body style for scrollable content
        UIUtils.setScrollableBodyStyle();
    }

    // Show rating screen with previous data display
    static async showRatingScreenWithPreviousData() {
        domElements.hideAllContainers();
        domElements.ratingContainer.style.display = 'block';
        
        // Update displays
        domElements.selectedTANameDisplay.textContent = appState.selectedTAName;
        
        // Fetch existing review periods to show in dropdown
        await APIService.fetchExistingReviewPeriods();
        
        // Create rating controls (dropdown and add button)
        RatingManager.createRatingControls();
        
        // Show the most recent rating by default if available
        if (appState.existingReviewPeriods.length > 0) {
            await RatingManager.displayRatingForPeriod(appState.existingReviewPeriods[0]);
        } else {
            // No existing ratings, show new rating form
            domElements.reviewPeriodDisplay.textContent = 'No previous ratings found';
            domElements.ratingForm.style.display = 'block';
            UIUtils.resetForm(domElements.ratingForm);
        }
        
        // Set body style for scrollable content
        UIUtils.setScrollableBodyStyle();
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
        domElements.dateRangeModal.style.display = 'block';
        
        // Set minimum start date based on last review end date
        DateUtils.setDateConstraints();
        
        // Reset form
        domElements.startDateInput.value = '';
        domElements.endDateInput.value = '';
        UIUtils.hideError(domElements.dateRangeError);
        domElements.proceedWithDatesBtn.disabled = true;
    }

    // Close date range modal
    static closeDateRangeModal() {
        if (domElements.dateRangeModal) {
            domElements.dateRangeModal.style.display = 'none';
        }
    }
}
