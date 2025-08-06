// Configuration and Constants
const CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbz09ywNpQETLLvf178Cf50Kp2MRZBMUKo35Jc44Zvk5k0Na6ePZJ5p6hHsmtlSrzTzw/exec',
    MINIMUM_REVIEW_PERIOD_DAYS: 90,
    DATE_FORMAT: 'en-GB', // DD/MM/YYYY format
    MINIMUM_DATE: '2020-01-01'
};

// Mock data for fallback
const MOCK_DATA = {
    users: [
        { phoneNumber: "1234567890", password: "password123", userType: "mentor", name: "John Mentor" },
        { phoneNumber: "9876543210", password: "securepass", userType: "officer", name: "Susan Officer" }
    ],
    tas: [
        { taId: "ta1", name: "Kaustabh Das", department: "Computer Science" },
        { taId: "ta2", name: "Mrinal Kalita", department: "Electronics" },
        { taId: "ta3", name: "Susan Kumar", department: "Civil" }
    ]
};

// Rating categories configuration
const RATING_CATEGORIES = [
    { key: 'discipline', label: 'Discipline' },
    { key: 'ethics', label: 'Ethics' },
    { key: 'knowledge', label: 'Knowledge' },
    { key: 'communication', label: 'Communication' },
    { key: 'teamwork', label: 'Teamwork' }
];
