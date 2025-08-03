// Quick test to verify date formatting
console.log('=== Date Formatting Test ===');

// Test various date formats that might come from Google Sheets
const testDates = [
    '2025-03-02T18:30:00.000Z',
    '2025-03-02',
    '02/03/2025',
    '2025-01-05T18:30:00.000Z',
    '05/01/2025',
    'March 2, 2025',
    '1735840200000' // Unix timestamp
];

testDates.forEach(dateStr => {
    try {
        const formatted = DateUtils.formatDateStringCompact(dateStr);
        console.log(`${dateStr} -> ${formatted}`);
    } catch (error) {
        console.error(`Error formatting ${dateStr}:`, error);
    }
});

console.log('=== Test Complete ===');
