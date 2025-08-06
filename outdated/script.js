// Global variables
let users = [];
let taList = [];
let dataLoaded = false;
let currentUserType = '';
let currentUserPhone = '';
let currentUserName = '';
let selectedTAId = '';
let selectedTAName = '';
let selectedStartDate = '';
let selectedEndDate = '';
let existingReviewPeriods = [];
const MINIMUM_REVIEW_PERIOD_DAYS = 90; // Configurable minimum period
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
const reviewManagementContainer = document.getElementById('reviewManagementContainer');
const dateRangeModal = document.getElementById('dateRangeModal');
const userDisplayName = document.getElementById('userDisplayName');
const userDisplayName2 = document.getElementById('userDisplayName2');
const userDisplayName3 = document.getElementById('userDisplayName3');
const userDisplayName4 = document.getElementById('userDisplayName4');
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

// New DOM elements for date range functionality
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const dateRangeError = document.getElementById('dateRangeError');
const addReviewBtn = document.getElementById('addReviewBtn');
const proceedWithDatesBtn = document.getElementById('proceedWithDatesBtn');
const existingReviewsList = document.getElementById('existingReviewsList');
const reviewManagementTAName = document.getElementById('reviewManagementTAName');
const reviewPeriodDisplay = document.getElementById('reviewPeriodDisplay');

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

// Fetch existing review periods for a TA and user type
async function fetchExistingReviewPeriods() {
    try {
        showLoading('Loading existing reviews...');
        
        const response = await fetch(`${apiUrl}?action=getReviewPeriods&taId=${selectedTAId}&raterType=${currentUserType}`);
        if (!response.ok) {
            throw new Error('Failed to fetch review periods');
        }
        
        const data = await response.json();
        existingReviewPeriods = data.periods || [];
        
        hideLoading();
    } catch (error) {
        console.error('Error fetching review periods:', error);
        existingReviewPeriods = [];
        hideLoading();
    }
}

// Date utility functions
function parseDate(dateString) {
    // Parse DD/MM/YYYY format
    const parts = dateString.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

function formatDateForInput(date) {
    // Format for HTML date input (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
}

function formatDateForDisplay(date) {
    // Format as DD/MM/YYYY
    return date.toLocaleDateString('en-GB');
}

// Date validation functions
function setDateConstraints() {
    const today = new Date();
    const maxDate = formatDateForInput(today);
    
    // Set max date as today for both inputs
    startDateInput.max = maxDate;
    endDateInput.max = maxDate;
    
    if (existingReviewPeriods.length > 0) {
        // Find the latest end date
        const latestEndDate = existingReviewPeriods.reduce((latest, period) => {
            const periodEndDate = parseDate(period.endDate);
            return periodEndDate > latest ? periodEndDate : latest;
        }, new Date(0));
        
        // Start date must be after latest end date
        const minStartDate = new Date(latestEndDate);
        minStartDate.setDate(minStartDate.getDate() + 1);
        startDateInput.min = formatDateForInput(minStartDate);
    } else {
        // No existing reviews, can start from any past date
        startDateInput.min = '2020-01-01'; // Reasonable minimum
    }
}

function validateDateRange() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    dateRangeError.style.display = 'none';
    
    if (!startDateInput.value || !endDateInput.value) {
        return false;
    }
    
    // Check if end date is after start date
    if (endDate <= startDate) {
        showDateError('End date must be after start date');
        return false;
    }
    
    // Check minimum period (exactly 90 days)
    const daysDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDifference < MINIMUM_REVIEW_PERIOD_DAYS) {
        showDateError(`Review period must be at least ${MINIMUM_REVIEW_PERIOD_DAYS} days`);
        return false;
    }
    
    // Check for overlaps with existing periods
    const hasOverlap = existingReviewPeriods.some(period => {
        const periodStart = parseDate(period.startDate);
        const periodEnd = parseDate(period.endDate);
        
        return (startDate <= periodEnd && endDate >= periodStart);
    });
    
    if (hasOverlap) {
        showDateError('Date range overlaps with existing review period');
        return false;
    }
    
    return true;
}

function showDateError(message) {
    dateRangeError.textContent = message;
    dateRangeError.style.display = 'block';
}

