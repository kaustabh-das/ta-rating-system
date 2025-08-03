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

// Initialize the app when DOM is loaded
window.addEventListener('DOMContentLoaded', App.initialize);
