// Rating Management Module
class RatingManager {
    // Create rating controls (dropdown and add new button)
    static createRatingControls() {
        // Remove existing controls if any
        const existingControls = document.getElementById('ratingControls');
        if (existingControls) {
            existingControls.remove();
        }
        
        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.id = 'ratingControls';
        controlsContainer.className = 'rating-controls';
        
        // Create date range dropdown options (exclude currently displayed period)
        const dropdownOptions = appState.existingReviewPeriods
            .filter(period => {
                // Exclude the currently displayed period
                if (!appState.currentDisplayedPeriod) return true;
                return !(period.startDate === appState.currentDisplayedPeriod.startDate && 
                        period.endDate === appState.currentDisplayedPeriod.endDate);
            })
            .map(period => ({
                text: `${period.startDate} - ${period.endDate}`,
                value: period
            }));
        
        const placeholder = dropdownOptions.length > 0 ? 
            'Select a rating period ▼' : 
            'No other rating periods available';
        
        // Check if we should disable dropdown due to single total period
        const totalPeriods = appState.existingReviewPeriods.length;
        const shouldDisableDropdown = totalPeriods <= 1;
        
        // Create dropdown (left side)
        const dropdown = UIUtils.createDropdown(
            dropdownOptions,
            (option) => RatingManager.displayRatingForPeriod(option.value),
            placeholder,
            shouldDisableDropdown
        );
        
        // Limit dropdown width to prevent excessive padding
        dropdown.container.style.maxWidth = '300px';
        dropdown.container.style.flexShrink = '1';
        
        // Create Add New Rating button (right side)
        const addNewButton = document.createElement('button');
        addNewButton.id = 'addNewRatingBtn';
        addNewButton.type = 'button';
        addNewButton.className = 'compact-btn';
        addNewButton.textContent = '+ Rating';
        
        addNewButton.addEventListener('click', function() {
            ScreenManager.showDateRangeModal();
        });
        
        controlsContainer.appendChild(dropdown.container);
        controlsContainer.appendChild(addNewButton);
        
        // Insert controls after TA name but before review period display
        const contentDiv = domElements.ratingContainer.querySelector('.content');
        const taNameElement = document.getElementById('selectedTAName');
        taNameElement.parentNode.insertBefore(controlsContainer, taNameElement.nextSibling);
    }

    // Refresh dropdown to exclude currently displayed period
    static refreshDropdown() {
        const existingDropdown = document.querySelector('#ratingControls .dropdown-container');
        
        if (!existingDropdown) {
            // Try to update button text directly if dropdown exists but wasn't found by the selector
            RatingManager.updateDropdownButtonText();
            return;
        }

        // Create updated dropdown options (exclude currently displayed period)
        const dropdownOptions = appState.existingReviewPeriods
            .filter(period => {
                // Exclude the currently displayed period
                if (!appState.currentDisplayedPeriod) return true;
                const isCurrentPeriod = period.startDate === appState.currentDisplayedPeriod.startDate && 
                        period.endDate === appState.currentDisplayedPeriod.endDate;
                return !isCurrentPeriod;
            })
            .map(period => ({
                text: `${period.startDate} - ${period.endDate}`,
                value: period
            }));

        // Determine the button text - always show the current period if available
        let buttonText;
        if (appState.currentDisplayedPeriod) {
            buttonText = `${appState.currentDisplayedPeriod.startDate} - ${appState.currentDisplayedPeriod.endDate} ▼`;
        } else {
            buttonText = dropdownOptions.length > 0 ? 'Select a rating period ▼' : 'No rating periods available';
        }

        // Check if we should disable dropdown due to single total period
        const totalPeriods = appState.existingReviewPeriods.length;
        const shouldDisableDropdown = totalPeriods <= 1;

        // Create new dropdown
        const newDropdown = UIUtils.createDropdown(
            dropdownOptions,
            (option) => RatingManager.displayRatingForPeriod(option.value),
            buttonText, // Use current period as the "placeholder"
            shouldDisableDropdown
        );

        // Apply same styling as initial dropdown
        newDropdown.container.style.maxWidth = '300px';
        newDropdown.container.style.flexShrink = '1';

        // Replace the old dropdown
        existingDropdown.parentNode.replaceChild(newDropdown.container, existingDropdown);
    }

    // Update dropdown button text to show currently selected period
    static updateDropdownButtonText() {
        const dropdownButton = document.querySelector('#ratingControls .dropdown-container button');
        
        if (!dropdownButton || !appState.currentDisplayedPeriod) return;

        const currentPeriodText = `${appState.currentDisplayedPeriod.startDate} - ${appState.currentDisplayedPeriod.endDate}`;
        dropdownButton.textContent = currentPeriodText + ' ▼';
    }

