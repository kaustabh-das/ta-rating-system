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
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the app
window.addEventListener('DOMContentLoaded', initialize);

// Loading overlay functions
function showLoading(message = 'Loading data...') {
    const messageElement = loadingOverlay.querySelector('p');
    if (messageElement) {
        messageElement.textContent = message;
    }
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

async function initialize() {
    // Check if user is already logged in
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        // Load user data from session storage
        currentUserPhone = sessionStorage.getItem('userPhone');
        currentUserType = sessionStorage.getItem('userType');
        currentUserName = sessionStorage.getItem('userName');
        
        console.log('Session data found:', {
            phone: currentUserPhone,
            type: currentUserType,
            name: currentUserName
        });
        
        // If user data is incomplete, fetch it
        if (!currentUserType || !currentUserName) {
            console.log('Incomplete user data, fetching from server...');
            await fetchUserData(currentUserPhone);
        } else {
            // Make sure to update UI with stored data
            updateUserDisplays();
        }
        
        // Fetch TA list in background if not already loaded
        if (taList.length === 0) {
            fetchTAList();
        }
        
        showTASelection();
    } else {
        // If not logged in, show login screen
        showLogin();
    }
}

// Fetch users from Google Sheet
async function fetchUsers() {
    try {
        showLoading('Loading user data...');
        
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
        
        hideLoading();
    } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to mock data if API fails
        users = [
            { phoneNumber: "1234567890", password: "password123", userType: "mentor", name: "John Mentor" },
            { phoneNumber: "9876543210", password: "securepass", userType: "officer", name: "Susan Officer" }
        ];
        dataLoaded = true;
        
        hideLoading();
    }
}

// Fetch TAs list
async function fetchTAList() {
    try {
        showLoading('Loading TA list...');
        
        const response = await fetch(`${apiUrl}?action=getTAs`);
        if (!response.ok) {
            throw new Error('Failed to fetch TAs data');
        }
        
        const data = await response.json();
        taList = data.tas || [];
        populateTADropdown();
        console.log('TA list loaded successfully');
        
        hideLoading();
    } catch (error) {
        console.error('Error fetching TAs:', error);
        // Fallback to mock data if API fails
        taList = [
            { taId: "ta1", name: "Kaustabh Das", department: "Computer Science" },
            { taId: "ta2", name: "Mrinal Kalita", department: "Electronics" },
            { taId: "ta3", name: "Susan Kumar", department: "Civil" }
        ];
        populateTADropdown();
        
        hideLoading();
    }
}

