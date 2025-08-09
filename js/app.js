// Main Application Entry Point
class App {
    // Initialize the application
    static async initialize() {
        console.log('Initializing TA Rating System...');
        
        // Initialize event handlers
        EventHandlers.initialize();
        
        // Check for existing session and show appropriate screen
        await AuthManager.checkExistingSession();
        
        console.log('Application initialized successfully');
    }
}

// Global wrapper functions for HTML onclick attributes
window.closeDateRangeModal = function() {
    ScreenManager.closeDateRangeModal();
};

window.showTASelection = function() {
    ScreenManager.showTASelection();
};

window.logout = function() {
    AuthManager.logout();
};

// Export the App class
export { App };

// For backward compatibility (can be removed later)
window.App = App;

// Initialize the app when DOM is loaded (for ES6 module system)
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', App.initialize);
}