    // Display rating data for a specific period
    static async displayRatingForPeriod(period) {
        try {
            UIUtils.showLoading('Loading rating data...');
            
            // Set the current displayed period in state
            appState.currentDisplayedPeriod = period;
            
            // Refresh the dropdown to exclude the currently displayed period
            // This will also set the correct button text
            RatingManager.refreshDropdown();
            
            // Update period display with properly formatted dates
            domElements.reviewPeriodDisplay.textContent = `${DateUtils.formatDateStringCompact(period.startDate)} - ${DateUtils.formatDateStringCompact(period.endDate)}`;
            // Hide the blue box when viewing existing ratings (redundant with dropdown)
            domElements.reviewPeriodDisplay.style.display = 'none';
            
            // Fetch all ratings for this TA
            const response = await fetch(`${CONFIG.apiUrl}?action=getTARatings&taId=${appState.selectedTAId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch ratings');
            }
            
            const data = await response.json();
            
            // Normalize the rating dates for comparison
            const normalizedRatings = data.ratings.map(rating => ({
                ...rating,
                startDate: DateUtils.formatDateStringCompact(rating.startDate),
                endDate: DateUtils.formatDateStringCompact(rating.endDate)
            }));
            
            // Find the specific rating for this period and user type
            const periodRating = normalizedRatings.find(rating => 
                rating.raterType === appState.currentUserType &&
                rating.startDate === period.startDate &&
                rating.endDate === period.endDate
            );
            
            if (periodRating) {
                // Show existing rating data (read-only)
                RatingManager.displayExistingRating(periodRating);
                domElements.ratingForm.style.display = 'none';
            } else {
                // No rating found for this period, show empty form
                domElements.reviewPeriodDisplay.textContent = `${DateUtils.formatDateStringCompact(period.startDate)} - ${DateUtils.formatDateStringCompact(period.endDate)} (No rating found)`;
                domElements.ratingForm.style.display = 'block';
                UIUtils.resetForm(domElements.ratingForm);
                
                // Setup field event listeners for error clearing
                RatingManager.setupRatingFieldListeners();
            }
            
            UIUtils.hideLoading();
        } catch (error) {
            console.error('Error loading rating data:', error);
            UIUtils.hideLoading();
            domElements.reviewPeriodDisplay.textContent = `${DateUtils.formatDateStringCompact(period.startDate)} - ${DateUtils.formatDateStringCompact(period.endDate)} (Error loading)`;
            domElements.ratingForm.style.display = 'none';
        }
    }

    // Display existing rating data in a read-only format
    static displayExistingRating(rating) {
        // Remove existing rating display if any
        const existingDisplay = document.getElementById('existingRatingDisplay');
        if (existingDisplay) {
            existingDisplay.remove();
        }
        
        // Create rating display container
        const ratingDisplay = document.createElement('div');
        ratingDisplay.id = 'existingRatingDisplay';
        
        // Create header
        // const header = document.createElement('h4');
        // header.textContent = 'Rating Details';
        // ratingDisplay.appendChild(header);
        
        // Create modern rating display
        const raterInfo = {
            name: rating.raterName,
            type: rating.raterType,
            date: DateUtils.formatDateCompact(new Date(rating.timestamp))
        };
        
        const modernDisplay = UIUtils.createModernRatingDisplay(rating, raterInfo, RATING_CATEGORIES, rating.comments);
        ratingDisplay.appendChild(modernDisplay);
        
        // Note: Comments are now included in the modern display, no need to add separately
        
        // Insert rating display after review period display
        domElements.reviewPeriodDisplay.parentNode.insertBefore(ratingDisplay, domElements.reviewPeriodDisplay.nextSibling);
    }

    // Clear validation error highlighting
    static clearValidationErrors() {
        // Remove error class from all rating groups
        document.querySelectorAll('.rating-group.error').forEach(group => {
            group.classList.remove('error');
        });
        
        // Remove error class from form groups (comments)
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
        });
    }

    // Setup rating form field event listeners for error clearing
    static setupRatingFieldListeners() {
        // Clear error highlighting when users interact with rating fields
        const radioButtons = document.querySelectorAll('#ratingForm input[type="radio"]');
        
        radioButtons.forEach(radio => {
            radio.addEventListener('change', function() {
                const ratingGroup = this.closest('.rating-group');
                if (ratingGroup && ratingGroup.classList.contains('error')) {
                    ratingGroup.classList.remove('error');
                }
            });
        });
    }

    // Handle rating form submission
    static async handleRatingSubmission(formData) {
        // Clear any previous error highlighting
        RatingManager.clearValidationErrors();
        
        // Validate all ratings are selected
        const requiredRatings = ['discipline', 'ethics', 'knowledge', 'communication', 'teamwork'];
        const ratings = {};
        let hasError = false;
        const missingRatings = [];

        requiredRatings.forEach(rating => {
            const value = formData.get(rating);
            if (!value) {
                hasError = true;
                missingRatings.push(rating);
                // Highlight the rating group with error
                const ratingGroup = document.querySelector(`input[name="${rating}"]`).closest('.rating-group');
                if (ratingGroup) {
                    ratingGroup.classList.add('error');
                }
            } else {
                ratings[rating] = parseInt(value);
            }
        });

        // Comments are optional, no validation needed
        
        if (hasError) {
            const errorMessage = 'Please rate all categories';
            UIUtils.showError(domElements.ratingError, errorMessage);
            
            // Scroll to the first error field
            const firstErrorElement = document.querySelector('.rating-group.error, .form-group.error');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            return false;
        }

        // Prepare rating data
        const ratingData = {
            taId: appState.selectedTAId,
            taName: appState.selectedTAName,
            raterPhone: appState.currentUserPhone,
            raterName: appState.currentUserName,
            raterType: appState.currentUserType,
            startDate: appState.selectedStartDate,
            endDate: appState.selectedEndDate,
            ...ratings,
            comments: formData.get('comments') || '',
            timestamp: new Date().toISOString()
        };

        console.log('Submitting rating data:', ratingData);

        // Submit rating
        const result = await APIService.submitRating(ratingData);

        console.log('Rating submission result:', result);

        if (result.status === 'success') {
            ScreenManager.showConfirmationScreen();
            return true;
        } else {
            UIUtils.showError(domElements.ratingError, result.message || 'Failed to submit rating. Please try again.');
            return false;
        }
    }
}

// Export the RatingManager class
export { RatingManager };

// For backward compatibility (can be removed later)
window.RatingManager = RatingManager;