// Fetch user data
async function fetchUserData(phone) {
    try {
        showLoading('Loading user profile...');
        
        const response = await fetch(`${apiUrl}?action=getUserData&phone=${phone}`);
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        if (data.user) {
            currentUserType = data.user.userType || '';
            currentUserName = data.user.name || '';
            
            // Store in session
            sessionStorage.setItem('userType', currentUserType);
            sessionStorage.setItem('userName', currentUserName);
            
            updateUserDisplays();
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error fetching user data:', error);
        hideLoading();
    }
}

// Fetch ratings for a specific TA
async function fetchTARatings(taId) {
    try {
        showLoading('Loading TA ratings...');
        
        const response = await fetch(`${apiUrl}?action=getTARatings&taId=${taId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch TA ratings');
        }
        
        const data = await response.json();
        hideLoading();
        return data;
    } catch (error) {
        console.error('Error fetching TA ratings:', error);
        hideLoading();
        return { status: 'error', message: error.message, ratings: [] };
    }
}

// Submit rating to Google Sheet
async function submitRating(ratingData) {
    try {
        showLoading('Submitting rating...');
        
        // Use GET request as primary method
        const params = new URLSearchParams();
        params.append('action', 'submitRating');
        
        // Add all rating data as URL parameters
        Object.keys(ratingData).forEach(key => {
            params.append(key, ratingData[key]);
        });
        
        const response = await fetch(`${apiUrl}?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        hideLoading();
        return result;
    } catch (error) {
        console.error('GET request failed:', error);
        hideLoading();
        
        // Provide more specific error messages
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            return { status: 'error', message: 'Network error. Please check your internet connection and try again.' };
        }
        
        return { status: 'error', message: `Submission failed: ${error.message}` };
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
    const userInfo = `${currentUserName} (${currentUserType})`;
    console.log('Updating UI with user:', userInfo);
    
    // Update all user display elements
    if (userDisplayName) userDisplayName.textContent = userInfo;
    if (userDisplayName2) userDisplayName2.textContent = userInfo;
    if (userDisplayName3) userDisplayName3.textContent = userInfo;
}

// Event Listeners
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset errors
    phoneError.style.display = 'none';
    passwordError.style.display = 'none';
    loginError.style.display = 'none';
    
    // Get input values
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Basic validation
    let hasError = false;
    
    if (!phone) {
        phoneError.style.display = 'block';
        hasError = true;
    }
    
    if (!password) {
        passwordError.style.display = 'block';
        hasError = true;
    }
    
    if (hasError) {
        return;
    }
    
    showLoading('Authenticating...');
    
    console.log('Attempting login with:', phone);
    
    try {
        // First check if we have users data loaded
        if (!dataLoaded) {
            await fetchUsers();
        }
        
        const user = users.find(u => 
            String(u.phoneNumber).trim() === phone && 
            String(u.password).trim() === password
        );
        
        if (user) {
            // Store login state and user data
            currentUserPhone = phone;
            currentUserType = user.userType;
            currentUserName = user.name;
            
            console.log('Login successful for:', user);
            
            // Save to session storage
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('userPhone', phone);
            sessionStorage.setItem('userType', user.userType);
            sessionStorage.setItem('userName', user.name);
            
            // Update UI
            updateUserDisplays();
            
            // Load TA list if needed
            if (taList.length === 0) {
                await fetchTAList();
            }
            
            hideLoading();
            // Show TA selection screen
            showTASelection();
        } else {
            // Failed login
            hideLoading();
            loginError.textContent = 'Invalid phone number or password';
            loginError.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        hideLoading();
        loginError.textContent = 'Login failed. Please try again.';
        loginError.style.display = 'block';
    }
});

// Proceed to rating button
proceedToRatingBtn.addEventListener('click', async function() {
    taSelectError.style.display = 'none';
    
    selectedTAId = taSelect.value;
    if (!selectedTAId) {
        taSelectError.style.display = 'block';
        return;
    }
    
    const selectedOption = taSelect.options[taSelect.selectedIndex];
    selectedTAName = selectedOption.textContent;
    
    // Update UI
    selectedTANameDisplay.textContent = selectedTAName;
    
    // Fetch any existing ratings for this TA
    const ratingsData = await fetchTARatings(selectedTAId);
    
    // Show rating screen (passing ratings data)
    showRatingScreen(ratingsData);
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
    
    console.log('Submitting rating data:', ratingData);
    
    // Submit rating
    const result = await submitRating(ratingData);
    
    console.log('Rating submission result:', result);
    
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
    // Reset any error messages
    ratingError.style.display = 'none';
    
    // Hide current screen and show TA selection screen
    ratingContainer.style.display = 'none';
    taSelectionContainer.style.display = 'block';
    
    // Reset form
    ratingForm.reset();
    
    // Update body style
    document.body.className = 'centered';
    document.body.style.display = 'flex';
    document.body.style.height = '100vh';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
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
    document.body.className = 'centered';
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
    document.body.className = 'centered';
    document.body.style.display = 'flex';
    document.body.style.height = '100vh';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
    
    // Fetch TA list if not already loaded
    if (taList.length === 0) {
        fetchTAList();
    }
}

function showRatingScreen(ratingsData) {
    loginContainer.style.display = 'none';
    taSelectionContainer.style.display = 'none';
    ratingContainer.style.display = 'block';
    confirmationContainer.style.display = 'none';
    
    // Reset body style for rating screen - ensure content is scrollable
    document.body.className = '';
    document.body.style.display = 'block';
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';
    
    // Reset rating form
    ratingForm.reset();
    
    // Get references to the rating form elements
    let existingRatingsContainer = document.getElementById('existingRatingsContainer');
    let existingRatingsContent = document.getElementById('existingRatingsContent');
    
    // If we don't have these containers yet, we need to create them
    if (!existingRatingsContainer) {
        // Create container for existing ratings
        existingRatingsContainer = document.createElement('div');
        existingRatingsContainer.id = 'existingRatingsContainer';
        existingRatingsContainer.style.display = 'none';
        existingRatingsContainer.style.marginTop = '20px';
        existingRatingsContainer.style.padding = '15px';
        existingRatingsContainer.style.border = '1px solid #ddd';
        existingRatingsContainer.style.borderRadius = '5px';
        existingRatingsContainer.style.backgroundColor = '#f8f8f8';
        
        // Create header for existing ratings
        const header = document.createElement('h4');
        header.textContent = 'Existing Ratings';
        existingRatingsContainer.appendChild(header);
        
        // Create content div for ratings
        existingRatingsContent = document.createElement('div');
        existingRatingsContent.id = 'existingRatingsContent';
        existingRatingsContainer.appendChild(existingRatingsContent);
        
        // Insert after the rating form
        ratingContainer.appendChild(existingRatingsContainer);
    }
    
    // Create or get a reference to the mentor ratings container (for officers)
    let mentorRatingsContainer = document.getElementById('mentorRatingsContainer');
    
    if (!mentorRatingsContainer && currentUserType === 'officer') {
        // Create container for mentor ratings that will be shown to officers
        mentorRatingsContainer = document.createElement('div');
        mentorRatingsContainer.id = 'mentorRatingsContainer';
        mentorRatingsContainer.style.marginTop = '20px';
        mentorRatingsContainer.style.marginBottom = '30px'; // Add gap between mentor rating and form
        mentorRatingsContainer.style.padding = '15px';
        mentorRatingsContainer.style.border = '1px solid #ddd';
        mentorRatingsContainer.style.borderRadius = '5px';
        mentorRatingsContainer.style.backgroundColor = 'rgba(76, 201, 240, 0.1)'; // Light accent color
        
        // Create header for mentor ratings
        const mentorHeader = document.createElement('h4');
        mentorHeader.textContent = 'Mentor Rating';
        mentorHeader.style.color = 'var(--secondary-color)';
        mentorHeader.style.marginBottom = '15px';
        mentorHeader.style.paddingBottom = '10px';
        mentorHeader.style.borderBottom = '1px solid var(--medium-gray)';
        mentorRatingsContainer.appendChild(mentorHeader);
        
        // Create content div for mentor ratings
        const mentorRatingsContent = document.createElement('div');
        mentorRatingsContent.id = 'mentorRatingsContent';
        mentorRatingsContainer.appendChild(mentorRatingsContent);
        
        // Insert before the rating form
        ratingContainer.querySelector('.content').insertBefore(mentorRatingsContainer, ratingForm);
    }
    
    console.log("Ratings data:", ratingsData);
    
    if (!ratingsData || !ratingsData.ratings || ratingsData.ratings.length === 0) {
        // No existing ratings, show the form
        ratingForm.style.display = 'block';
        existingRatingsContainer.style.display = 'none';
        if (mentorRatingsContainer) {
            mentorRatingsContainer.style.display = 'none';
        }
        return;
    }
    
    // Check if this user type has already rated this TA
    const currentUserTypeRating = ratingsData.ratings.find(rating => 
        rating.raterType === currentUserType
    );
    
    // Check if there's a mentor rating (for officers to see)
    const mentorRating = currentUserType === 'officer' ? 
        ratingsData.ratings.find(rating => rating.raterType === 'mentor') : 
        null;
    
    console.log("Current user type rating:", currentUserTypeRating);
    console.log("Mentor rating (for officers):", mentorRating);
    
    // Display mentor rating for officers
    if (mentorRating && mentorRatingsContainer) {
        mentorRatingsContainer.style.display = 'block';
        const mentorRatingsContent = document.getElementById('mentorRatingsContent');
        mentorRatingsContent.innerHTML = '';
        
        // Create a formatted display of the mentor rating
        const raterInfo = document.createElement('p');
        raterInfo.innerHTML = `<strong>Rated by:</strong> ${mentorRating.raterName} (mentor)`;
        mentorRatingsContent.appendChild(raterInfo);
        
        const ratingDate = document.createElement('p');
        ratingDate.innerHTML = `<strong>Date:</strong> ${new Date(mentorRating.timestamp).toLocaleString()}`;
        mentorRatingsContent.appendChild(ratingDate);
        
        // Create a table for the ratings
        const ratingTable = document.createElement('table');
        ratingTable.style.width = '100%';
        ratingTable.style.borderCollapse = 'collapse';
        ratingTable.style.marginTop = '15px';
        
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const categoryHeader = document.createElement('th');
        categoryHeader.textContent = 'Category';
        categoryHeader.style.border = '1px solid #ddd';
        categoryHeader.style.padding = '8px';
        categoryHeader.style.backgroundColor = '#f2f2f2';
        
        const ratingHeader = document.createElement('th');
        ratingHeader.textContent = 'Rating';
        ratingHeader.style.border = '1px solid #ddd';
        ratingHeader.style.padding = '8px';
        ratingHeader.style.backgroundColor = '#f2f2f2';
        
        headerRow.appendChild(categoryHeader);
        headerRow.appendChild(ratingHeader);
        tableHeader.appendChild(headerRow);
        ratingTable.appendChild(tableHeader);
        
        const tableBody = document.createElement('tbody');
        
        // Add rows for each rating category
        const categories = [
            { key: 'discipline', label: 'Discipline' },
            { key: 'ethics', label: 'Ethics' },
            { key: 'knowledge', label: 'Knowledge' },
            { key: 'communication', label: 'Communication' },
            { key: 'teamwork', label: 'Teamwork' }
        ];
        
        categories.forEach(category => {
            const row = document.createElement('tr');
            
            const categoryCell = document.createElement('td');
            categoryCell.textContent = category.label;
            categoryCell.style.border = '1px solid #ddd';
            categoryCell.style.padding = '8px';
            
            const ratingCell = document.createElement('td');
            ratingCell.textContent = `${mentorRating[category.key]} / 5`;
            ratingCell.style.border = '1px solid #ddd';
            ratingCell.style.padding = '8px';
            
            row.appendChild(categoryCell);
            row.appendChild(ratingCell);
            tableBody.appendChild(row);
        });
        
        ratingTable.appendChild(tableBody);
        mentorRatingsContent.appendChild(ratingTable);
        
        // Add comments if any
        if (mentorRating.comments) {
            const commentsDiv = document.createElement('div');
            commentsDiv.style.marginTop = '15px';
            
            const commentsHeader = document.createElement('strong');
            commentsHeader.textContent = 'Comments:';
            commentsDiv.appendChild(commentsHeader);
            
            const commentsPara = document.createElement('p');
            commentsPara.textContent = mentorRating.comments;
            commentsPara.style.marginTop = '5px';
            commentsDiv.appendChild(commentsPara);
            
            mentorRatingsContent.appendChild(commentsDiv);
        }
    } else if (mentorRatingsContainer) {
        mentorRatingsContainer.style.display = 'none';
    }
    
    if (currentUserTypeRating) {
        // This user type has already rated this TA, show the rating data and hide the form
        ratingForm.style.display = 'none';
        existingRatingsContainer.style.display = 'block';
        
        // Format the existing rating for display
        existingRatingsContent.innerHTML = '';
        
        // Create a formatted display of the existing rating
        const raterInfo = document.createElement('p');
        raterInfo.innerHTML = `<strong>Rated by:</strong> ${currentUserTypeRating.raterName} (${currentUserTypeRating.raterType})`;
        existingRatingsContent.appendChild(raterInfo);
        
        const ratingDate = document.createElement('p');
        ratingDate.innerHTML = `<strong>Date:</strong> ${new Date(currentUserTypeRating.timestamp).toLocaleString()}`;
        existingRatingsContent.appendChild(ratingDate);
        
        // Create a table for the ratings
        const ratingTable = document.createElement('table');
        ratingTable.style.width = '100%';
        ratingTable.style.borderCollapse = 'collapse';
        ratingTable.style.marginTop = '15px';
        
        const tableHeader = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const categoryHeader = document.createElement('th');
        categoryHeader.textContent = 'Category';
        categoryHeader.style.border = '1px solid #ddd';
        categoryHeader.style.padding = '8px';
        categoryHeader.style.backgroundColor = '#f2f2f2';
        
        const ratingHeader = document.createElement('th');
        ratingHeader.textContent = 'Rating';
        ratingHeader.style.border = '1px solid #ddd';
        ratingHeader.style.padding = '8px';
        ratingHeader.style.backgroundColor = '#f2f2f2';
        
        headerRow.appendChild(categoryHeader);
        headerRow.appendChild(ratingHeader);
        tableHeader.appendChild(headerRow);
        ratingTable.appendChild(tableHeader);
        
        const tableBody = document.createElement('tbody');
        
        // Add rows for each rating category
        const categories = [
            { key: 'discipline', label: 'Discipline' },
            { key: 'ethics', label: 'Ethics' },
            { key: 'knowledge', label: 'Knowledge' },
            { key: 'communication', label: 'Communication' },
            { key: 'teamwork', label: 'Teamwork' }
        ];
        
        categories.forEach(category => {
            const row = document.createElement('tr');
            
            const categoryCell = document.createElement('td');
            categoryCell.textContent = category.label;
            categoryCell.style.border = '1px solid #ddd';
            categoryCell.style.padding = '8px';
            
            const ratingCell = document.createElement('td');
            ratingCell.textContent = `${currentUserTypeRating[category.key]} / 5`;
            ratingCell.style.border = '1px solid #ddd';
            ratingCell.style.padding = '8px';
            
            row.appendChild(categoryCell);
            row.appendChild(ratingCell);
            tableBody.appendChild(row);
        });
        
        ratingTable.appendChild(tableBody);
        existingRatingsContent.appendChild(ratingTable);
        
        // Add comments if any
        if (currentUserTypeRating.comments) {
            const commentsDiv = document.createElement('div');
            commentsDiv.style.marginTop = '15px';
            
            const commentsHeader = document.createElement('strong');
            commentsHeader.textContent = 'Comments:';
            commentsDiv.appendChild(commentsHeader);
            
            const commentsPara = document.createElement('p');
            commentsPara.textContent = currentUserTypeRating.comments;
            commentsPara.style.marginTop = '5px';
            commentsDiv.appendChild(commentsPara);
            
            existingRatingsContent.appendChild(commentsDiv);
        }
        
        // Add a note about the rating policy
        const policyNote = document.createElement('div');
        policyNote.style.marginTop = '15px';
        policyNote.style.padding = '10px';
        policyNote.style.backgroundColor = '#d9edf7';
        policyNote.style.border = '1px solid #bce8f1';
        policyNote.style.borderRadius = '4px';
        policyNote.style.color = '#31708f';
        policyNote.textContent = `Note: Each TA can only receive one rating from a ${currentUserType}. This TA has already been rated by a ${currentUserType}.`;
        existingRatingsContent.appendChild(policyNote);
    } else {
        // This user type hasn't rated this TA yet, show the form
        ratingForm.style.display = 'block';
        existingRatingsContainer.style.display = 'none';
    }
}

function showConfirmationScreen() {
    loginContainer.style.display = 'none';
    taSelectionContainer.style.display = 'none';
    ratingContainer.style.display = 'none';
    confirmationContainer.style.display = 'block';
    
    // Reset body style
    document.body.className = 'centered';
    document.body.style.display = 'flex';
    document.body.style.height = '100vh';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
} 