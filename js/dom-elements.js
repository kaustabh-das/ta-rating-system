// DOM Elements Manager
class DOMElements {
    constructor() {
        this.initializeElements();
    }

    initializeElements() {
        // Login elements
        this.loginForm = document.getElementById('loginForm');
        this.phoneInput = document.getElementById('phoneNumber');
        this.passwordInput = document.getElementById('password');
        this.phoneError = document.getElementById('phoneError');
        this.passwordError = document.getElementById('passwordError');
        this.loginError = document.getElementById('loginError');

        // Container elements
        this.loginContainer = document.getElementById('loginContainer');
        this.taSelectionContainer = document.getElementById('taSelectionContainer');
        this.ratingContainer = document.getElementById('ratingContainer');
        this.confirmationContainer = document.getElementById('confirmationContainer');
        this.reviewManagementContainer = document.getElementById('reviewManagementContainer');
        this.dateRangeModal = document.getElementById('dateRangeModal');

        // Header elements
        this.mainHeader = document.getElementById('mainHeader');
        this.globalUserName = document.getElementById('globalUserName');
        this.globalUserRole = document.getElementById('globalUserRole');
        this.globalLogoutBtn = document.getElementById('globalLogoutBtn');
        this.navBreadcrumb = document.getElementById('navBreadcrumb');

        // User display elements (legacy - keeping for compatibility)
        this.userDisplayName = document.getElementById('userDisplayName');
        this.userDisplayName2 = document.getElementById('userDisplayName2');
        this.userDisplayName3 = document.getElementById('userDisplayName3');
        this.userDisplayName4 = document.getElementById('userDisplayName4');

        // TA selection elements
        this.taSelect = document.getElementById('taSelect');
        this.taSelectError = document.getElementById('taSelectError');
        this.proceedToRatingBtn = document.getElementById('proceedToRatingBtn');
        this.selectedTANameDisplay = document.getElementById('selectedTAName');

        // Rating form elements
        this.ratingForm = document.getElementById('ratingForm');
        this.ratingError = document.getElementById('ratingError');

        // Navigation buttons
        this.logoutButton = document.getElementById('logoutButton');
        this.logoutButton2 = document.getElementById('logoutButton2');
        this.logoutButton3 = document.getElementById('logoutButton3');
        this.globalLogoutBtn = document.getElementById('globalLogoutBtn');
        this.backToSelectionBtn = document.getElementById('backToSelectionBtn');
        this.rateAnotherBtn = document.getElementById('rateAnotherBtn');

        // Loading overlay
        this.loadingOverlay = document.getElementById('loadingOverlay');

        // Date range elements
        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');
        this.dateRangeError = document.getElementById('dateRangeError');
        this.addReviewBtn = document.getElementById('addReviewBtn');
        this.proceedWithDatesBtn = document.getElementById('proceedWithDatesBtn');
        this.existingReviewsList = document.getElementById('existingReviewsList');
        this.reviewManagementTAName = document.getElementById('reviewManagementTAName');
        this.reviewPeriodDisplay = document.getElementById('reviewPeriodDisplay');
    }

    // Utility methods for common DOM operations
    hideAllContainers() {
        this.loginContainer.style.display = 'none';
        this.taSelectionContainer.style.display = 'none';
        this.ratingContainer.style.display = 'none';
        this.confirmationContainer.style.display = 'none';
        this.reviewManagementContainer.style.display = 'none';
        if (this.dateRangeModal) this.dateRangeModal.style.display = 'none';
    }

    resetErrors() {
        this.phoneError.style.display = 'none';
        this.passwordError.style.display = 'none';
        this.loginError.style.display = 'none';
        this.taSelectError.style.display = 'none';
        this.ratingError.style.display = 'none';
        this.dateRangeError.style.display = 'none';
    }

    updateUserDisplays(userInfo) {
        // Update legacy user displays (keeping for compatibility)
        const elements = [
            this.userDisplayName,
            this.userDisplayName2,
            this.userDisplayName3,
            this.userDisplayName4
        ];

        elements.forEach(element => {
            if (element) element.textContent = userInfo;
        });

        // Update modern header user info
        if (this.globalUserName) {
            this.globalUserName.textContent = userInfo.name || userInfo;
        }
        if (this.globalUserRole) {
            this.globalUserRole.textContent = userInfo.role || 'User';
        }
    }

    showHeader() {
        if (this.mainHeader) {
            this.mainHeader.style.display = 'block';
        }
    }

    hideHeader() {
        if (this.mainHeader) {
            this.mainHeader.style.display = 'none';
        }
    }

    updateBreadcrumb(text) {
        if (this.navBreadcrumb) {
            this.navBreadcrumb.innerHTML = `<span class="breadcrumb-item active">${text}</span>`;
        }
    }

    showError(element, message) {
        if (element) {
            const errorText = element.querySelector('.error-text');
            if (errorText) {
                errorText.textContent = message;
            } else {
                element.textContent = message;
            }
            element.classList.add('show');
            element.style.display = 'flex';
        }
    }

    hideError(element) {
        if (element) {
            element.classList.remove('show');
            element.style.display = 'none';
        }
    }

    setBodyStyle(className = '', styles = {}) {
        document.body.className = className;
        Object.assign(document.body.style, styles);
    }
}

// Global DOM elements instance
export const domElements = new DOMElements();

// For backward compatibility (can be removed later)
window.domElements = domElements;
