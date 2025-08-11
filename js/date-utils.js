// Date Utility Functions
class DateUtils {
    // Parse DD/MM/YYYY or DD/MM/YY format
    static parseDate(dateString) {
        const parts = dateString.split('/');
        let year = parseInt(parts[2]);
        
        // Handle YY format by converting to YYYY
        if (year < 100) {
            year += year < 50 ? 2000 : 1900; // Assume years 00-49 are 20xx, 50-99 are 19xx
        }
        
        return new Date(year, parts[1] - 1, parts[0]);
    }

    // Format for HTML date input (YYYY-MM-DD)
    static formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    // Format as DD/MM/YYYY
    static formatDateForDisplay(date) {
        return date.toLocaleDateString(CONFIG.DATE_FORMAT);
    }

    // Format as DD/MM/YY (compact format)
    static formatDateCompact(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    // Parse and format date string to compact format
    static formatDateStringCompact(dateString) {
        if (!dateString) return '';
        
        let date;
        
        // Convert to string if it's not already
        const dateStr = String(dateString).trim();
        
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Handle YYYY-MM-DD format from HTML date input
            date = new Date(dateStr);
        } else if (dateStr.includes('/')) {
            // Handle DD/MM/YYYY or DD/MM/YY format
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                // Always assume DD/MM/YYYY or DD/MM/YY format
                let year = parseInt(parts[2]);
                
                // Handle YY format by converting to YYYY
                if (year < 100) {
                    year += year < 50 ? 2000 : 1900;
                }
                
                date = new Date(year, parts[1] - 1, parts[0]);
            }
        } else if (dateStr.includes('T') || dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
            // Handle ISO timestamp format (2025-03-02T18:30:00.000Z) or YYYY-MM-DD format
            date = new Date(dateStr);
        } else if (dateStr.match(/^\d+$/)) {
            // Handle Unix timestamp
            date = new Date(parseInt(dateStr));
        } else if (dateStr.includes('-') && dateStr.length >= 8) {
            // Handle various dash-separated formats
            date = new Date(dateStr);
        } else {
            // Try parsing as-is
            date = new Date(dateStr);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date format:', dateString);
            return dateString; // Return original if can't parse
        }
        
        return DateUtils.formatDateCompact(date);
    }

    // Set date constraints for inputs
    static setDateConstraints() {
        const today = new Date();
        const maxDate = DateUtils.formatDateForInput(today);
        
        // Set max date as today for both inputs
        domElements.startDateInput.max = maxDate;
        domElements.endDateInput.max = maxDate;
        
        if (appState.existingReviewPeriods.length > 0) {
            // Find the latest end date
            const latestEndDate = appState.existingReviewPeriods.reduce((latest, period) => {
                const periodEndDate = DateUtils.parseDate(period.endDate);
                return periodEndDate > latest ? periodEndDate : latest;
            }, new Date(0));
            
            // Start date must be after latest end date
            const minStartDate = new Date(latestEndDate);
            minStartDate.setDate(minStartDate.getDate() + 1);
            domElements.startDateInput.min = DateUtils.formatDateForInput(minStartDate);
        } else {
            // No existing reviews, can start from any past date
            domElements.startDateInput.min = CONFIG.MINIMUM_DATE;
        }
    }

    // Validate date range
    static validateDateRange() {
        const startDate = new Date(domElements.startDateInput.value);
        const endDate = new Date(domElements.endDateInput.value);
        
        UIUtils.hideError(domElements.dateRangeError);
        
        if (!domElements.startDateInput.value || !domElements.endDateInput.value) {
            return false;
        }
        
        // Check if end date is after start date
        if (endDate <= startDate) {
            UIUtils.showDateError('End date must be after start date');
            return false;
        }
        
        // Check minimum period (exactly 90 days)
        const daysDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (daysDifference < CONFIG.MINIMUM_REVIEW_PERIOD_DAYS) {
            UIUtils.showDateError(`Review period must be at least ${CONFIG.MINIMUM_REVIEW_PERIOD_DAYS} days`);
            return false;
        }
        
        // Check for overlaps with existing periods
        const hasOverlap = appState.existingReviewPeriods.some(period => {
            const periodStart = DateUtils.parseDate(period.startDate);
            const periodEnd = DateUtils.parseDate(period.endDate);
            
            return (startDate <= periodEnd && endDate >= periodStart);
        });
        
        if (hasOverlap) {
            UIUtils.showDateError('Date range overlaps with existing review period');
            return false;
        }
        
        return true;
    }

    // Setup date input event handlers
    static setupDateInputHandlers() {
        domElements.startDateInput.addEventListener('change', function() {
            if (domElements.startDateInput.value) {
                // Set minimum end date to start date + minimum period
                const startDate = new Date(domElements.startDateInput.value);
                const minEndDate = new Date(startDate);
                minEndDate.setDate(minEndDate.getDate() + CONFIG.MINIMUM_REVIEW_PERIOD_DAYS);
                domElements.endDateInput.min = DateUtils.formatDateForInput(minEndDate);
            }
            
            if (domElements.startDateInput.value && domElements.endDateInput.value) {
                domElements.proceedWithDatesBtn.disabled = !DateUtils.validateDateRange();
            }
        });

        domElements.endDateInput.addEventListener('change', function() {
            if (domElements.startDateInput.value && domElements.endDateInput.value) {
                domElements.proceedWithDatesBtn.disabled = !DateUtils.validateDateRange();
            }
        });
    }
}

// Export the DateUtils class
export { DateUtils };

// For backward compatibility (can be removed later)
window.DateUtils = DateUtils;
