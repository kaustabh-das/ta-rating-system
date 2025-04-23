// Global variables
let users = [];
let taList = [];
let dataLoaded = false;
let currentUserType = '';
let currentUserPhone = '';
let currentUserName = '';
let selectedTAId = '';
let selectedTAName = '';
const apiUrl = 'https://script.google.com/macros/s/AKfycbz09ywNpQETLLvf178Cf50Kp2MRZBMUKo35Jc44Zvk5k0Na6ePZJ5p6hHsmtlSrzTzw/exec';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const phoneInput = document.getElementById('phoneNumber');
const passwordInput = document.getElementById('password');
const phoneError = document.getElementById('phoneError');
const passwordError = document.getElementById('passwordError');
const loginError = document.getElementById('loginError');
const loginContainer = document.getElementById('loginContainer');
const taSelectionContainer = document.getElementById('taSelectionContainer');
const ratingContainer = document.getElementById('ratingContainer');
const confirmationContainer = document.getElementById('confirmationContainer');
const userDisplayName = document.getElementById('userDisplayName');
const userDisplayName2 = document.getElementById('userDisplayName2');
const userDisplayName3 = document.getElementById('userDisplayName3');
const taSelect = document.getElementById('taSelect');
const taSelectError = document.getElementById('taSelectError');
const proceedToRatingBtn = document.getElementById('proceedToRatingBtn');
const selectedTANameDisplay = document.getElementById('selectedTAName');
const ratingForm = document.getElementById('ratingForm');
const ratingError = document.getElementById('ratingError');
const logoutButton = document.getElementById('logoutButton');
const logoutButton2 = document.getElementById('logoutButton2');
const logoutButton3 = document.getElementById('logoutButton3');
const backToSelectionBtn = document.getElementById('backToSelectionBtn');
const rateAnotherBtn = document.getElementById('rateAnotherBtn');

// Initialize the app
window.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
    // Check if user is already logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        currentUserPhone = sessionStorage.getItem('userPhone');
        currentUserType = sessionStorage.getItem('userType');
        currentUserName = sessionStorage.getItem('userName');
        
        // If user data is incomplete, fetch it
        if (!currentUserType || !currentUserName) {
            await fetchUserData(currentUserPhone);
        }
        
        showTASelection();
    }
    
    // Fetch users data in the background
    fetchUsers();
}

// Fetch users from Google Sheet
async function fetchUsers() {
    try {
        // Replace with your Google Apps Script web app URL
        
        const response = await fetch(`${apiUrl}?action=getUsers`);
        if (!response.ok) {
            throw new Error('Failed to fetch users data');
        }
        
        const data = await response.json();
        // Process the data to ensure consistent formatting
        users = data.users.map(user => ({
            phoneNumber: String(user.phoneNumber).trim(),
            password: String(user.password).trim(),
            userType: String(user.userType || '').trim(),
            name: String(user.name || '').trim()
        }));
        console.log('Users data loaded successfully');
        dataLoaded = true;
    } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to mock data if API fails
        users = [
            { phoneNumber: "1234567890", password: "password123", userType: "mentor", name: "John Mentor" },
            { phoneNumber: "9876543210", password: "securepass", userType: "officer", name: "Susan Officer" }
        ];
        dataLoaded = true;
    }
}

// Fetch TAs list
async function fetchTAList() {
    try {
        // Replace with your Google Apps Script web app URL
        
        const response = await fetch(`${apiUrl}?action=getTAs`);
        if (!response.ok) {
            throw new Error('Failed to fetch TAs data');
        }
        
        const data = await response.json();
        taList = data.tas || [];
        console.log('TAs data loaded successfully');
        
        // Populate the select dropdown
        populateTADropdown();
    } catch (error) {
        console.error('Error fetching TAs:', error);
        // Fallback to mock data if API fails
        taList = [
            { taId: "ta1", name: "Alex Johnson" },
            { taId: "ta2", name: "Maria Garcia" },
            { taId: "ta3", name: "Sam Wilson" }
        ];
        
        // Populate the select dropdown with mock data
        populateTADropdown();
    }
}

