// This code should be pasted in the Google Apps Script editor
// linked to your Google Sheet containing user data

// Define sheet names
const SHEETS = {
  USERS: 'Users',
  TAS: 'TAs',
  RATINGS: 'Ratings'
};

// Allowed origin (replace with your website's URL for better security)
const ALLOWED_ORIGIN = '*'; 

function doGet(e) {
  let responseData;
  let output;
  try {
    const action = e.parameter.action || '';
    Logger.log('Executing doGet for action: ' + action);
    switch (action) {
      case 'getUsers':
        responseData = getUsersData();
        break;
      case 'getUserData':
        responseData = getUserDataLogic(e.parameter.phone);
        break;
      case 'getTAs':
        responseData = getTAsData();
        break;
      case 'getTARatings':
        responseData = getTARatingsLogic(e.parameter.taId);
        break;
      case 'getReviewPeriods':
        responseData = getReviewPeriodsLogic(e.parameter.taId, e.parameter.raterType);
        break;
      case 'submitRating': // Added case for handling rating submission via GET
        Logger.log('Handling submitRating via GET');
        // Construct the data object from parameters, excluding 'action'
        const ratingData = { ...e.parameter }; // Copy all parameters
        delete ratingData.action; // Remove the action parameter itself
        // Potentially parse comma-separated strings back to arrays if needed by submitRatingLogic
        // Example: if (ratingData.criteria_1) ratingData.criteria_1 = ratingData.criteria_1.split(',');
        // Adjust the above based on how submitRatingLogic expects checkbox data
        responseData = submitRatingLogic(ratingData); // Call the submission logic
        break;
      default:
        // Default to getUsers if action is missing or unknown in GET
        Logger.log('Unknown or missing action in GET, defaulting to getUsers');
        responseData = getUsersData(); 
        break;
    }
    // Create standard ContentService response (NO explicit CORS headers here)
    output = ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
    Logger.log('doGet successful for action: ' + action);

  } catch (error) {
    Logger.log('Error in doGet: ' + error.message + ' for action: ' + (e && e.parameter ? e.parameter.action : 'N/A'));
    responseData = { error: error.message, status: 'error' };
    // Create error response (NO explicit CORS headers here)
    output = ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
  }
  // Return the response directly
  return output; 
}

function doPost(e) {
  let responseData;
  let output;
  Logger.log('Processing POST/OPTIONS request');

  try {
    // Explicitly check for OPTIONS or empty/invalid POST
    // A typical preflight OPTIONS request won't have postData.contents or might have a different type.
    if (!e.postData || !e.postData.contents || e.postData.type !== 'application/json') {
      Logger.log('Handling OPTIONS request or invalid/empty POST.');
      // For OPTIONS, just return OK with CORS headers
      output = ContentService.createTextOutput(); // Empty content is fine for OPTIONS success (status 2xx)
      // Set MimeType even for empty response for consistency
      output.setMimeType(ContentService.MimeType.JSON); 
      // --- Add CORS headers IMMEDIATELY for OPTIONS ---
      Logger.log('Adding CORS headers for OPTIONS/invalid POST response');
      output.addHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
      // Include GET here just in case, but POST/OPTIONS are key for doPost
      output.addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); 
      output.addHeader('Access-Control-Allow-Headers', 'Content-Type'); // Reflect allowed headers
      output.addHeader('Access-Control-Max-Age', '86400'); // Optional: Cache preflight response
      Logger.log('Returning response for OPTIONS/invalid POST.');
      return output; // <<< Return immediately for OPTIONS
    } else {
      // Process actual POST data
      const data = JSON.parse(e.postData.contents);
      const action = data.action || '';
      Logger.log('POST action: ' + action);
      switch (action) {
        case 'submitRating':
          responseData = submitRatingLogic(data.data);
          break;
        // Add other POST actions here if needed in the future
        // case 'anotherPostAction':
        //   responseData = handleAnotherAction(data.details);
        //   break;
        default:
          responseData = { error: 'Invalid POST action', status: 'error' };
          break;
      }
      Logger.log('POST request processed successfully for action: ' + action);
      // Create ContentService response for the processed POST data
      output = ContentService.createTextOutput(JSON.stringify(responseData))
        .setMimeType(ContentService.MimeType.JSON);
      // --- Add CORS headers for actual POST response ---
      Logger.log('Adding CORS headers for POST response');
      output.addHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
      output.addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS'); // Consistent methods
      output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
      output.addHeader('Access-Control-Max-Age', '86400');
      Logger.log('Returning response for POST.');
      return output; // <<< Return POST response
    }
  } catch (error) {
    Logger.log('Error processing POST/OPTIONS request: ' + error.message + '\nStack: ' + (error.stack ? error.stack : 'N/A'));
    responseData = { error: 'Error processing request: ' + error.message, status: 'error' };
    // Create error response
    output = ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.json);
    // --- Add CORS headers even for errors ---
    // Important: browsers might block rendering the error response if CORS headers are missing
    Logger.log('Adding CORS headers for error response');
    output.addHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    output.addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
    output.addHeader('Access-Control-Max-Age', '86400');
    Logger.log('Returning error response.');
    return output; // <<< Return error response
  }
  // Note: The structure above with returns in each block should prevent reaching here.
  // If somehow it does, create a generic error and add headers.
  // Logger.log('Fallback: Code reached end of doPost unexpectedly.');
  // responseData = { error: 'Unexpected server state in doPost', status: 'error' };
  // output = ContentService.createTextOutput(JSON.stringify(responseData))
  //   .setMimeType(ContentService.MimeType.JSON);
  // output.addHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  // output.addHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  // output.addHeader('Access-Control-Allow-Headers', 'Content-Type');
  // output.addHeader('Access-Control-Max-Age', '86400');
  // return output;
}

