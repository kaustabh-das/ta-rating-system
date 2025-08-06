// Officer Rating Management Module
class OfficerRatingManager {
    // Initialize officer rating screen with both mentor and officer sections
    static async initializeOfficerRatingScreen() {
        try {
            // Start loading immediately
            UIUtils.showLoading('Loading rating data...');
            
            // Show the officer sections but keep them hidden initially
            const mentorSection = document.getElementById('mentorRatingsSection');
            const officerSection = document.getElementById('officerRatingsSection');
            
            // Hide the regular rating form and review period display
            domElements.ratingForm.style.display = 'none';
            domElements.reviewPeriodDisplay.style.display = 'none';
            
            // Fetch both mentor and officer data in parallel
            const [mentorResult, officerResult] = await Promise.allSettled([
                OfficerRatingManager.setupMentorRatingsSection(),
                OfficerRatingManager.setupOfficerRatingsSection()
            ]);
            
            // Show the sections only after data is loaded
            if (mentorSection) mentorSection.style.display = 'block';
            if (officerSection) officerSection.style.display = 'block';
            
            // Hide loading after everything is complete
            UIUtils.hideLoading();
            
            // Log any errors that occurred during setup
            if (mentorResult.status === 'rejected') {
                console.error('Error setting up mentor section:', mentorResult.reason);
            }
            if (officerResult.status === 'rejected') {
                console.error('Error setting up officer section:', officerResult.reason);
            }
            
        } catch (error) {
            console.error('Error initializing officer rating screen:', error);
            UIUtils.hideLoading();
            UIUtils.showError(document.body, 'Failed to load rating data');
        }
    }
    
    // Setup mentor ratings section
    static async setupMentorRatingsSection() {
        try {
            // Fetch mentor review periods
            const mentorPeriods = await OfficerRatingManager.fetchReviewPeriods('mentor');
            
            // Create controls for mentor section (view-only, no add button)
            const mentorControlsContainer = document.getElementById('mentorRatingControls');
            if (mentorControlsContainer) {
                mentorControlsContainer.innerHTML = '';
                const controls = OfficerRatingManager.createViewOnlyControls(
                    mentorPeriods, 
                    'mentor',
                    'mentorRatingDisplay'
                );
                mentorControlsContainer.appendChild(controls);
            }
            
            // Display the most recent mentor rating if available
            const mentorDisplay = document.getElementById('mentorRatingDisplay');
            if (mentorPeriods.length > 0 && mentorDisplay) {
                await OfficerRatingManager.displayRatingForSection(mentorPeriods[0], 'mentor', 'mentorRatingDisplay', false);
            } else if (mentorDisplay) {
                mentorDisplay.innerHTML = '<p style="color: #666; font-style: italic;">No mentor ratings found for this TA</p>';
            }
            
        } catch (error) {
            console.error('Error setting up mentor ratings section:', error);
        }
    }
    
    // Setup officer ratings section
    static async setupOfficerRatingsSection() {
        try {
            // Fetch officer review periods
            const officerPeriods = await OfficerRatingManager.fetchReviewPeriods('officer');
            
            // Create controls for officer section
            const officerControlsContainer = document.getElementById('officerRatingControls');
            if (officerControlsContainer) {
                officerControlsContainer.innerHTML = '';
                const controls = OfficerRatingManager.createSectionControls(
                    officerPeriods, 
                    'officer',
                    'officerRatingDisplay'
                );
                officerControlsContainer.appendChild(controls);
            }
            
            // Display the most recent officer rating if available
            const officerDisplay = document.getElementById('officerRatingDisplay');
            if (officerPeriods.length > 0 && officerDisplay) {
                await OfficerRatingManager.displayRatingForSection(officerPeriods[0], 'officer', 'officerRatingDisplay', false);
            } else if (officerDisplay) {
                officerDisplay.innerHTML = '<p style="color: #666; font-style: italic;">No officer ratings found for this TA</p>';
            }
            
        } catch (error) {
            console.error('Error setting up officer ratings section:', error);
        }
    }
    
    // Fetch review periods for a specific user type
    static async fetchReviewPeriods(userType) {
        try {
            const response = await fetch(`${CONFIG.apiUrl}?action=getReviewPeriods&taId=${appState.selectedTAId}&raterType=${userType}`);
            if (!response.ok) {
                throw new Error('Failed to fetch review periods');
            }
            
            const data = await response.json();
            
            // Normalize date formats for all periods
            const normalizedPeriods = (data.periods || []).map(period => ({
                ...period,
                startDate: DateUtils.formatDateStringCompact(period.startDate),
                endDate: DateUtils.formatDateStringCompact(period.endDate)
            }));
            
            return normalizedPeriods;
            
        } catch (error) {
            console.error(`Error fetching ${userType} review periods:`, error);
            return [];
        }
    }
    
    // Create controls (dropdown + add button) for a section
    static createSectionControls(periods, userType, displayElementId) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'rating-controls';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';
        
        // Create dropdown for existing periods
        if (periods.length > 0) {
            const dropdownOptions = periods.map(period => ({
                text: `${period.startDate} - ${period.endDate}`,
                value: period
            }));
            
            const dropdown = UIUtils.createDropdown(
                dropdownOptions,
                (option) => OfficerRatingManager.displayRatingForSection(option.value, userType, displayElementId),
                `${dropdownOptions[0].text} ▼`
            );
            
            dropdown.container.style.maxWidth = '250px';
            dropdown.container.style.flexShrink = '1';
            controlsContainer.appendChild(dropdown.container);
        }
        