// Review Management Screen Functions
async function showReviewManagement() {
    // Hide other containers
    loginContainer.style.display = 'none';
    taSelectionContainer.style.display = 'none';
    ratingContainer.style.display = 'none';
    confirmationContainer.style.display = 'none';
    reviewManagementContainer.style.display = 'block';
    
    // Update TA name display
    reviewManagementTAName.textContent = selectedTAName;
    
    // Fetch existing review periods for this TA and current user type
    await fetchExistingReviewPeriods();
    
    // Display existing reviews and add button
    displayExistingReviews();
    
    // Set body style
    document.body.className = '';
    document.body.style.display = 'block';
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';
}

function displayExistingReviews() {
    const reviewsList = existingReviewsList;
    
    // Clear existing content
    reviewsList.innerHTML = '';
    
    if (existingReviewPeriods.length === 0) {
        // No reviews - center the Add Review button
        reviewsList.innerHTML = '<p>No reviews found for this TA.</p>';
        addReviewBtn.textContent = '+ Add First Review';
        addReviewBtn.style.margin = '20px auto';
        addReviewBtn.style.display = 'block';
    } else {
        // Show existing reviews
        existingReviewPeriods.forEach(period => {
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            reviewItem.style.display = 'flex';
            reviewItem.style.justifyContent = 'space-between';
            reviewItem.style.alignItems = 'center';
            reviewItem.style.padding = '10px';
            reviewItem.style.margin = '10px 0';
            reviewItem.style.border = '1px solid #ddd';
            reviewItem.style.borderRadius = '5px';
            reviewItem.style.backgroundColor = '#f9f9f9';
            
            reviewItem.innerHTML = `
                <div>
                    <div class="review-period" style="font-weight: bold;">${period.startDate} - ${period.endDate}</div>
                    <div class="review-info" style="color: #666; font-size: 0.9em;">${period.raterType} | ${new Date(period.timestamp).toLocaleDateString('en-GB')}</div>
                </div>
                <button onclick="viewReviewDetails('${period.periodId || period.timestamp}')" class="btn-secondary" style="padding: 5px 10px; background-color: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">View</button>
            `;
            reviewsList.appendChild(reviewItem);
        });
        
        // Add button at top-right
        addReviewBtn.textContent = '+ Add Review';
        addReviewBtn.style.margin = '0';
        addReviewBtn.style.float = 'right';
        addReviewBtn.style.marginBottom = '20px';
    }
}

function showDateRangeModal() {
    dateRangeModal.style.display = 'block';
    
    // Set minimum start date based on last review end date
    setDateConstraints();
    
    // Reset form
    startDateInput.value = '';
    endDateInput.value = '';
    dateRangeError.style.display = 'none';
    proceedWithDatesBtn.disabled = true;
}

function showRatingScreenWithDateRange() {
    // Hide other containers
    reviewManagementContainer.style.display = 'none';
    dateRangeModal.style.display = 'none';
    ratingContainer.style.display = 'block';
    
    // Update displays
    selectedTANameDisplay.textContent = selectedTAName;
    reviewPeriodDisplay.textContent = `${selectedStartDate} - ${selectedEndDate}`;
    
    // Reset and show form
    ratingForm.reset();
    ratingForm.style.display = 'block';
    
    // Set body style for scrollable content
    document.body.className = '';
    document.body.style.display = 'block';
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';
}