// Get all users data logic
function getUsersData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
  // Add error handling for missing sheet
  if (!sheet) { 
      Logger.log('Error: Users sheet not found'); 
      return { users: [], status: 'error', message: 'Users sheet not found' }; 
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const users = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const user = {};
    for (let j = 0; j < headers.length; j++) {
      // Check if headers[j] exists before calling trim
      const headerName = headers[j] ? String(headers[j]).trim() : 'Column_' + j;
      let value = row[j];
      value = (value === null || value === undefined) ? '' : String(value).trim();
      user[headerName] = value;
    }
    // Ensure checks are using the actual header names from the sheet
    const phoneKey = Object.keys(user).find(k => k.toLowerCase() === 'phonenumber');
    const passwordKey = Object.keys(user).find(k => k.toLowerCase() === 'password');
    if (phoneKey && user[phoneKey] && passwordKey && user[passwordKey]) {
      users.push(user);
    }
  }
  return { users: users, status: 'success' };
}

// Get user data by phone number logic
function getUserDataLogic(phone) {
  if (!phone) return { error: 'Phone number is required', status: 'error' };
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.USERS);
  // Add error handling for missing sheet
  if (!sheet) { 
      Logger.log('Error: Users sheet not found'); 
      return { error: 'Users sheet not found', status: 'error' }; 
  }
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const phoneIndex = headers.findIndex(h => h && String(h).trim().toLowerCase() === 'phonenumber');
  if (phoneIndex === -1) return { error: 'Phone number column not found', status: 'error' };
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (String(row[phoneIndex]).trim() === String(phone).trim()) {
      const user = {};
      for (let j = 0; j < headers.length; j++) {
        const headerName = headers[j] ? String(headers[j]).trim() : 'Column_' + j;
        user[headerName] = String(row[j] || '').trim();
      }
      return { userType: user.userType || '', name: user.name || '', phone: user.phoneNumber || '', status: 'success' };
    }
  }
  return { error: 'User not found', status: 'error' };
}

// Get all TAs data logic
function getTAsData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.TAS);
    if (!sheet) { 
        Logger.log('TAs sheet not found, creating sample sheet');
        return createSampleTASheetLogic();
    }
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const tas = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const ta = {};
      for (let j = 0; j < headers.length; j++) {
        const headerName = headers[j] ? String(headers[j]).trim() : 'Column_' + j;
        ta[headerName] = String(row[j] || '').trim();
      }
      const idKey = Object.keys(ta).find(k => k.toLowerCase() === 'taid');
      const nameKey = Object.keys(ta).find(k => k.toLowerCase() === 'name');
      const statusKey = Object.keys(ta).find(k => k.toLowerCase() === 'status');
      if (idKey && ta[idKey] && nameKey && ta[nameKey] && ta[statusKey] !== 'inactive') {
        tas.push({ taId: ta[idKey], name: ta[nameKey], department: ta.department || '' });
      }
    }
    return { tas: tas, status: 'success' };
  } catch (error) {
    Logger.log('Error in getTAsData: ' + error.message);
    return { tas: sampleTAs, status: 'success' };
  }
}