        // Create Add New Rating button
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'compact-btn';
        addButton.textContent = '+ Add New Rating';
        addButton.style.whiteSpace = 'nowrap';
        
        addButton.addEventListener('click', () => {
            // Officers only add ratings as officers, no need to change user type
            ScreenManager.showDateRangeModal();
        });
        
        controlsContainer.appendChild(addButton);
        
        return controlsContainer;
    }
    
    // Create view-only controls (dropdown only, no add button) for mentor section
    static createViewOnlyControls(periods, userType, displayElementId) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'rating-controls';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.alignItems = 'center';
        controlsContainer.style.gap = '10px';
        
        // Create dropdown for existing periods
        if (periods.length > 0) {
            const dropdownOptions = periods.map(period => ({
                text: `${period.startDate} - ${period.endDate}`,
                value: period
            }));
            
            const dropdown = UIUtils.createDropdown(
                dropdownOptions,
                (option) => OfficerRatingManager.displayRatingForSection(option.value, userType, displayElementId),
                `${dropdownOptions[0].text} ▼`
            );
            
            dropdown.container.style.maxWidth = '250px';
            dropdown.container.style.flexShrink = '1';
            controlsContainer.appendChild(dropdown.container);
        } else {
            // If no periods, show a message
            const noDataMessage = document.createElement('span');
            noDataMessage.textContent = 'No mentor ratings available';
            noDataMessage.style.color = '#666';
            noDataMessage.style.fontStyle = 'italic';
            controlsContainer.appendChild(noDataMessage);
        }
        
        return controlsContainer;
    }
    
    // Display rating for a specific section
    static async displayRatingForSection(period, userType, displayElementId, showLoading = true) {
        try {
            const displayElement = document.getElementById(displayElementId);
            if (!displayElement) return;
            
            if (showLoading) {
                UIUtils.showLoading('Loading rating data...');
            }
            
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
                rating.raterType === userType &&
                rating.startDate === period.startDate &&
                rating.endDate === period.endDate
            );
            
            if (periodRating) {
                // Display existing rating data
                displayElement.innerHTML = OfficerRatingManager.createRatingDisplayHTML(periodRating);
            } else {
                // No rating found for this period
                displayElement.innerHTML = `
                    <div style="padding: 15px; text-align: center; color: #666; font-style: italic;">
                        No rating found for period: ${period.startDate} - ${period.endDate}
                    </div>
                `;
            }
            
            if (showLoading) {
                UIUtils.hideLoading();
            }
            
        } catch (error) {
            console.error('Error loading rating data:', error);
            if (showLoading) {
                UIUtils.hideLoading();
            }
            
            const displayElement = document.getElementById(displayElementId);
            if (displayElement) {
                displayElement.innerHTML = `
                    <div style="padding: 15px; text-align: center; color: #dc3545;">
                        Error loading rating data for period: ${period.startDate} - ${period.endDate}
                    </div>
                `;
            }
        }
    }
    
    // Create HTML for displaying rating data
    static createRatingDisplayHTML(rating) {
        const ratingDate = DateUtils.formatDateCompact(new Date(rating.timestamp));
        
        const categories = [
            { key: 'discipline', label: 'Discipline' },
            { key: 'ethics', label: 'Ethics' },
            { key: 'knowledge', label: 'Knowledge' },
            { key: 'communication', label: 'Communication' },
            { key: 'teamwork', label: 'Teamwork' }
        ];
        
        let html = `
            <div style="margin-bottom: 15px;">
                <p><strong>Rated by:</strong> ${rating.raterName} (${rating.raterType})</p>
                <p><strong>Date:</strong> ${ratingDate}</p>
                <p><strong>Period:</strong> ${rating.startDate} - ${rating.endDate}</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 10px; background-color: #e9ecef; text-align: left;">Category</th>
                        <th style="border: 1px solid #ddd; padding: 10px; background-color: #e9ecef; text-align: center;">Rating</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        categories.forEach(category => {
            const ratingValue = rating[category.key] || 0;
            const stars = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
            
            html += `
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${category.label}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
                        <span style="color: #ffc107; font-size: 1.1em;">${stars}</span>
                        <span style="margin-left: 5px; color: #666;">(${ratingValue}/5)</span>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        if (rating.comments) {
            html += `
                <div style="margin-top: 15px;">
                    <strong>Comments:</strong>
                    <p style="margin-top: 5px; padding: 10px; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 3px;">
                        ${rating.comments}
                    </p>
                </div>
            `;
        }
        
        return html;
    }
    
    // Reset sections when switching TAs
    static resetSections() {
        const mentorSection = document.getElementById('mentorRatingsSection');
        const officerSection = document.getElementById('officerRatingsSection');
        
        if (mentorSection) mentorSection.style.display = 'none';
        if (officerSection) officerSection.style.display = 'none';
        
        // Clear section contents
        const mentorControls = document.getElementById('mentorRatingControls');
        const mentorDisplay = document.getElementById('mentorRatingDisplay');
        const officerControls = document.getElementById('officerRatingControls');
        const officerDisplay = document.getElementById('officerRatingDisplay');
        
        if (mentorControls) mentorControls.innerHTML = '';
        if (mentorDisplay) mentorDisplay.innerHTML = '';
        if (officerControls) officerControls.innerHTML = '';
        if (officerDisplay) officerDisplay.innerHTML = '';
    }
}
