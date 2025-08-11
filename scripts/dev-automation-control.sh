#!/bin/bash

# Development Automation Control Script

echo "🤖 TA Rating System - Development Automation Control"
echo "======================================================"
echo ""

# Function to show current status
show_status() {
    echo "📊 Current Status:"
    echo "Open browser console and run: DevAutomation.status()"
    echo ""
}

# Function to show available commands
show_help() {
    echo "🔧 Available Commands:"
    echo ""
    echo "Browser Console Commands:"
    echo "  DevAutomation.enable()           - Enable all automation"
    echo "  DevAutomation.disable()          - Disable all automation" 
    echo "  DevAutomation.enableTASelect()   - Enable only TA auto-selection"
    echo "  DevAutomation.disableTASelect()  - Disable TA auto-selection"
    echo "  DevAutomation.enableAutoLogin()  - Enable only auto-login"
    echo "  DevAutomation.disableAutoLogin() - Disable auto-login"
    echo "  DevAutomation.status()           - Show current status"
    echo ""
    echo "💡 Quick Setup Examples:"
    echo ""
    echo "1. Working on Rating Screen (auto-skip login & TA selection):"
    echo "   DevAutomation.enable()"
    echo ""
    echo "2. Working on TA Selection (auto-login but manual TA selection):"
    echo "   DevAutomation.enableAutoLogin()"
    echo "   DevAutomation.disableTASelect()"
    echo ""
    echo "3. Working on Login Screen (no automation):"
    echo "   DevAutomation.disable()"
    echo ""
    echo "4. Working on TA Dropdown only (skip login, manual TA work):"
    echo "   DevAutomation.enableAutoLogin()"
    echo "   DevAutomation.disableTASelect()"
    echo ""
}

# Function to create automation config file
create_config() {
    cat > js/dev-automation-config.js << 'EOF'
// Development Automation Configuration
// Edit these values to control automation behavior

export const DEV_AUTOMATION_CONFIG = {
    // Main toggles
    AUTO_LOGIN: true,           // Auto-fill and submit login form
    AUTO_SELECT_FIRST_TA: true, // Auto-select first TA and proceed to rating
    
    // Timing
    AUTOMATION_DELAY: 1000,     // Delay between automation steps (ms)
    
    // Test credentials
    TEST_CREDENTIALS: {
        phone: '1234567890',
        password: 'password123'
    },
    
    // Debug
    VERBOSE_LOGGING: true       // Show detailed automation logs
};
EOF
    echo "✅ Created js/dev-automation-config.js"
    echo "   You can edit this file to change default automation settings"
}

# Main menu
echo "What would you like to do?"
echo ""
echo "1) Show help & commands"
echo "2) Show current status"
echo "3) Create automation config file"
echo "4) Open browser to test automation"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        show_help
        ;;
    2)
        show_status
        ;;
    3)
        create_config
        ;;
    4)
        echo "🌐 Opening http://localhost:3000..."
        if command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:3000
        elif command -v open &> /dev/null; then
            open http://localhost:3000
        else
            echo "Please open http://localhost:3000 in your browser"
        fi
        echo ""
        echo "🔧 Use browser console commands to control automation:"
        show_help
        ;;
    *)
        echo "Invalid choice. Showing help:"
        show_help
        ;;
esac

echo ""
echo "📝 Remember:"
echo "  - Automation only works in development mode (npm run dev)"
echo "  - Use browser console to control automation in real-time"
echo "  - Set AUTO_SELECT_FIRST_TA = false when working on TA selection"
echo "  - Set AUTO_LOGIN = false when working on login screen"
