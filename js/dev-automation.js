// Development Automation Script
class DevAutomation {
    // Configuration - Set to true to enable automation
    static AUTO_SELECT_FIRST_TA = true; // Change to false when working on TA selection
    static AUTO_LOGIN = false; // Auto-login with test credentials
    static AUTOMATION_DELAY = 1000; // Delay in milliseconds between actions
    
    // Test credentials
    static TEST_CREDENTIALS = {
        phone: '700200',
        password: 'password123'
    };
    
    // Initialize automation
    static init() {
        if (!DevAutomation.AUTO_SELECT_FIRST_TA && !DevAutomation.AUTO_LOGIN) {
            console.log('🤖 Dev Automation: Disabled');
            DevAutomation.createIndicator('Automation OFF');
            return;
        }
        
        console.log('🤖 Dev Automation: Enabled');
        console.log('   - Auto Login:', DevAutomation.AUTO_LOGIN);
        console.log('   - Auto TA Select:', DevAutomation.AUTO_SELECT_FIRST_TA);
        
        DevAutomation.createIndicator('Automation ON');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', DevAutomation.start);
        } else {
            DevAutomation.start();
        }
    }
    
    // Create visual indicator
    static createIndicator(text) {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.dev-automation-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = 'dev-automation-indicator';
        indicator.textContent = text;
        
        // Add appropriate class based on status
        if (text.includes('OFF')) {
            indicator.classList.add('disabled');
        } else if (text.includes('Working')) {
            indicator.classList.add('working');
        }
        
        // Add to body
        document.body.appendChild(indicator);
        
        // Add development class to body
        document.body.classList.add('development');
    }
    
    // Update indicator status
    static updateIndicator(text) {
        const indicator = document.querySelector('.dev-automation-indicator');
        if (indicator) {
            indicator.textContent = text;
            indicator.className = 'dev-automation-indicator';
            
            if (text.includes('OFF')) {
                indicator.classList.add('disabled');
            } else if (text.includes('Working')) {
                indicator.classList.add('working');
            }
        }
    }
    
    // Start automation sequence
    static start() {
        setTimeout(() => {
            DevAutomation.checkAndAutomate();
        }, 500); // Small delay to ensure everything is loaded
    }
    
    // Check current screen and automate accordingly
    static checkAndAutomate() {
        const loginContainer = document.getElementById('loginContainer');
        const taSelectionContainer = document.getElementById('taSelectionContainer');
        const ratingContainer = document.getElementById('ratingContainer');
        
        // Check which screen is currently visible
        if (loginContainer && loginContainer.style.display !== 'none' && DevAutomation.AUTO_LOGIN) {
            console.log('🤖 Auto-login detected login screen');
            DevAutomation.autoLogin();
        } else if (taSelectionContainer && taSelectionContainer.style.display !== 'none' && DevAutomation.AUTO_SELECT_FIRST_TA) {
            console.log('🤖 Auto-select detected TA selection screen');
            DevAutomation.autoSelectFirstTA();
        } else if (ratingContainer && ratingContainer.style.display !== 'none') {
            console.log('🤖 Rating screen detected - automation complete');
        }
    }
    
    // Auto-login with test credentials
    static autoLogin() {
        DevAutomation.updateIndicator('🔑 Auto-logging in...');
        
        const phoneInput = document.getElementById('phoneNumber');
        const passwordInput = document.getElementById('password');
        const loginForm = document.getElementById('loginForm');
        
        if (!phoneInput || !passwordInput || !loginForm) {
            console.warn('🤖 Login elements not found');
            DevAutomation.updateIndicator('❌ Login failed');
            return;
        }
        
        console.log('🤖 Auto-filling login credentials...');
        
        // Fill credentials
        phoneInput.value = DevAutomation.TEST_CREDENTIALS.phone;
        passwordInput.value = DevAutomation.TEST_CREDENTIALS.password;
        
        // Trigger input events to ensure validation works
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Submit form after delay
        setTimeout(() => {
            console.log('🤖 Submitting login form...');
            loginForm.dispatchEvent(new Event('submit', { bubbles: true }));
            
            // Check for TA selection screen after login
            setTimeout(() => {
                DevAutomation.checkAndAutomate();
            }, DevAutomation.AUTOMATION_DELAY);
        }, 500);
    }
    
    // Auto-select first TA and proceed
    static autoSelectFirstTA() {
        DevAutomation.updateIndicator('👤 Auto-selecting TA...');
        
        // Wait for TA list to be populated
        const waitForTAs = setInterval(() => {
            const taOptions = document.querySelectorAll('#customTASelect .select-option');
            
            if (taOptions.length > 0) {
                clearInterval(waitForTAs);
                DevAutomation.performTASelection(taOptions);
            } else {
                console.log('🤖 Waiting for TA list to load...');
            }
        }, 500);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(waitForTAs);
            console.warn('🤖 Timeout waiting for TA list');
            DevAutomation.updateIndicator('⏰ TA selection timeout');
        }, 10000);
    }
    
    // Perform the actual TA selection
    static performTASelection(taOptions) {
        const firstTA = taOptions[0];
        const proceedButton = document.getElementById('proceedToRatingBtn');
        
        if (!firstTA || !proceedButton) {
            console.warn('🤖 TA selection elements not found');
            DevAutomation.updateIndicator('❌ TA elements missing');
            return;
        }
        
        console.log('🤖 Auto-selecting first TA:', firstTA.textContent);
        DevAutomation.updateIndicator(`✅ Selected: ${firstTA.textContent}`);
        
        // Click the first TA option
        firstTA.click();
        
        // Wait and then click proceed button
        setTimeout(() => {
            if (!proceedButton.disabled) {
                console.log('🤖 Clicking proceed to rating button...');
                proceedButton.click();
                
                console.log('🤖 Automation complete - navigated to rating screen');
                DevAutomation.updateIndicator('✅ Rating screen ready');
            } else {
                console.warn('🤖 Proceed button is disabled');
                DevAutomation.updateIndicator('❌ Proceed disabled');
            }
        }, 500);
    }
    
    // Manual control functions for console
    static enable() {
        DevAutomation.AUTO_SELECT_FIRST_TA = true;
        DevAutomation.AUTO_LOGIN = true;
        DevAutomation.updateIndicator('Automation ON');
        console.log('🤖 Dev Automation: Enabled');
    }
    
    static disable() {
        DevAutomation.AUTO_SELECT_FIRST_TA = false;
        DevAutomation.AUTO_LOGIN = false;
        DevAutomation.updateIndicator('Automation OFF');
        console.log('🤖 Dev Automation: Disabled');
    }
    
    static enableTASelect() {
        DevAutomation.AUTO_SELECT_FIRST_TA = true;
        DevAutomation.updateIndicator('TA Auto-select ON');
        console.log('🤖 TA Auto-selection: Enabled');
    }
    
    static disableTASelect() {
        DevAutomation.AUTO_SELECT_FIRST_TA = false;
        DevAutomation.updateIndicator('TA Auto-select OFF');
        console.log('🤖 TA Auto-selection: Disabled');
    }
    
    static enableAutoLogin() {
        DevAutomation.AUTO_LOGIN = true;
        DevAutomation.updateIndicator('Auto-login ON');
        console.log('🤖 Auto-login: Enabled');
    }
    
    static disableAutoLogin() {
        DevAutomation.AUTO_LOGIN = false;
        DevAutomation.updateIndicator('Auto-login OFF');
        console.log('🤖 Auto-login: Disabled');
    }
    
    static status() {
        console.log('🤖 Dev Automation Status:');
        console.log('   - Auto Login:', DevAutomation.AUTO_LOGIN);
        console.log('   - Auto TA Select:', DevAutomation.AUTO_SELECT_FIRST_TA);
        console.log('   - Delay:', DevAutomation.AUTOMATION_DELAY + 'ms');
    }
}

// Export for module system
export { DevAutomation };

// Make available globally for console access
window.DevAutomation = DevAutomation;

// Auto-initialize only in development
if (import.meta.env?.DEV !== false) {
    DevAutomation.init();
}
