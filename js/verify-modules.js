// Module Verification Script
// This script can be run in the browser console to verify all modules are loaded correctly

console.log('=== TA Rating System Module Verification ===');

// Check configuration
if (typeof CONFIG !== 'undefined') {
    console.log('✅ CONFIG module loaded');
    console.log(`   - API URL: ${CONFIG.apiUrl}`);
    console.log(`   - Min review period: ${CONFIG.MINIMUM_REVIEW_PERIOD_DAYS} days`);
} else {
    console.error('❌ CONFIG module not loaded');
}

// Check state management
if (typeof AppState !== 'undefined' && typeof appState !== 'undefined') {
    console.log('✅ State management loaded');
    console.log(`   - AppState class: ${typeof AppState}`);
    console.log(`   - appState instance: ${typeof appState}`);
} else {
    console.error('❌ State management not loaded');
}

// Check DOM elements
if (typeof DOMElements !== 'undefined' && typeof domElements !== 'undefined') {
    console.log('✅ DOM elements loaded');
    console.log(`   - DOMElements class: ${typeof DOMElements}`);
    console.log(`   - domElements instance: ${typeof domElements}`);
} else {
    console.error('❌ DOM elements not loaded');
}

// Check UI utilities
if (typeof UIUtils !== 'undefined') {
    console.log('✅ UI utilities loaded');
    console.log(`   - UIUtils class: ${typeof UIUtils}`);
} else {
    console.error('❌ UI utilities not loaded');
}

// Check date utilities
if (typeof DateUtils !== 'undefined') {
    console.log('✅ Date utilities loaded');
    console.log(`   - DateUtils class: ${typeof DateUtils}`);
} else {
    console.error('❌ Date utilities not loaded');
}

// Check API service
if (typeof APIService !== 'undefined') {
    console.log('✅ API service loaded');
    console.log(`   - APIService class: ${typeof APIService}`);
} else {
    console.error('❌ API service not loaded');
}

// Check screen manager
if (typeof ScreenManager !== 'undefined') {
    console.log('✅ Screen manager loaded');
    console.log(`   - ScreenManager class: ${typeof ScreenManager}`);
} else {
    console.error('❌ Screen manager not loaded');
}

// Check managers
const managers = [
    { name: 'TAManager', class: TAManager },
    { name: 'AuthManager', class: AuthManager },
    { name: 'RatingManager', class: RatingManager },
    { name: 'ReviewManager', class: ReviewManager }
];

managers.forEach(manager => {
    if (typeof manager.class !== 'undefined') {
        console.log(`✅ ${manager.name} loaded`);
    } else {
        console.error(`❌ ${manager.name} not loaded`);
    }
});

// Check event handlers
if (typeof EventHandlers !== 'undefined') {
    console.log('✅ Event handlers loaded');
    console.log(`   - EventHandlers class: ${typeof EventHandlers}`);
} else {
    console.error('❌ Event handlers not loaded');
}

// Check app
if (typeof App !== 'undefined') {
    console.log('✅ App module loaded');
    console.log(`   - App class: ${typeof App}`);
} else {
    console.error('❌ App module not loaded');
}

console.log('=== Module Verification Complete ===');
console.log('If all modules show ✅, the modular structure is working correctly!');
