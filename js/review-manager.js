// Review Management Module
class ReviewManager {
    // Display existing reviews
    static displayExistingReviews() {
        const reviewsList = domElements.existingReviewsList;
        
        // Clear existing content
        reviewsList.innerHTML = '';
        
        if (appState.existingReviewPeriods.length === 0) {
            // No reviews - center the Add Review button
            reviewsList.innerHTML = '<p>No reviews found for this TA.</p>';
            domElements.addReviewBtn.textContent = '+ Add First Review';
            domElements.addReviewBtn.style.margin = '20px auto';
            domElements.addReviewBtn.style.display = 'block';
        } else {
            // Show existing reviews
            appState.existingReviewPeriods.forEach(period => {
                const reviewItem = ReviewManager.createReviewItem(period);
                reviewsList.appendChild(reviewItem);
            });
            
            // Add button at top-right
            domElements.addReviewBtn.textContent = '+ Add Review';
            domElements.addReviewBtn.style.margin = '0';
            domElements.addReviewBtn.style.float = 'right';
            domElements.addReviewBtn.style.marginBottom = '20px';
        }
    }

    // Create a review item element
    static createReviewItem(period) {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.style.display = 'flex';
        reviewItem.style.justifyContent = 'space-between';
        reviewItem.style.alignItems = 'center';
        reviewItem.style.padding = '10px';
        reviewItem.style.margin = '10px 0';
        reviewItem.style.border = '1px solid #ddd';
        reviewItem.style.borderRadius = '5px';
        reviewItem.style.backgroundColor = '#f9f9f9';
        
        reviewItem.innerHTML = `
            <div>
                <div class="review-period" style="font-weight: bold;">${period.startDate} - ${period.endDate}</div>
                <div class="review-info" style="color: #666; font-size: 0.9em;">${period.raterType} | ${DateUtils.formatDateCompact(new Date(period.timestamp))}</div>
            </div>
            <button onclick="ReviewManager.viewReviewDetails('${period.periodId || period.timestamp}')" class="btn-secondary compact-btn" style="padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">View</button>
        `;
        
        return reviewItem;
    }

    // View review details
    static viewReviewDetails(periodId) {
        // This function can be enhanced later to show detailed review information
        console.log('Viewing details for period:', periodId);
        // For now, just alert the user
        alert('Review details viewing will be implemented in the next update.');
    }
}