// New function to show rating screen with existing data display
async function showRatingScreenWithPreviousData() {
    // Hide other containers
    reviewManagementContainer.style.display = 'none';
    dateRangeModal.style.display = 'none';
    ratingContainer.style.display = 'block';
    
    // Update displays
    selectedTANameDisplay.textContent = selectedTAName;
    
    // Fetch existing review periods to show in dropdown
    await fetchExistingReviewPeriods();
    
    // Create rating controls (dropdown and add button)
    createRatingControls();
    
    // Show the most recent rating by default if available
    if (existingReviewPeriods.length > 0) {
        await displayRatingForPeriod(existingReviewPeriods[0]);
    } else {
        // No existing ratings, show new rating form
        reviewPeriodDisplay.textContent = 'No previous ratings found';
        ratingForm.style.display = 'block';
        ratingForm.reset();
    }
    
    // Set body style for scrollable content
    document.body.className = '';
    document.body.style.display = 'block';
    document.body.style.height = 'auto';
    document.body.style.minHeight = '100vh';
    document.body.style.overflow = 'auto';
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

// Create rating controls (dropdown and add new button)
function createRatingControls() {
    // Remove existing controls if any
    const existingControls = document.getElementById('ratingControls');
    if (existingControls) {
        existingControls.remove();
    }
    
    // Create controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'ratingControls';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'space-between';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.marginBottom = '20px';
    controlsContainer.style.padding = '10px';
    controlsContainer.style.backgroundColor = '#f8f9fa';
    controlsContainer.style.borderRadius = '5px';
    controlsContainer.style.border = '1px solid #dee2e6';
    
    // Create date range dropdown (left side)
    const dropdownContainer = document.createElement('div');
    dropdownContainer.style.position = 'relative';
    
    const dropdownButton = document.createElement('button');
    dropdownButton.id = 'dateRangeDropdown';
    dropdownButton.type = 'button';
    dropdownButton.className = 'secondary-btn';
    dropdownButton.style.padding = '8px 16px';
    dropdownButton.style.backgroundColor = '#6c757d';
    dropdownButton.style.color = 'white';
    dropdownButton.style.border = 'none';
    dropdownButton.style.borderRadius = '5px';
    dropdownButton.style.cursor = 'pointer';
    dropdownButton.textContent = existingReviewPeriods.length > 0 ? 
        `${existingReviewPeriods[0].startDate} - ${existingReviewPeriods[0].endDate} ▼` : 
        'No previous ratings ▼';
    
    const dropdownMenu = document.createElement('div');
    dropdownMenu.id = 'dateRangeDropdownMenu';
    dropdownMenu.style.position = 'absolute';
    dropdownMenu.style.top = '100%';
    dropdownMenu.style.left = '0';
    dropdownMenu.style.backgroundColor = 'white';
    dropdownMenu.style.border = '1px solid #ccc';
    dropdownMenu.style.borderRadius = '5px';
    dropdownMenu.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    dropdownMenu.style.zIndex = '1000';
    dropdownMenu.style.minWidth = '200px';
    dropdownMenu.style.display = 'none';
    
    // Populate dropdown menu with existing periods
    existingReviewPeriods.forEach((period, index) => {
        const menuItem = document.createElement('div');
        menuItem.style.padding = '10px 15px';
        menuItem.style.cursor = 'pointer';
        menuItem.style.borderBottom = index < existingReviewPeriods.length - 1 ? '1px solid #eee' : 'none';
        menuItem.textContent = `${period.startDate} - ${period.endDate}`;
        
        menuItem.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        menuItem.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
        });
        
        menuItem.addEventListener('click', function() {
            dropdownButton.textContent = `${period.startDate} - ${period.endDate} ▼`;
            dropdownMenu.style.display = 'none';
            displayRatingForPeriod(period);
        });
        
        dropdownMenu.appendChild(menuItem);
    });
    
    // Dropdown toggle functionality
    dropdownButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const isVisible = dropdownMenu.style.display === 'block';
        dropdownMenu.style.display = isVisible ? 'none' : 'block';
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdownMenu.style.display = 'none';
    });
    
    dropdownContainer.appendChild(dropdownButton);
    dropdownContainer.appendChild(dropdownMenu);
    
    // Create Add New Rating button (right side)
    const addNewButton = document.createElement('button');
    addNewButton.id = 'addNewRatingBtn';
    addNewButton.type = 'button';
    addNewButton.className = 'primary-btn';
    addNewButton.style.padding = '8px 16px';
    addNewButton.style.backgroundColor = '#007bff';
    addNewButton.style.color = 'white';
    addNewButton.style.border = 'none';
    addNewButton.style.borderRadius = '5px';
    addNewButton.style.cursor = 'pointer';
    addNewButton.textContent = '+ Add New Rating';
    
    addNewButton.addEventListener('click', function() {
        showDateRangeModal();
    });
    
    controlsContainer.appendChild(dropdownContainer);
    controlsContainer.appendChild(addNewButton);
    
    // Insert controls after TA name but before review period display
    const contentDiv = ratingContainer.querySelector('.content');
    const taNameElement = document.getElementById('selectedTAName');
    taNameElement.parentNode.insertBefore(controlsContainer, taNameElement.nextSibling);
}

