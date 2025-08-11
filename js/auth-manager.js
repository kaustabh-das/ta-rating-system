// Authentication Module
class AuthManager {
    // Handle user login
    static async handleLogin(phone, password) {
        UIUtils.showLoading('Authenticating...');
        
        console.log('Attempting login with:', phone);
        
        try {
            // First check if we have users data loaded
            if (!appState.dataLoaded) {
                await APIService.fetchUsers();
            }
            
            const user = appState.users.find(u => 
                String(u.phoneNumber).trim() === phone && 
                String(u.password).trim() === password
            );
            
            if (user) {
                // Store login state and user data
                appState.setCurrentUser(phone, user.name, user.userType);
                
                console.log('Login successful for:', user);
                
                // Save to session storage
                appState.saveToSession();
                
                // Update UI
                const userInfo = `${appState.currentUserName} (${appState.currentUserType})`;
                domElements.updateUserDisplays(userInfo);
                
                // Update user dropdown info
                EventHandlers.updateUserInfo(appState.currentUserName, appState.currentUserType);
                
                // Clear any existing rating displays from previous user
                const existingRatingDisplay = document.getElementById('existingRatingDisplay');
                if (existingRatingDisplay) {
                    existingRatingDisplay.remove();
                }
                
                // Hide rating controls if visible
                const ratingControls = document.getElementById('ratingControls');
                if (ratingControls) {
                    ratingControls.style.display = 'none';
                }
                
                // Load TA list if needed
                if (appState.taList.length === 0) {
                    await APIService.fetchTAList();
                    TAManager.populateTADropdown();
                }
                
                UIUtils.hideLoading();
                return { success: true };
            } else {
                // Failed login
                UIUtils.hideLoading();
                return { success: false, message: 'Invalid phone number or password' };
            }
        } catch (error) {
            console.error('Login error:', error);
            UIUtils.hideLoading();
            return { success: false, message: 'Login failed. Please try again.' };
        }
    }

    // Logout function
    static logout() {
        appState.clearSession();
        appState.reset();
        ScreenManager.showLogin();
    }

    // Check for existing session
    static async checkExistingSession() {
        UIUtils.showLoading('Checking session...');
        
        const isLoggedIn = appState.loadFromSession();
        
        if (isLoggedIn) {
            console.log('Session data found:', appState.getCurrentUser());
            
            // If user data is incomplete, fetch it
            if (!appState.currentUserType || !appState.currentUserName) {
                console.log('Incomplete user data, fetching from server...');
                await APIService.fetchUserData(appState.currentUserPhone);
            } else {
                // Make sure to update UI with stored data
                const userInfo = `${appState.currentUserName} (${appState.currentUserType})`;
                domElements.updateUserDisplays(userInfo);
                
                // Update user dropdown info for existing session
                EventHandlers.updateUserInfo(appState.currentUserName, appState.currentUserType);
            }
            
            // Fetch TA list in background if not already loaded
            if (appState.taList.length === 0) {
                APIService.fetchTAList().then(() => {
                    TAManager.populateTADropdown();
                });
            }
            
            UIUtils.hideLoading();
            ScreenManager.showTASelection();
        } else {
            // If not logged in, show login screen
            UIUtils.hideLoading();
            ScreenManager.showLogin();
        }
    }
}

// Export the AuthManager class
export { AuthManager };

// For backward compatibility (can be removed later)
window.AuthManager = AuthManager;
