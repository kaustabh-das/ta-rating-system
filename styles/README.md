# TA Rating System - CSS Structure

The CSS for the TA Rating System has been organized into modular, screen-based files for better maintainability and organization.

## File Structure

```
styles/
├── index.css                 # Main entry point that imports all other files
├── base.css                  # Base styles, CSS variables, and common components
├── login.css                 # Login screen specific styles
├── dashboard.css             # Dashboard/TA Selection screen styles
├── rating.css                # Rating screen styles
├── success.css               # Success/Confirmation screen styles
├── review-management.css     # Review management screen styles
├── rating-components.css     # Rating-related components and tables
├── modal.css                 # Modal and dialog styles
└── responsive.css            # Responsive design and utility classes
```

## Screen Mapping

### 1. **Login Screen** (`login.css`)
- **Container ID**: `loginContainer`
- **Class**: `.login-screen`
- **Components**: Login form, authentication elements, background overlay
- **Features**: Glassmorphism card design, form validation styling

### 2. **Dashboard Screen** (`dashboard.css`)
- **Container ID**: `taSelectionContainer`
- **Class**: `.dashboard-screen`
- **Components**: TA selection dropdown, custom select components
- **Features**: Custom dropdown styling, selection card design

### 3. **Rating Screen** (`rating.css`)
- **Container ID**: `ratingContainer`
- **Class**: `.rating-screen`
- **Components**: Rating forms, star ratings, period badges
- **Features**: Star rating interactions, form styling, glassmorphism design

### 4. **Success Screen** (`success.css`)
- **Container ID**: `confirmationContainer`
- **Class**: `.success-screen`
- **Components**: Success animations, confirmation messages
- **Features**: Animated success icon, pulse animations

### 5. **Review Management Screen** (`review-management.css`)
- **Container ID**: `reviewManagementContainer`
- **Class**: `.management-screen`
- **Components**: Review lists, rating displays, management controls
- **Features**: Modern card layouts, dropdown controls

### 6. **Modal** (`modal.css`)
- **Container ID**: `dateRangeModal`
- **Class**: `.modal`
- **Components**: Date range selection, modal dialogs
- **Features**: Backdrop blur, modal animations

## Key Benefits

1. **Modularity**: Each screen has its own CSS file, making it easy to maintain and modify specific screens without affecting others.

2. **Organization**: Related styles are grouped together, making the codebase more readable and maintainable.

3. **Performance**: Only load styles for components that are actually used.

4. **Maintainability**: Easier to debug and modify screen-specific styles.

5. **Scalability**: Easy to add new screens or modify existing ones without touching unrelated code.

## Usage

The main entry point is `styles/index.css` which imports all the individual screen files. The HTML file has been updated to use this new structure:

```html
<link rel="stylesheet" href="styles/index.css">
```

## CSS Architecture

- **CSS Custom Properties**: All design tokens (colors, spacing, typography) are defined in `base.css`
- **Component-Based**: Common components like buttons, forms, and loading states are in `base.css`
- **Screen-Specific**: Each screen's unique styles are isolated in their respective files
- **Responsive**: All responsive design rules are centralized in `responsive.css`
- **Utilities**: Helper classes and utility styles are in `responsive.css`

## Responsive Design

The system uses a mobile-first approach with breakpoints at:
- **1024px and below**: Tablet styles
- **768px and below**: Mobile styles  
- **480px and below**: Small mobile styles
- **320px and below**: Ultra-small mobile styles

All responsive styles are consolidated in `responsive.css` for easy maintenance.
