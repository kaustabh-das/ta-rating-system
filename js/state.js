// State Management Module
class AppState {
    constructor() {
        // User state
        this.users = [];
        this.taList = [];
        this.currentUserType = '';
        this.currentUserPhone = '';
        this.currentUserName = '';
        
        // Selected TA state
        this.selectedTAId = '';
        this.selectedTAName = '';
        
        // Date range state
        this.selectedStartDate = '';
        this.selectedEndDate = '';
        this.existingReviewPeriods = [];
        this.currentDisplayedPeriod = null;  // Track currently displayed rating period
        
        // Officer interface - track displayed periods for each section
        this.currentMentorDisplayedPeriod = null;
        this.currentOfficerDisplayedPeriod = null;
        
        // Application state
        this.dataLoaded = false;
    }

    // User state methods
    setCurrentUser(phone, name, type) {
        this.currentUserPhone = phone;
        this.currentUserName = name;
        this.currentUserType = type;
        
        // Clear TA and rating data when switching users
        this.selectedTAId = '';
        this.selectedTAName = '';
        this.selectedStartDate = '';
        this.selectedEndDate = '';
        this.existingReviewPeriods = [];
        this.currentDisplayedPeriod = null;
        this.currentMentorDisplayedPeriod = null;
        this.currentOfficerDisplayedPeriod = null;
    }

    getCurrentUser() {
        return {
            phone: this.currentUserPhone,
            name: this.currentUserName,
            type: this.currentUserType
        };
    }

    // TA state methods
    setSelectedTA(id, name) {
        this.selectedTAId = id;
        this.selectedTAName = name;
        
        // Clear previous TA's rating data when switching TAs
        this.selectedStartDate = '';
        this.selectedEndDate = '';
        this.existingReviewPeriods = [];
        this.currentDisplayedPeriod = null;
        this.currentMentorDisplayedPeriod = null;
        this.currentOfficerDisplayedPeriod = null;
    }

    getSelectedTA() {
        return {
            id: this.selectedTAId,
            name: this.selectedTAName
        };
    }

    // Date range methods
    setDateRange(startDate, endDate) {
        // Ensure dates are properly formatted in DD/MM/YY format
        // Handle both YYYY-MM-DD (from HTML date inputs) and DD/MM/YYYY formats
        this.selectedStartDate = this.formatDateForStorage(startDate);
        this.selectedEndDate = this.formatDateForStorage(endDate);
    }

    // Helper method to format dates consistently
    formatDateForStorage(dateInput) {
        if (!dateInput) return '';
        
        let date;
        const dateStr = String(dateInput).trim();
        
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // YYYY-MM-DD format from HTML date input
            date = new Date(dateStr);
        } else if (dateStr.includes('/')) {
            // DD/MM/YYYY or DD/MM/YY format
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                let year = parseInt(parts[2]);
                if (year < 100) {
                    year += year < 50 ? 2000 : 1900;
                }
                date = new Date(year, parts[1] - 1, parts[0]);
            }
        } else {
            // Try parsing as-is
            date = new Date(dateStr);
        }
        
        if (date && !isNaN(date.getTime())) {
            // Format as DD/MM/YY
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}/${month}/${year}`;
        }
        
        return dateStr; // Return original if can't parse
    }

    getDateRange() {
        return {
            startDate: this.selectedStartDate,
            endDate: this.selectedEndDate
        };
    }

    // Session storage methods
    saveToSession() {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userPhone', this.currentUserPhone);
        sessionStorage.setItem('userType', this.currentUserType);
        sessionStorage.setItem('userName', this.currentUserName);
    }

    loadFromSession() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            this.currentUserPhone = sessionStorage.getItem('userPhone') || '';
            this.currentUserType = sessionStorage.getItem('userType') || '';
            this.currentUserName = sessionStorage.getItem('userName') || '';
        }
        return isLoggedIn;
    }

    clearSession() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userPhone');
        sessionStorage.removeItem('userType');
        sessionStorage.removeItem('userName');
    }

    // Reset methods
    reset() {
        this.selectedTAId = '';
        this.selectedTAName = '';
        this.selectedStartDate = '';
        this.selectedEndDate = '';
        this.existingReviewPeriods = [];
        this.currentDisplayedPeriod = null;
        this.currentMentorDisplayedPeriod = null;
        this.currentOfficerDisplayedPeriod = null;
    }

    // Method to clear currently displayed period
    clearDisplayedPeriod() {
        this.currentDisplayedPeriod = null;
        this.currentMentorDisplayedPeriod = null;
        this.currentOfficerDisplayedPeriod = null;
    }
    
    // Methods to track officer section displayed periods
    setMentorDisplayedPeriod(period) {
        this.currentMentorDisplayedPeriod = period;
    }
    
    setOfficerDisplayedPeriod(period) {
        this.currentOfficerDisplayedPeriod = period;
    }
    
    getCurrentDisplayedPeriodForSection(userType) {
        if (userType === 'mentor') {
            return this.currentMentorDisplayedPeriod;
        } else if (userType === 'officer') {
            return this.currentOfficerDisplayedPeriod;
        }
        return null;
    }
}

// Global state instance
export const appState = new AppState();

// For backward compatibility (can be removed later)
window.appState = appState;
