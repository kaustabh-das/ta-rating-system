# TA Rating System

A simple web application for mentors and officers to rate Technical Assistants (TAs) based on various criteria. Data is fetched from and submitted to Google Sheets via Google Apps Script.

## Features

*   User login using phone number and password.
*   Fetches user data (including user type: mentor/officer) from a Google Sheet.
*   Fetches a list of active Technical Assistants (TAs) from a Google Sheet.
*   TA selection dropdown.
*   Rating form with star ratings for:
    *   Discipline
    *   Ethics
    *   Knowledge
    *   Communication
    *   Teamwork
*   Optional comments section.
*   Submits ratings to a separate Google Sheet.
*   Prevents duplicate ratings (a user of a specific type can only rate a TA once).
*   Confirmation screen after successful submission.
*   Basic responsive design.

## Setup Instructions

1.  **Google Sheets Setup:**
    *   Create a new Google Sheet.
    *   Rename the first sheet to `Users`.
    *   Add headers in the first row: `phoneNumber`, `password`, `userType`, `name`.
    *   Populate with user data.
    *   Create a second sheet named `TAs`.
    *   Add headers in the first row: `taId`, `name`, `department`, `status`.
    *   Populate with TA data (use `active` or `inactive` for status).
    *   A `Ratings` sheet will be created automatically by the script upon first submission.

2.  **Google Apps Script Deployment:**
    *   Open your Google Sheet.
    *   Go to `Extensions` > `Apps Script`.
    *   Copy the entire content of `googleAppScript.js` from this repository and paste it into the editor, replacing any default code.
    *   Save the script project (e.g., "TA Rating API").
    *   Click `Deploy` > `New deployment`.
    *   Select Type: `Web app`.
    *   Configure:
        *   Description: (Optional)
        *   Execute as: `Me`
        *   Who has access: `Anyone` (for testing) or `Anyone with Google Account` (more secure).
    *   Click `Deploy`.
    *   **Authorize** the script's permissions when prompted.
    *   Copy the **Web app URL** provided.

3.  **Configure Web App:**
    *   Open the `script.js` file in this repository.
    *   Find **ALL** instances of the placeholder `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL`.
    *   Replace them with the actual **Web app URL** you copied in the previous step.
    *   Save `script.js`.

4.  **Running Locally:**
    *   Make sure you have Python 3 installed.
    *   Open a terminal or command prompt.
    *   Navigate to the project directory (where `login-page.html` is).
    *   Run the command: `python3 -m http.server`
    *   Open your web browser and go to `http://localhost:8000/login-page.html`.

5.  **Deploying (e.g., GitHub Pages):**
    *   See the GitHub Pages configuration section below.

## Google Sheet Structure

### `Users` Sheet
| phoneNumber | password   | userType | name          |
|-------------|------------|----------|---------------|
| 1234567890  | pass123    | mentor   | John Mentor   |
| 9876543210  | securePass | officer  | Susan Officer |

### `TAs` Sheet
| taId | name         | department | status   |
|------|--------------|------------|----------|
| ta1  | Alex Johnson | IT         | active   |
| ta2  | Maria Garcia | HR         | active   |
| ta3  | Sam Wilson   | Finance    | inactive |

### `Ratings` Sheet (Auto-created)
Headers: `ratingId`, `taId`, `taName`, `raterPhone`, `raterName`, `raterType`, `timestamp`, `discipline`, `ethics`, `knowledge`, `communication`, `teamwork`, `comments`

## Files

*   `login-page.html`: Main HTML structure for all screens (Login, TA Select, Rating, Confirmation).
*   `styles.css`: CSS for styling the application.
*   `script.js`: Client-side JavaScript handling login, fetching data (users, TAs), UI logic, form validation, rating submission, and communication with the Apps Script.
*   `googleAppScript.js`: Server-side Google Apps Script code that acts as the backend API. It reads data from and writes data to the linked Google Sheet.
*   `changes.txt`: Summary of initial changes for the first commit. 