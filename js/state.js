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
        
        // Application state
        this.dataLoaded = false;
    }

    // User state methods
    setCurrentUser(phone, name, type) {
        this.currentUserPhone = phone;
        this.currentUserName = name;
        this.currentUserType = type;
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
    }

    getSelectedTA() {
        return {
            id: this.selectedTAId,
            name: this.selectedTAName
        };
    }

    // Date range methods
    setDateRange(startDate, endDate) {
        this.selectedStartDate = startDate;
        this.selectedEndDate = endDate;
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
    }
}

// Global state instance
const appState = new AppState();