// Get ratings for a specific TA
function getTARatingsLogic(taId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.RATINGS);
    if (!sheet) {
      Logger.log('Ratings sheet not found.');
      return { status: 'error', message: 'Ratings data not found', ratings: [] };
    }

    const allRatings = sheet.getDataRange().getValues();
    if (allRatings.length <= 1) {
      // Only header row exists or sheet is empty
      return { status: 'success', message: 'No ratings found for this TA', ratings: [] };
    }

    const headers = allRatings[0];
    // Find index of taId column
    const taIdIndex = headers.findIndex(h => h && String(h).trim().toLowerCase() === 'taid');
    
    if (taIdIndex === -1) {
      Logger.log('Error: taId column not found in Ratings sheet.');
      return { status: 'error', message: 'Ratings sheet column configuration error.', ratings: [] };
    }

    // Filter ratings for the specified TA
    const taRatings = [];
    for (let i = 1; i < allRatings.length; i++) {
      const row = allRatings[i];
      if (row.length > taIdIndex && String(row[taIdIndex]).trim() === String(taId).trim()) {
        // Convert row to object using headers
        const rating = {};
        for (let j = 0; j < headers.length; j++) {
          if (headers[j]) {
            rating[headers[j]] = row[j];
          }
        }
        taRatings.push(rating);
      }
    }

    return { 
      status: 'success', 
      message: taRatings.length > 0 ? 'Ratings found' : 'No ratings found for this TA', 
      ratings: taRatings 
    };
  } catch (error) {
    Logger.log('Error in getTARatingsLogic: ' + error.message + '\nStack: ' + error.stack);
    return { status: 'error', message: 'Failed to retrieve ratings: ' + error.message, ratings: [] };
  }
}

// Submit a new rating logic
function submitRatingLogic(data) {
  try {
    if (!data.taId || !data.raterPhone || !data.raterType) return { error: 'Missing required fields', status: 'error' };
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.RATINGS);
    if (!sheet) {
      Logger.log('Ratings sheet not found, creating it.');
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEETS.RATINGS);
      // Updated headers to include startDate and endDate
      sheet.appendRow(['ratingId', 'taId', 'taName', 'raterPhone', 'raterName', 'raterType', 'startDate', 'endDate', 'timestamp', 'discipline', 'ethics', 'knowledge', 'communication', 'teamwork', 'comments']);
    }
    const allRatings = sheet.getDataRange().getValues();
    const headers = allRatings[0];
    // Robust header index finding
    const findIndex = (name) => headers.findIndex(h => h && String(h).trim().toLowerCase() === name.toLowerCase());
    const taIdIndex = findIndex('taId');
    const raterPhoneIndex = findIndex('raterPhone');
    const raterTypeIndex = findIndex('raterType');
    const startDateIndex = findIndex('startDate');
    const endDateIndex = findIndex('endDate');

    if (taIdIndex === -1 || raterPhoneIndex === -1 || raterTypeIndex === -1) {
        Logger.log('Error: Missing required columns (taId, raterPhone, raterType) in Ratings sheet.');
        return { status: 'error', message: 'Ratings sheet column configuration error.' };
    }

    // Check for duplicate rating (same TA, rater, and overlapping date range)
    let existingRating = false;
    for (let i = 1; i < allRatings.length; i++) {
      const row = allRatings[i];
      // Ensure row has enough columns before accessing indices
      if (row.length > Math.max(taIdIndex, raterPhoneIndex, raterTypeIndex) && 
          String(row[taIdIndex]).trim() === String(data.taId).trim() && 
          String(row[raterPhoneIndex]).trim() === String(data.raterPhone).trim() && 
          String(row[raterTypeIndex]).trim() === String(data.raterType).trim()) {
        
        // Check for date range overlap if both current and existing ratings have date ranges
        if (data.startDate && data.endDate && startDateIndex !== -1 && endDateIndex !== -1 && 
            row[startDateIndex] && row[endDateIndex]) {
          const existingStart = new Date(row[startDateIndex]);
          const existingEnd = new Date(row[endDateIndex]);
          const newStart = new Date(data.startDate);
          const newEnd = new Date(data.endDate);
          
          // Check for overlap: new period overlaps with existing period
          if (newStart <= existingEnd && newEnd >= existingStart) {
            Logger.log('Date range overlap detected.');
            return { status: 'error', message: 'Rating period overlaps with existing review period' };
          }
        } else {
          // If no date ranges, treat as duplicate (old behavior)
          existingRating = true;
          break;
        }
      }
    }
    if (existingRating) {
        Logger.log('Duplicate rating attempt detected.');
        return { status: 'error', message: 'You have already rated this TA' };
    }

    // Note: Removed the typeAlreadyRated check since we now allow multiple ratings 
    // per user type for different date ranges

    const ratingId = Utilities.getUuid();
    // Updated data order to include startDate and endDate
    sheet.appendRow([
      ratingId, 
      data.taId, 
      data.taName || '', 
      data.raterPhone, 
      data.raterName || '', 
      data.raterType, 
      data.startDate || '', 
      data.endDate || '', 
      data.timestamp || new Date().toISOString(), 
      data.discipline || 0, 
      data.ethics || 0, 
      data.knowledge || 0, 
      data.communication || 0, 
      data.teamwork || 0, 
      data.comments || ''
    ]);
    Logger.log('Rating submitted successfully with ID: ' + ratingId);
    return { status: 'success', message: 'Rating submitted successfully', ratingId: ratingId };
  } catch (error) {
    Logger.log('Error in submitRatingLogic: ' + error.message + '\nStack: ' + error.stack);
    return { status: 'error', message: 'Failed to submit rating: ' + error.message };
  }
}

