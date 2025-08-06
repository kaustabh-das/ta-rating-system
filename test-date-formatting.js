// Quick test to verify date formatting
console.log('=== Date Formatting Test ===');

// Mock CONFIG object
const CONFIG = {
    DATE_FORMAT: 'en-GB' // DD/MM/YYYY format
};

// Import DateUtils class (simulate)
class DateUtils {
    // Parse DD/MM/YYYY or DD/MM/YY format
    static parseDate(dateString) {
        const parts = dateString.split('/');
        let year = parseInt(parts[2]);
        
        // Handle YY format by converting to YYYY
        if (year < 100) {
            year += year < 50 ? 2000 : 1900; // Assume years 00-49 are 20xx, 50-99 are 19xx
        }
        
        return new Date(year, parts[1] - 1, parts[0]);
    }

    // Format as DD/MM/YY (compact format)
    static formatDateCompact(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    // Parse and format date string to compact format
    static formatDateStringCompact(dateString) {
        if (!dateString) return '';
        
        let date;
        
        // Convert to string if it's not already
        const dateStr = String(dateString).trim();
        
        if (dateStr.includes('/')) {
            // Handle DD/MM/YYYY or DD/MM/YY format
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                // Always assume DD/MM/YYYY or DD/MM/YY format
                let year = parseInt(parts[2]);
                
                // Handle YY format by converting to YYYY
                if (year < 100) {
                    year += year < 50 ? 2000 : 1900;
                }
                
                date = new Date(year, parts[1] - 1, parts[0]);
            }
        } else if (dateStr.includes('T') || dateStr.match(/\d{4}-\d{2}-\d{2}/)) {
            // Handle ISO timestamp format (2025-03-02T18:30:00.000Z) or YYYY-MM-DD format
            date = new Date(dateStr);
        } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Handle YYYY-MM-DD format from HTML date input
            date = new Date(dateStr);
        } else if (dateStr.match(/^\d+$/)) {
            // Handle Unix timestamp
            date = new Date(parseInt(dateStr));
        } else if (dateStr.includes('-') && dateStr.length >= 8) {
            // Handle various dash-separated formats
            date = new Date(dateStr);
        } else {
            // Try parsing as-is
            date = new Date(dateStr);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date format:', dateString);
            return dateString; // Return original if can't parse
        }
        
        return DateUtils.formatDateCompact(date);
    }
}

// Test various date formats that might come from Google Sheets
const testDates = [
    '2025-03-04', // HTML date input format (should become 04/03/25)
    '2025-06-02', // HTML date input format (should become 02/06/25)
    '04/03/2025', // DD/MM/YYYY format
    '02/06/2025', // DD/MM/YYYY format
    '04/03/25',   // DD/MM/YY format
    '02/06/25'    // DD/MM/YY format
];

console.log('Testing expected date range formats:');
testDates.forEach(dateStr => {
    try {
        const formatted = DateUtils.formatDateStringCompact(dateStr);
        console.log(`${dateStr} -> ${formatted}`);
    } catch (error) {
        console.error(`Error formatting ${dateStr}:`, error);
    }
});

console.log('=== Test Complete ===');
