// Loading and UI Utilities
class UIUtils {
    // Loading overlay functions
    static showLoading(message = 'Loading data...') {
        const messageElement = domElements.loadingOverlay.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
        domElements.loadingOverlay.classList.add('active');
    }

    static hideLoading() {
        domElements.loadingOverlay.classList.remove('active');
    }

    // Error display functions
    static showError(errorElement, message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    static hideError(errorElement) {
        errorElement.style.display = 'none';
    }

    static showDateError(message) {
        UIUtils.showError(domElements.dateRangeError, message);
    }

    // Form utilities
    static resetForm(form) {
        if (form) {
            form.reset();
            // Also clear any error highlighting when form is reset
            UIUtils.clearFormErrorHighlighting(form);
        }
    }

    // Clear error highlighting from a specific form
    static clearFormErrorHighlighting(form) {
        if (!form) return;
        
        // Remove error class from all rating groups within this form
        form.querySelectorAll('.rating-group.error').forEach(group => {
            group.classList.remove('error');
        });
        
        // Remove error class from form groups (comments) within this form
        form.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
        });
    }

    static validateRequiredFields(fields) {
        let hasError = false;
        
        fields.forEach(field => {
            if (!field.value.trim()) {
                UIUtils.showError(field.errorElement, field.message || 'This field is required');
                hasError = true;
            } else {
                UIUtils.hideError(field.errorElement);
            }
        });

        return !hasError;
    }

    // Body style utilities
    static setCenteredBodyStyle() {
        domElements.setBodyStyle('centered', {
            display: 'flex',
            height: '100vh',
            alignItems: 'center',
            justifyContent: 'center'
        });
    }

    static setScrollableBodyStyle() {
        domElements.setBodyStyle('', {
            display: 'block',
            height: 'auto',
            minHeight: '100vh',
            overflow: 'auto'
        });
    }

    // Create star rating display
    static createStarRating(rating, maxRating = 5) {
        let starsHtml = '';
        for (let i = 1; i <= maxRating; i++) {
            if (i <= rating) {
                starsHtml += '<span style="color: #ffc107;">★</span>';
            } else {
                starsHtml += '<span style="color: #e9ecef;">★</span>';
            }
        }
        starsHtml += ` (${rating}/${maxRating})`;
        return starsHtml;
    }

    // Create table for ratings display
    static createRatingTable(ratings, categories = RATING_CATEGORIES) {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginBottom = '15px';
        
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const categoryHeader = document.createElement('th');
        categoryHeader.textContent = 'Category';
        categoryHeader.style.border = '1px solid #ddd';
        categoryHeader.style.padding = '10px';
        categoryHeader.style.backgroundColor = '#e9ecef';
        categoryHeader.style.textAlign = 'left';
        
        const ratingHeader = document.createElement('th');
        ratingHeader.textContent = 'Rating';
        ratingHeader.style.border = '1px solid #ddd';
        ratingHeader.style.padding = '10px';
        ratingHeader.style.backgroundColor = '#e9ecef';
        ratingHeader.style.textAlign = 'center';
        
        headerRow.appendChild(categoryHeader);
        headerRow.appendChild(ratingHeader);
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        
        categories.forEach(category => {
            const row = document.createElement('tr');
            
            const categoryCell = document.createElement('td');
            categoryCell.textContent = category.label;
            categoryCell.style.border = '1px solid #ddd';
            categoryCell.style.padding = '10px';
            
            const ratingCell = document.createElement('td');
            const ratingValue = ratings[category.key] || 0;
            ratingCell.style.border = '1px solid #ddd';
            ratingCell.style.padding = '10px';
            ratingCell.style.textAlign = 'center';
            ratingCell.innerHTML = UIUtils.createStarRating(ratingValue);
            
            row.appendChild(categoryCell);
            row.appendChild(ratingCell);
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        return table;
    }

    // Dropdown utilities
    static createDropdown(options, onSelect, placeholder = 'Select...') {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-container';
        
        const dropdownButton = document.createElement('button');
        dropdownButton.type = 'button';
        dropdownButton.className = 'dropdown-btn';
        dropdownButton.textContent = placeholder; // Remove automatic ▼ addition
        
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.style.display = 'none';
        
        // Populate dropdown menu
        options.forEach((option, index) => {
            const menuItem = document.createElement('div');
            menuItem.className = 'dropdown-item';
            menuItem.textContent = option.text;
            
            menuItem.addEventListener('click', function() {
                // Check if the placeholder already had an arrow and preserve it
                const hasArrow = placeholder.includes('▼');
                dropdownButton.textContent = hasArrow ? option.text + ' ▼' : option.text;
                dropdownMenu.style.display = 'none';
                onSelect(option);
            });
            
            dropdownMenu.appendChild(menuItem);
        });
        
        // Dropdown toggle functionality
        dropdownButton.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = dropdownMenu.style.display === 'block';
            dropdownMenu.style.display = isVisible ? 'none' : 'block';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            dropdownMenu.style.display = 'none';
        });
        
        dropdownContainer.appendChild(dropdownButton);
        dropdownContainer.appendChild(dropdownMenu);
        
        return { container: dropdownContainer, button: dropdownButton, menu: dropdownMenu };
    }

    // Create modern card-based rating display
    static createModernRatingDisplay(ratings, raterInfo, categories = RATING_CATEGORIES, comments = null) {
        const container = document.createElement('div');
        container.className = 'rating-details-modern';
        
        // Create two-column layout container
        const twoColumnContainer = document.createElement('div');
        twoColumnContainer.className = 'rating-details-two-column';
        
        // Left container - Rating info header
        const leftContainer = document.createElement('div');
        leftContainer.className = 'rating-info-container';
        
        const infoHeader = document.createElement('div');
        infoHeader.className = 'rating-info-header';
        
        const raterRow = document.createElement('div');
        raterRow.className = 'info-row';
        const raterLabel = document.createElement('span');
        raterLabel.className = 'info-label';
        raterLabel.textContent = 'RATED BY:';
        const raterValue = document.createElement('span');
        raterValue.className = 'info-value';
        raterValue.textContent = `${raterInfo.name}`;
        const raterType = document.createElement('span');
        raterType.className = 'info-subvalue';
        raterType.textContent = `(${raterInfo.type})`;
        raterRow.appendChild(raterLabel);
        raterRow.appendChild(raterValue);
        raterRow.appendChild(raterType);
        
        const dateRow = document.createElement('div');
        dateRow.className = 'info-row';
        const dateLabel = document.createElement('span');
        dateLabel.className = 'info-label';
        dateLabel.textContent = 'DATE:';
        const dateValue = document.createElement('span');
        dateValue.className = 'info-value';
        dateValue.textContent = raterInfo.date;
        dateRow.appendChild(dateLabel);
        dateRow.appendChild(dateValue);
        
        infoHeader.appendChild(raterRow);
        infoHeader.appendChild(dateRow);
        leftContainer.appendChild(infoHeader);
        
        // Right container - Rating categories (individual cards)
        const rightContainer = document.createElement('div');
        rightContainer.className = 'rating-categories-container';
        
        categories.forEach(category => {
            // Create individual card for each category
            const categoryCard = document.createElement('div');
            categoryCard.className = 'rating-category-card';
            
            const categoryName = document.createElement('div');
            categoryName.className = 'category-name';
            categoryName.setAttribute('data-category', category.key);
            categoryName.textContent = category.label;
            
            const categoryRating = document.createElement('div');
            categoryRating.className = 'category-rating';
            
            const ratingValue = ratings[category.key] || 0;
            
            // Create stars
            const starsContainer = document.createElement('div');
            starsContainer.className = 'rating-stars';
            
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                star.className = i <= ratingValue ? 'fas fa-star rating-star' : 'fas fa-star rating-star empty';
                starsContainer.appendChild(star);
            }
            
            // Rating value
            const valueSpan = document.createElement('span');
            valueSpan.className = 'rating-value';
            valueSpan.textContent = `(${ratingValue}/5)`;
            
            categoryRating.appendChild(starsContainer);
            categoryRating.appendChild(valueSpan);
            
            categoryCard.appendChild(categoryName);
            categoryCard.appendChild(categoryRating);
            rightContainer.appendChild(categoryCard);
        });
        
        // Add comments section to the rightContainer if comments exist
        if (comments && comments.trim() !== '') {
            const commentsSection = document.createElement('div');
            commentsSection.className = 'rating-comments-section';
            
            const commentsHeader = document.createElement('div');
            commentsHeader.className = 'comments-header';
            commentsHeader.innerHTML = '<i class="fas fa-comment-alt"></i> Additional Comments';
            
            const commentsText = document.createElement('div');
            commentsText.className = 'comments-text';
            commentsText.textContent = comments;
            
            commentsSection.appendChild(commentsHeader);
            commentsSection.appendChild(commentsText);
            rightContainer.appendChild(commentsSection);
        }
        
        // Assemble the two-column layout
        twoColumnContainer.appendChild(leftContainer);
        twoColumnContainer.appendChild(rightContainer);
        container.appendChild(twoColumnContainer);
        
        return container;
    }

    // Create modern comments section
    static createModernCommentsSection(comments) {
        if (!comments || comments.trim() === '') {
            return null;
        }
        
        const commentsSection = document.createElement('div');
        commentsSection.className = 'rating-comments-section';
        
        const commentsHeader = document.createElement('div');
        commentsHeader.className = 'comments-header';
        commentsHeader.innerHTML = '<i class="fas fa-comment-alt"></i> Additional Comments';
        
        const commentsText = document.createElement('div');
        commentsText.className = 'comments-text';
        commentsText.textContent = comments;
        
        commentsSection.appendChild(commentsHeader);
        commentsSection.appendChild(commentsText);
        
        return commentsSection;
    }
}

// Export the UIUtils class
export { UIUtils };

// For backward compatibility (can be removed later)
window.UIUtils = UIUtils;
