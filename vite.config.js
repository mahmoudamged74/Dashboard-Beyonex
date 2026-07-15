import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('redux')) {
            return 'redux'
          }
          if (id.includes('react-quill') || id.includes('quill')) return 'quill'
          if (id.includes('react-router')) return 'react-router'
          if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n'
          if (id.includes('axios')) return 'axios'
          if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
          if (id.includes('react-toastify')) return 'toastify'

          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
