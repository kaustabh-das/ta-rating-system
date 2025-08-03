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
        controlsContainer.style.display = 'flex';
        controlsContainer.style.justifyContent = 'space-between';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.marginBottom = '20px';
        controlsContainer.style.padding = '10px';
        controlsContainer.style.backgroundColor = '#f8f9fa';
        controlsContainer.style.borderRadius = '5px';
        controlsContainer.style.border = '1px solid #dee2e6';
        
        // Create date range dropdown options
        const dropdownOptions = appState.existingReviewPeriods.map(period => ({
            text: `${period.startDate} - ${period.endDate}`,
            value: period
        }));
        
        const placeholder = appState.existingReviewPeriods.length > 0 ? 
            `${appState.existingReviewPeriods[0].startDate} - ${appState.existingReviewPeriods[0].endDate}` : 
            'No previous ratings';
        
        // Create dropdown (left side)
        const dropdown = UIUtils.createDropdown(
            dropdownOptions,
            (option) => RatingManager.displayRatingForPeriod(option.value),
            placeholder
        );
        
        // Create Add New Rating button (right side)
        const addNewButton = document.createElement('button');
        addNewButton.id = 'addNewRatingBtn';
        addNewButton.type = 'button';
        addNewButton.className = 'compact-btn';
        addNewButton.textContent = '+ Add New Rating';
        
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

    // Display rating data for a specific period
    static async displayRatingForPeriod(period) {
        try {
            UIUtils.showLoading('Loading rating data...');
            
            // Update period display
            domElements.reviewPeriodDisplay.textContent = `${period.startDate} - ${period.endDate}`;
            domElements.reviewPeriodDisplay.style.display = 'block';
            
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
                domElements.reviewPeriodDisplay.textContent = `${period.startDate} - ${period.endDate} (No rating found)`;
                domElements.ratingForm.style.display = 'block';
                UIUtils.resetForm(domElements.ratingForm);
            }
            
            UIUtils.hideLoading();
        } catch (error) {
            console.error('Error loading rating data:', error);
            UIUtils.hideLoading();
            domElements.reviewPeriodDisplay.textContent = `${period.startDate} - ${period.endDate} (Error loading)`;
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
        ratingDisplay.style.marginTop = '20px';
        ratingDisplay.style.padding = '20px';
        ratingDisplay.style.border = '1px solid #ddd';
        ratingDisplay.style.borderRadius = '5px';
        ratingDisplay.style.backgroundColor = '#f8f9fa';
        
        // Create header
        const header = document.createElement('h4');
        header.textContent = 'Rating Details';
        header.style.marginBottom = '15px';
        header.style.color = '#495057';
        ratingDisplay.appendChild(header);
        
        // Create rater info
        const raterInfo = document.createElement('p');
        raterInfo.innerHTML = `<strong>Rated by:</strong> ${rating.raterName} (${rating.raterType})<br>`;
        raterInfo.innerHTML += `<strong>Date:</strong> ${DateUtils.formatDateCompact(new Date(rating.timestamp))}`;
        raterInfo.style.marginBottom = '15px';
        ratingDisplay.appendChild(raterInfo);
        
        // Create ratings table
        const table = UIUtils.createRatingTable(rating);
        ratingDisplay.appendChild(table);
        
        // Add comments if any
        if (rating.comments) {
            const commentsSection = document.createElement('div');
            commentsSection.style.marginTop = '15px';
            
            const commentsHeader = document.createElement('strong');
            commentsHeader.textContent = 'Comments:';
            commentsSection.appendChild(commentsHeader);
            
            const commentsText = document.createElement('p');
            commentsText.textContent = rating.comments;
            commentsText.style.marginTop = '5px';
            commentsText.style.padding = '10px';
            commentsText.style.backgroundColor = 'white';
            commentsText.style.border = '1px solid #ddd';
            commentsText.style.borderRadius = '3px';
            commentsSection.appendChild(commentsText);
            
            ratingDisplay.appendChild(commentsSection);
        }
        
        // Insert rating display after review period display
        domElements.reviewPeriodDisplay.parentNode.insertBefore(ratingDisplay, domElements.reviewPeriodDisplay.nextSibling);
    }

    // Handle rating form submission
    static async handleRatingSubmission(formData) {
        // Validate all ratings are selected
        const requiredRatings = ['discipline', 'ethics', 'knowledge', 'communication', 'teamwork'];
        const ratings = {};
        let hasError = false;

        requiredRatings.forEach(rating => {
            const value = formData.get(rating);
            if (!value) {
                hasError = true;
            } else {
                ratings[rating] = parseInt(value);
            }
        });

        if (hasError) {
            UIUtils.showError(domElements.ratingError, 'Please rate all categories');
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
