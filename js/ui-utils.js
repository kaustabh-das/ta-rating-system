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
        }
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
        dropdownContainer.style.position = 'relative';
        
        const dropdownButton = document.createElement('button');
        dropdownButton.type = 'button';
        dropdownButton.className = 'secondary-btn compact-btn';
        dropdownButton.textContent = placeholder + ' ▼';
        
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.style.position = 'absolute';
        dropdownMenu.style.top = '100%';
        dropdownMenu.style.left = '0';
        dropdownMenu.style.backgroundColor = 'white';
        dropdownMenu.style.border = '1px solid #ccc';
        dropdownMenu.style.borderRadius = '6px';
        dropdownMenu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        dropdownMenu.style.zIndex = '1050';
        dropdownMenu.style.minWidth = '200px';
        dropdownMenu.style.maxHeight = '300px';
        dropdownMenu.style.overflowY = 'auto';
        dropdownMenu.style.display = 'none';
        
        // Populate dropdown menu
        options.forEach((option, index) => {
            const menuItem = document.createElement('div');
            menuItem.style.padding = '8px 12px';
            menuItem.style.cursor = 'pointer';
            menuItem.style.fontSize = '13px';
            menuItem.style.color = '#495057';
            menuItem.style.borderBottom = index < options.length - 1 ? '1px solid #f8f9fa' : 'none';
            menuItem.style.transition = 'background-color 0.2s ease';
            menuItem.textContent = option.text;
            
            menuItem.addEventListener('mouseenter', function() {
                this.style.backgroundColor = '#f8f9fa';
                this.style.color = '#007bff';
            });
            
            menuItem.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'white';
                this.style.color = '#495057';
            });
            
            menuItem.addEventListener('click', function() {
                dropdownButton.textContent = option.text + ' ▼';
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
}
