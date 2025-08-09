// Main Application Entry Point
import { CONFIG, MOCK_DATA, RATING_CATEGORIES } from './config.js';
import { appState } from './state.js';
import { domElements } from './dom-elements.js';
import { UIUtils } from './ui-utils.js';
import { DateUtils } from './date-utils.js';
import { APIService } from './api-service.js';
import { AuthManager } from './auth-manager.js';
import { TAManager } from './ta-manager.js';
import { RatingManager } from './rating-manager.js';
import { ReviewManager } from './review-manager.js';
import { OfficerRatingManager } from './officer-rating-manager.js';
import { ScreenManager } from './screen-manager.js';
import { EventHandlers } from './event-handlers.js';
import { App } from './app.js';

// Import development automation (only in dev mode)
// import { DevAutomation } from './dev-automation.js';

// Import CSS
 import '../styles/index.css';
// import '../css/dev-automation.css';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing application...');
    App.initialize();
});

// Hot Module Replacement for development
if (import.meta.hot) {
  import.meta.hot.accept('./app.js', (newModule) => {
    console.log('Hot reloading app.js');
    if (newModule?.App) {
      newModule.App.initialize();
    }
  });
  
  import.meta.hot.accept('../styles/index.css', () => {
    console.log('Hot reloading styles');
  });
}
