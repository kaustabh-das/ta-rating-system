import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  // Root directory for the project
  root: '.',
  
  // Base public path when served in development or production
  // Use relative paths for GitHub Pages deployment
  base: './',
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Allow external access
    open: true, // Automatically open browser
    cors: true,
    hmr: {
      port: 3001
    }
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html'
      },
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          utils: ['./js/ui-utils.js', './js/date-utils.js'],
          managers: ['./js/ta-manager.js', './js/rating-manager.js', './js/screen-manager.js'],
          services: ['./js/api-service.js', './js/auth-manager.js']
        }
      }
    },
    // Minify for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // CSS configuration
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },
  
  // Plugin configuration
  plugins: [
    // Legacy browser support
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  
  // Dependency optimization
  optimizeDeps: {
    include: []
  },
  
  // Asset handling
  assetsInclude: ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.gif', '**/*.svg'],
  
  // Preview server (for production build testing)
  preview: {
    port: 3000,
    host: true
  }
})
