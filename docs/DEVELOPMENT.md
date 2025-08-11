# TA Rating System - Development Setup

This project now includes a modern development environment with hot reload capabilities using Vite.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (comes with Node.js)

### Setup & Installation

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

2. **Or manually install dependencies:**
   ```bash
   npm install
   ```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build
npm run serve
```

## 🔥 Hot Reload Features

The development server includes:
- **Instant CSS updates** - Changes to styles.css are applied immediately
- **JavaScript hot reload** - Module changes trigger automatic page updates
- **Live reload** - Full page reload for HTML changes
- **Error overlay** - Build errors displayed in the browser

## 🌐 Development Server

- **URL:** http://localhost:3000
- **Hot reload port:** 3001
- **Auto-open browser:** Enabled

## 📁 Project Structure

```
ta-rating-system/
├── js/
│   ├── main.js          # Main entry point (ES6 modules)
│   ├── config.js        # Configuration (now exports)
│   ├── state.js         # State management (now exports)
│   └── ...              # Other modules
├── css/                 # Modular CSS files
├── images/              # Static assets
├── index.html           # Main HTML file
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies and scripts
└── dist/                # Production build output
```

## 🛠 Build Configuration

The Vite configuration includes:
- **Legacy browser support** - IE 11+ compatibility
- **Code splitting** - Automatic chunking for better performance
- **CSS preprocessing** - Enhanced CSS handling
- **Asset optimization** - Automatic image and file optimization
- **Source maps** - For debugging in development

## 🚨 Troubleshooting

### Port Already in Use
If port 3000 is busy, Vite will automatically try the next available port.

### Module Import Errors
The project is being gradually converted to ES6 modules. Some files may still need conversion.

### Hot Reload Not Working
1. Check browser console for errors
2. Ensure you're accessing via http://localhost:3000
3. Try clearing browser cache

## 🔄 Migration Notes

The project is transitioning from script tags to ES6 modules:
- ✅ `config.js` - Converted to export constants
- ✅ `state.js` - Converted to export appState
- 🔄 Other modules - Being converted gradually
- 🔄 Backward compatibility maintained during transition

## 📦 Dependencies

### Development Dependencies
- **Vite** - Fast build tool and dev server
- **@vitejs/plugin-legacy** - Legacy browser support
- **Terser** - JavaScript minification

### Production Dependencies
- None required - vanilla JavaScript application