// Display rating data for a specific period
async function displayRatingForPeriod(period) {
    try {
        showLoading('Loading rating data...');
        
        // Update period display
        reviewPeriodDisplay.textContent = `${period.startDate} - ${period.endDate}`;
        reviewPeriodDisplay.style.display = 'block';
        
        // Fetch all ratings for this TA
        const response = await fetch(`${apiUrl}?action=getTARatings&taId=${selectedTAId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch ratings');
        }
        
        const data = await response.json();
        
        // Find the specific rating for this period and user type
        const periodRating = data.ratings.find(rating => 
            rating.raterType === currentUserType &&
            rating.startDate === period.startDate &&
            rating.endDate === period.endDate
        );
        
        if (periodRating) {
            // Show existing rating data (read-only)
            displayExistingRating(periodRating);
            ratingForm.style.display = 'none';
        } else {
            // No rating found for this period, show empty form
            reviewPeriodDisplay.textContent = `${period.startDate} - ${period.endDate} (No rating found)`;
            ratingForm.style.display = 'block';
            ratingForm.reset();
        }
        
        hideLoading();
    } catch (error) {
        console.error('Error loading rating data:', error);
        hideLoading();
        reviewPeriodDisplay.textContent = `${period.startDate} - ${period.endDate} (Error loading)`;
        ratingForm.style.display = 'none';
    }
}

// Display existing rating data in a read-only format
function displayExistingRating(rating) {
    // Remove existing rating display if any
    const existingDisplay = document.getElementById('existingRatingDisplay');
    if (existingDisplay) {
        existingDisplay.remove();
    }
    
    // Create rating display container
    const ratingDisplay = document.createElement('div');
    ratingDisplay.id = 'existingRatingDisplay';
    ratingDisplay.style.marginTop = '20px';
    ratingDisplay.style.padding = '20px';
    ratingDisplay.style.border = '1px solid #ddd';
    ratingDisplay.style.borderRadius = '5px';
    ratingDisplay.style.backgroundColor = '#f8f9fa';
    
    // Create header
    const header = document.createElement('h4');
    header.textContent = 'Rating Details';
    header.style.marginBottom = '15px';
    header.style.color = '#495057';
    ratingDisplay.appendChild(header);
    
    // Create rater info
    const raterInfo = document.createElement('p');
    raterInfo.innerHTML = `<strong>Rated by:</strong> ${rating.raterName} (${rating.raterType})<br>`;
    raterInfo.innerHTML += `<strong>Date:</strong> ${new Date(rating.timestamp).toLocaleDateString('en-GB')}`;
    raterInfo.style.marginBottom = '15px';
    ratingDisplay.appendChild(raterInfo);
    
    // Create ratings table
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginBottom = '15px';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const categoryHeader = document.createElement('th');
    categoryHeader.textContent = 'Category';
    categoryHeader.style.border = '1px solid #ddd';
    categoryHeader.style.padding = '10px';
    categoryHeader.style.backgroundColor = '#e9ecef';
    categoryHeader.style.textAlign = 'left';
    
    const ratingHeader = document.createElement('th');
    ratingHeader.textContent = 'Rating';
    ratingHeader.style.border = '1px solid #ddd';
    ratingHeader.style.padding = '10px';
    ratingHeader.style.backgroundColor = '#e9ecef';
    ratingHeader.style.textAlign = 'center';
    
    headerRow.appendChild(categoryHeader);
    headerRow.appendChild(ratingHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    
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
        categoryCell.style.padding = '10px';
        
        const ratingCell = document.createElement('td');
        const ratingValue = rating[category.key] || 0;
        ratingCell.style.border = '1px solid #ddd';
        ratingCell.style.padding = '10px';
        ratingCell.style.textAlign = 'center';
        
        // Create star display
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= ratingValue) {
                starsHtml += '<span style="color: #ffc107;">★</span>';
            } else {
                starsHtml += '<span style="color: #e9ecef;">★</span>';
            }
        }
        starsHtml += ` (${ratingValue}/5)`;
        ratingCell.innerHTML = starsHtml;
        
        row.appendChild(categoryCell);
        row.appendChild(ratingCell);
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    ratingDisplay.appendChild(table);
    
    // Add comments if any
    if (rating.comments) {
        const commentsSection = document.createElement('div');
        commentsSection.style.marginTop = '15px';
        
        const commentsHeader = document.createElement('strong');
        commentsHeader.textContent = 'Comments:';
        commentsSection.appendChild(commentsHeader);
        
        const commentsText = document.createElement('p');
        commentsText.textContent = rating.comments;
        commentsText.style.marginTop = '5px';
        commentsText.style.padding = '10px';
        commentsText.style.backgroundColor = 'white';
        commentsText.style.border = '1px solid #ddd';
        commentsText.style.borderRadius = '3px';
        commentsSection.appendChild(commentsText);
        
        ratingDisplay.appendChild(commentsSection);
    }
    
    // Insert rating display after review period display
    reviewPeriodDisplay.parentNode.insertBefore(ratingDisplay, reviewPeriodDisplay.nextSibling);
}

// Update user display elements
function updateUserDisplays() {
    const userInfo = `${currentUserName} (${currentUserType})`;
    console.log('Updating UI with user:', userInfo);
    
    // Update all user display elements
    if (userDisplayName) userDisplayName.textContent = userInfo;
    if (userDisplayName2) userDisplayName2.textContent = userInfo;
    if (userDisplayName3) userDisplayName3.textContent = userInfo;
    if (userDisplayName4) userDisplayName4.textContent = userInfo;
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
    
    // Go to Rating Screen with previous data display
    await showRatingScreenWithPreviousData();
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
        startDate: selectedStartDate,        // NEW
        endDate: selectedEndDate,            // NEW
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
    showTASelection();
    
    // Reset form
    ratingForm.reset();
});

// Rate another button
rateAnotherBtn.addEventListener('click', function() {
    showTASelection();
});

// Logout buttons
[logoutButton, logoutButton2, logoutButton3].forEach(button => {
    button.addEventListener('click', logout);
});

// Date range functionality event listeners
addReviewBtn.addEventListener('click', showDateRangeModal);

startDateInput.addEventListener('change', function() {
    if (startDateInput.value) {
        // Set minimum end date to start date + minimum period
        const startDate = new Date(startDateInput.value);
        const minEndDate = new Date(startDate);
        minEndDate.setDate(minEndDate.getDate() + MINIMUM_REVIEW_PERIOD_DAYS);
        endDateInput.min = formatDateForInput(minEndDate);
    }
    
    if (startDateInput.value && endDateInput.value) {
        proceedWithDatesBtn.disabled = !validateDateRange();
    }
});

endDateInput.addEventListener('change', function() {
    if (startDateInput.value && endDateInput.value) {
        proceedWithDatesBtn.disabled = !validateDateRange();
    }
});

proceedWithDatesBtn.addEventListener('click', function() {
    if (validateDateRange()) {
        selectedStartDate = formatDateForDisplay(new Date(startDateInput.value));
        selectedEndDate = formatDateForDisplay(new Date(endDateInput.value));
        
        // Hide modal and show rating screen
        dateRangeModal.style.display = 'none';
        showRatingScreenWithDateRange();
    }
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
    reviewManagementContainer.style.display = 'none';
    if (dateRangeModal) dateRangeModal.style.display = 'none';
    
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
    reviewManagementContainer.style.display = 'none';
    
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
    reviewManagementContainer.style.display = 'none';
    if (dateRangeModal) dateRangeModal.style.display = 'none';
    
    // Reset body style
    document.body.className = 'centered';
    document.body.style.display = 'flex';
    document.body.style.height = '100vh';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
}

// Helper function for viewing review details
function viewReviewDetails(periodId) {
    // This function can be enhanced later to show detailed review information
    console.log('Viewing details for period:', periodId);
    // For now, just alert the user
    alert('Review details viewing will be implemented in the next update.');
}

// Helper function to close date range modal
function closeDateRangeModal() {
    if (dateRangeModal) {
        dateRangeModal.style.display = 'none';
    }
} 