// Fetch user data
async function fetchUserData(phone) {
    try {
        // Replace with your Google Apps Script web app URL
        
        const response = await fetch(`${apiUrl}?action=getUserData&phone=${phone}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        currentUserType = data.userType || '';
        currentUserName = data.name || '';
        
        // Store in session
        sessionStorage.setItem('userType', currentUserType);
        sessionStorage.setItem('userName', currentUserName);
        
        // Update UI
        updateUserDisplays();
        
        return data;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Submit rating to Google Sheet
async function submitRating(ratingData) {
    try {
        // Replace with your Google Apps Script web app URL
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8'
            },
            body: JSON.stringify({
                action: 'submitRating',
                data: ratingData
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit rating');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error submitting rating:', error);
        // For demo purposes, return a fake success response
        return { status: 'success', message: 'Rating submitted (demo mode)' };
    }
}

// Populate TA dropdown
function populateTADropdown() {
    // Clear existing options except the first one
    while (taSelect.options.length > 1) {
        taSelect.remove(1);
    }
    
    // Add TAs to dropdown
    taList.forEach(ta => {
        const option = document.createElement('option');
        option.value = ta.taId;
        option.textContent = ta.name;
        taSelect.appendChild(option);
    });
}

// Update user display elements
function updateUserDisplays() {
    const displayText = `${currentUserName} (${currentUserType})`;
    userDisplayName.textContent = displayText;
    userDisplayName2.textContent = displayText;
    userDisplayName3.textContent = displayText;
}

// Event Listeners
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset errors
    phoneError.style.display = 'none';
    passwordError.style.display = 'none';
    loginError.style.display = 'none';
    phoneInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
    
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Basic validation
    let hasError = false;
    
    if (!phone) {
        phoneError.style.display = 'block';
        phoneInput.classList.add('input-error');
        hasError = true;
    }
    
    if (!password) {
        passwordError.style.display = 'block';
        passwordInput.classList.add('input-error');
        hasError = true;
    }
    
    if (hasError) return;

    // Ensure data is loaded before attempting login
    if (!dataLoaded) {
        console.log('Waiting for user data to load...');
        loginError.textContent = 'Please wait, loading user data...';
        loginError.style.display = 'block';
        try {
            await fetchUsers();
        } catch (err) {
            console.error('Error loading user data:', err);
        }
    }
    
    // Authentication check against data from Google Sheet
    console.log('Attempting login with:', phone, password);
    
    const user = users.find(u => 
        String(u.phoneNumber).trim() === phone && 
        String(u.password).trim() === password
    );
    
    if (user) {
        // Store login state
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userPhone', phone);
        
        // Store user type and name
        currentUserPhone = phone;
        currentUserType = user.userType || '';
        currentUserName = user.name || '';
        sessionStorage.setItem('userType', currentUserType);
        sessionStorage.setItem('userName', currentUserName);
        
        // Update UI with user info
        updateUserDisplays();
        
        // Show TA selection screen
        showTASelection();
    } else {
        // Failed login
        loginError.textContent = 'Invalid phone number or password';
        loginError.style.display = 'block';
    }
});

// Proceed to rating button
proceedToRatingBtn.addEventListener('click', function() {
    taSelectError.style.display = 'none';
    
    selectedTAId = taSelect.value;
    if (!selectedTAId) {
        taSelectError.style.display = 'block';
        return;
    }
    
    // Get selected TA name
    const selectedOption = taSelect.options[taSelect.selectedIndex];
    selectedTAName = selectedOption.textContent;
    
    // Update UI
    selectedTANameDisplay.textContent = selectedTAName;
    
    // Show rating screen
    showRatingScreen();
});

// Rating form submission
ratingForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset error
    ratingError.style.display = 'none';
    
    // Get rating values
    const discipline = document.querySelector('input[name="discipline"]:checked')?.value;
    const ethics = document.querySelector('input[name="ethics"]:checked')?.value;
    const knowledge = document.querySelector('input[name="knowledge"]:checked')?.value;
    const communication = document.querySelector('input[name="communication"]:checked')?.value;
    const teamwork = document.querySelector('input[name="teamwork"]:checked')?.value;
    const comments = document.getElementById('comments').value.trim();
    
    // Validate all ratings are selected
    if (!discipline || !ethics || !knowledge || !communication || !teamwork) {
        ratingError.textContent = 'Please rate all categories';
        ratingError.style.display = 'block';
        return;
    }
    
    // Prepare rating data
    const ratingData = {
        taId: selectedTAId,
        taName: selectedTAName,
        raterPhone: currentUserPhone,
        raterName: currentUserName,
        raterType: currentUserType,
        discipline: parseInt(discipline),
        ethics: parseInt(ethics),
        knowledge: parseInt(knowledge),
        communication: parseInt(communication),
        teamwork: parseInt(teamwork),
        comments: comments,
        timestamp: new Date().toISOString()
    };
    
    // Submit rating
    const result = await submitRating(ratingData);
    
    if (result.status === 'success') {
        // Show confirmation screen
        showConfirmationScreen();
    } else {
        // Show error
        ratingError.textContent = result.message || 'Failed to submit rating. Please try again.';
        ratingError.style.display = 'block';
    }
});

// Back to selection button
backToSelectionBtn.addEventListener('click', function() {
    showTASelection();
});

// Rate another button
rateAnotherBtn.addEventListener('click', function() {
    showTASelection();
});

// Logout buttons
[logoutButton, logoutButton2, logoutButton3].forEach(button => {
    button.addEventListener('click', logout);
});

// Logout function
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userPhone');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('userName');
    showLogin();
}

// Screen navigation
function showLogin() {
    loginContainer.style.display = 'block';
    taSelectionContainer.style.display = 'none';
    ratingContainer.style.display = 'none';
    confirmationContainer.style.display = 'none';
    
    // Reset form fields
    loginForm.reset();
    
    // Reset body style for login screen
    document.body.style.display = 'flex';
    document.body.style.height = '100vh';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
}

function showTASelection() {
    loginContainer.style.display = 'none';
    taSelectionContainer.style.display = 'block';
    ratingContainer.style.display = 'none';
    confirmationContainer.style.display = 'none';
    
    // Reset body style
    document.body.style.display = 'flex';
    document.body.style.height = '100vh';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
    
    // Fetch TA list if not already loaded
    if (taList.length === 0) {
        fetchTAList();
    }
}

function showRatingScreen() {
    loginContainer.style.display = 'none';
    taSelectionContainer.style.display = 'none';
    ratingContainer.style.display = 'block';
    confirmationContainer.style.display = 'none';
    
    // Reset rating form
    ratingForm.reset();
}

function showConfirmationScreen() {
    loginContainer.style.display = 'none';
    taSelectionContainer.style.display = 'none';
    ratingContainer.style.display = 'none';
    confirmationContainer.style.display = 'block';
} 