// Get review periods for a specific TA and user type
function getReviewPeriodsLogic(taId, raterType) {
  try {
    if (!taId || !raterType) {
      return { status: 'error', message: 'TA ID and rater type are required', periods: [] };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.RATINGS);
    if (!sheet) {
      Logger.log('Ratings sheet not found.');
      return { status: 'success', message: 'No review periods found', periods: [] };
    }

    const allRatings = sheet.getDataRange().getValues();
    if (allRatings.length <= 1) {
      // Only header row exists or sheet is empty
      return { status: 'success', message: 'No review periods found', periods: [] };
    }

    const headers = allRatings[0];
    // Find indices of required columns
    const findIndex = (name) => headers.findIndex(h => h && String(h).trim().toLowerCase() === name.toLowerCase());
    const taIdIndex = findIndex('taId');
    const raterTypeIndex = findIndex('raterType');
    const startDateIndex = findIndex('startDate');
    const endDateIndex = findIndex('endDate');
    const timestampIndex = findIndex('timestamp');
    const ratingIdIndex = findIndex('ratingId');
    
    if (taIdIndex === -1 || raterTypeIndex === -1) {
      Logger.log('Error: Required columns not found in Ratings sheet.');
      return { status: 'error', message: 'Ratings sheet configuration error', periods: [] };
    }

    // Filter review periods for the specified TA and user type
    const reviewPeriods = [];
    for (let i = 1; i < allRatings.length; i++) {
      const row = allRatings[i];
      if (row.length > Math.max(taIdIndex, raterTypeIndex) && 
          String(row[taIdIndex]).trim() === String(taId).trim() && 
          String(row[raterTypeIndex]).trim() === String(raterType).trim()) {
        
        const period = {
          periodId: ratingIdIndex !== -1 ? row[ratingIdIndex] : row[timestampIndex] || i.toString(),
          taId: row[taIdIndex],
          raterType: row[raterTypeIndex],
          startDate: startDateIndex !== -1 ? row[startDateIndex] : '',
          endDate: endDateIndex !== -1 ? row[endDateIndex] : '',
          timestamp: timestampIndex !== -1 ? row[timestampIndex] : ''
        };
        
        reviewPeriods.push(period);
      }
    }

    // Sort by timestamp (newest first)
    reviewPeriods.sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB - dateA;
    });

    return { 
      status: 'success', 
      message: reviewPeriods.length > 0 ? 'Review periods found' : 'No review periods found', 
      periods: reviewPeriods 
    };
  } catch (error) {
    Logger.log('Error in getReviewPeriodsLogic: ' + error.message + '\nStack: ' + error.stack);
    return { status: 'error', message: 'Failed to retrieve review periods: ' + error.message, periods: [] };
  }
}

// Sample TA data for fallback/creation
const sampleTAs = [
  { taId: "ta1", name: "Alex Johnson", department: "IT" },
  { taId: "ta2", name: "Maria Garcia", department: "HR" },
  { taId: "ta3", name: "Sam Wilson", department: "Finance" }
];

// Create sample TA sheet logic
function createSampleTASheetLogic() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEETS.TAS);
    // Ensure headers match sample data keys
    sheet.appendRow(['taId', 'name', 'department', 'status']); 
    sampleTAs.forEach(ta => sheet.appendRow([ta.taId, ta.name, ta.department, 'active']));
    return { tas: sampleTAs, status: 'success' };
  } catch (error) {
    Logger.log('Error creating sample TA sheet: ' + error.message);
    return { tas: sampleTAs, status: 'success' };
  }
}

// For testing in the script editor
function testDoGet() {
  const result = doGet({parameter: {action: 'getTAs'}});
  Logger.log(result.getContent());
}

function testSubmitRating() {
  const testData = {
    taId: "ta1",
    taName: "Alex Johnson",
    raterPhone: "1234567890",
    raterName: "Test Mentor",
    raterType: "mentor",
    startDate: "01/01/2024",
    endDate: "31/03/2024",
    discipline: 4,
    ethics: 5,
    knowledge: 3,
    communication: 4,
    teamwork: 5,
    comments: "Test comment",
    timestamp: new Date().toISOString()
  };
  const result = doPost({ postData: { contents: JSON.stringify({ action: 'submitRating', data: testData }) } });
  Logger.log(result.getContent());
} 