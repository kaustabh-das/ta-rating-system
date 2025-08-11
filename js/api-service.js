// API Service Module
class APIService {
    // Fetch users from Google Sheet
    static async fetchUsers() {
        try {
            UIUtils.showLoading('Loading user data...');
            
            const response = await fetch(`${CONFIG.apiUrl}?action=getUsers`);
            if (!response.ok) {
                throw new Error('Failed to fetch users data');
            }
            
            const data = await response.json();
            // Process the data to ensure consistent formatting
            appState.users = data.users.map(user => ({
                phoneNumber: String(user.phoneNumber).trim(),
                password: String(user.password).trim(),
                userType: String(user.userType || '').trim(),
                name: String(user.name || '').trim()
            }));
            console.log('Users data loaded successfully');
            appState.dataLoaded = true;
            
            UIUtils.hideLoading();
        } catch (error) {
            console.error('Error fetching users:', error);
            // Fallback to mock data if API fails
            appState.users = MOCK_DATA.users;
            appState.dataLoaded = true;
            
            UIUtils.hideLoading();
        }
    }

    // Fetch TAs list
    static async fetchTAList() {
        try {
            UIUtils.showLoading('Loading TA list...');
            
            const response = await fetch(`${CONFIG.apiUrl}?action=getTAs`);
            if (!response.ok) {
                throw new Error('Failed to fetch TAs data');
            }
            
            const data = await response.json();
            appState.taList = data.tas || [];
            console.log('TA list loaded successfully');
            
            UIUtils.hideLoading();
        } catch (error) {
            console.error('Error fetching TAs:', error);
            // Fallback to mock data if API fails
            appState.taList = MOCK_DATA.tas;
            
            UIUtils.hideLoading();
        }
    }

    // Fetch user data
    static async fetchUserData(phone) {
        try {
            UIUtils.showLoading('Loading user profile...');
            
            const response = await fetch(`${CONFIG.apiUrl}?action=getUserData&phone=${phone}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            
            const data = await response.json();
            if (data.user) {
                appState.currentUserType = data.user.userType || '';
                appState.currentUserName = data.user.name || '';
                
                // Store in session
                sessionStorage.setItem('userType', appState.currentUserType);
                sessionStorage.setItem('userName', appState.currentUserName);
                
                const userInfo = `${appState.currentUserName} (${appState.currentUserType})`;
                domElements.updateUserDisplays(userInfo);
            }
            
            UIUtils.hideLoading();
        } catch (error) {
            console.error('Error fetching user data:', error);
            UIUtils.hideLoading();
        }
    }

    // Fetch ratings for a specific TA
    static async fetchTARatings(taId) {
        try {
            UIUtils.showLoading('Loading TA ratings...');
            
            const response = await fetch(`${CONFIG.apiUrl}?action=getTARatings&taId=${taId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch TA ratings');
            }
            
            const data = await response.json();
            UIUtils.hideLoading();
            return data;
        } catch (error) {
            console.error('Error fetching TA ratings:', error);
            UIUtils.hideLoading();
            return { status: 'error', message: error.message, ratings: [] };
        }
    }

    // Submit rating to Google Sheet
    static async submitRating(ratingData) {
        try {
            UIUtils.showLoading('Submitting rating...');
            
            // Use GET request as primary method
            const params = new URLSearchParams();
            params.append('action', 'submitRating');
            
            // Add all rating data as URL parameters
            Object.keys(ratingData).forEach(key => {
                params.append(key, ratingData[key]);
            });
            
            const response = await fetch(`${CONFIG.apiUrl}?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            UIUtils.hideLoading();
            return result;
        } catch (error) {
            console.error('GET request failed:', error);
            UIUtils.hideLoading();
            
            // Provide more specific error messages
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                return { status: 'error', message: 'Network error. Please check your internet connection and try again.' };
            }
            
            return { status: 'error', message: `Submission failed: ${error.message}` };
        }
    }

    // Fetch existing review periods for a TA and user type
    static async fetchExistingReviewPeriods() {
        try {
            UIUtils.showLoading('Loading existing reviews...');
            
            const response = await fetch(`${CONFIG.apiUrl}?action=getReviewPeriods&taId=${appState.selectedTAId}&raterType=${appState.currentUserType}`);
            if (!response.ok) {
                throw new Error('Failed to fetch review periods');
            }
            
            const data = await response.json();
            
            // Normalize date formats for all periods
            console.log("Fetched review periods:", data.periods);
            const normalizedPeriods = (data.periods || []).map(period => ({
                ...period,
                startDate: DateUtils.formatDateStringCompact(period.startDate),
                endDate: DateUtils.formatDateStringCompact(period.endDate)
            }));
            
            appState.existingReviewPeriods = normalizedPeriods;
            
            UIUtils.hideLoading();
        } catch (error) {
            console.error('Error fetching review periods:', error);
            appState.existingReviewPeriods = [];
            UIUtils.hideLoading();
        }
    }
}

// Export the APIService class
export { APIService };

// For backward compatibility (can be removed later)
window.APIService = APIService;
