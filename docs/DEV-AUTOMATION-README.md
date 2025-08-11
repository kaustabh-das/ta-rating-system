# Development Automation System

This automation system helps speed up development by automatically handling login and TA selection, so you can quickly get to the screen you're working on.

## 🚀 Quick Start

### Enable/Disable Automation

**Browser Console Commands:**
```javascript
// Enable all automation (auto-login + auto-select first TA)
DevAutomation.enable()

// Disable all automation  
DevAutomation.disable()

// Working on Rating Screen - Enable everything
DevAutomation.enable()

// Working on TA Selection - Auto-login only
DevAutomation.enableAutoLogin()
DevAutomation.disableTASelect()

// Working on Login Screen - No automation
DevAutomation.disable()
```

### Control Script
```bash
# Run the control script for guided setup
./dev-automation-control.sh
```

## 🎛️ Configuration

### Main Settings (in dev-automation.js)
```javascript
static AUTO_SELECT_FIRST_TA = true;  // Auto-select first TA and proceed
static AUTO_LOGIN = true;            // Auto-login with test credentials  
static AUTOMATION_DELAY = 1000;      // Delay between actions (ms)
```

### Test Credentials
```javascript
static TEST_CREDENTIALS = {
    phone: '1234567890',
    password: 'password123'
};
```

## 🎯 Use Cases

### 1. Working on Rating Screen
**Goal**: Skip login and TA selection to get directly to rating screen
```javascript
DevAutomation.enable()
```
**Flow**: Auto-login → Auto-select first TA → Navigate to rating screen

### 2. Working on TA Selection UI
**Goal**: Skip login but manually test TA selection
```javascript
DevAutomation.enableAutoLogin()
DevAutomation.disableTASelect()
```
**Flow**: Auto-login → Manual TA selection

### 3. Working on Login Screen  
**Goal**: Test login functionality manually
```javascript
DevAutomation.disable()
```
**Flow**: Manual login → Manual TA selection

### 4. Testing TA Dropdown Only
**Goal**: Skip to TA selection to test dropdown behavior
```javascript
DevAutomation.enableAutoLogin()
DevAutomation.disableTASelect()
```
**Flow**: Auto-login → Test TA dropdown manually

## 🔍 Visual Indicator

The system shows a visual indicator in the top-right corner:

- **"Automation ON"** (Blue) - Full automation enabled
- **"🔑 Auto-logging in..."** (Green, pulsing) - Currently working
- **"👤 Auto-selecting TA..."** (Green, pulsing) - Selecting TA
- **"✅ Rating screen ready"** (Blue) - Automation complete
- **"Automation OFF"** (Gray) - Disabled

## 📋 Available Commands

### Enable/Disable
```javascript
DevAutomation.enable()           // Enable all automation
DevAutomation.disable()          // Disable all automation
DevAutomation.enableTASelect()   // Enable only TA auto-selection
DevAutomation.disableTASelect()  // Disable TA auto-selection  
DevAutomation.enableAutoLogin()  // Enable only auto-login
DevAutomation.disableAutoLogin() // Disable auto-login
```

### Status & Info
```javascript
DevAutomation.status()           // Show current configuration
```

## 🛠️ How It Works

### Auto-Login
1. Detects login screen
2. Fills phone and password fields
3. Submits form
4. Waits for TA selection screen

### Auto-TA Selection  
1. Waits for TA list to load
2. Clicks first TA option
3. Clicks "Proceed to Rating" button
4. Navigates to rating screen

### Smart Detection
- Automatically detects current screen
- Only runs automation when appropriate
- Includes timeouts and error handling

## 🚨 Important Notes

### Development Only
- Only works in development mode (`npm run dev`)
- Automatically disabled in production builds
- Uses `import.meta.env?.DEV` to detect environment

### Timing & Reliability
- Includes delays to ensure elements are loaded
- Waits for TA list population before selection
- Has timeout protection (10 seconds)
- Handles missing elements gracefully

### Hot Reload Compatibility  
- Survives hot reloads
- Maintains settings across page updates
- Visual indicator persists

## 🔧 Customization

### Change Default Settings
Edit the variables at the top of `js/dev-automation.js`:
```javascript
static AUTO_SELECT_FIRST_TA = false; // Disable TA auto-select by default
static AUTO_LOGIN = true;            // Keep auto-login enabled
static AUTOMATION_DELAY = 2000;      // Slower automation
```

### Change Test Credentials
```javascript
static TEST_CREDENTIALS = {
    phone: 'your-test-phone',
    password: 'your-test-password'
};
```

### Modify Visual Indicator
Edit `css/dev-automation.css` to change appearance, position, or styling.

## 🐛 Troubleshooting

### Automation Not Working
1. Check console for error messages
2. Verify you're in development mode
3. Ensure elements exist on page
4. Check `DevAutomation.status()` for current settings

### TA Selection Fails
- Check if TA list is loaded: `appState.taList.length`
- Verify dropdown elements exist
- Look for console warnings about timeouts

### Login Issues
- Verify test credentials are correct
- Check if login form elements have correct IDs
- Ensure validation is not blocking submission

## 📖 Examples

### Rapid Rating Screen Development
```javascript
// Set it once and forget
DevAutomation.enable()
// Now every page reload goes straight to rating screen
```

### TA Dropdown Debugging  
```javascript
// Get to TA selection quickly
DevAutomation.enableAutoLogin()
DevAutomation.disableTASelect()
// Manual TA selection for testing dropdown behavior
```

### Login Form Testing
```javascript
// Turn off automation temporarily  
DevAutomation.disable()
// Test login manually, then re-enable
DevAutomation.enable()
```

The automation system saves significant development time by eliminating repetitive manual navigation!
